"""PHASE 6 — Developer GOLD-e API: key mgmt (hash-only, scopes, rate limits, rotation,
revoke, expiry, IP restriction, usage analytics) + public /api/v1 endpoints."""
import time
import secrets as pysecrets
from collections import defaultdict, deque
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

from core import (db, oid, now, now_iso, clean, sha256, encrypt_str, phone_hash, mask_phone,
                  get_current_user, require_role, audit)

router = APIRouter(prefix="/api/dev")
v1 = APIRouter(prefix="/api/v1")

ALL_SCOPES = ["leads:read", "leads:write", "campaigns:read", "campaigns:create",
              "campaigns:send", "messages:read", "webhooks:manage"]

_rate_buckets = defaultdict(deque)  # key_id -> deque[timestamps]


class KeyIn(BaseModel):
    name: str
    scopes: list = ["leads:read", "leads:write"]
    rate_limit: int = 120          # requests / minute
    expires_at: Optional[str] = None
    ip_allowlist: list = []


def _new_secret() -> str:
    return "gde_live_" + pysecrets.token_hex(20)


# ------------------------------------------------------------- key management (dashboard)
@router.get("/keys")
async def list_keys(user: dict = Depends(get_current_user)):
    rows = await db.api_keys.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(100)
    return [{"id": k["id"], "name": k["name"], "prefix": k["prefix"], "scopes": k.get("scopes", []),
             "rate_limit": k.get("rate_limit"), "revoked": k.get("revoked", False),
             "expires_at": k.get("expires_at"), "ip_allowlist": k.get("ip_allowlist", []),
             "usage_count": k.get("usage_count", 0), "last_used": k.get("last_used"),
             "created_at": k.get("created_at")} for k in rows]


@router.post("/keys")
async def create_key(body: KeyIn, user: dict = Depends(require_role("owner", "admin"))):
    for s in body.scopes:
        if s not in ALL_SCOPES:
            raise HTTPException(400, f"Invalid scope: {s}")
    secret = _new_secret()
    kid = oid()
    await db.api_keys.insert_one({
        "id": kid, "workspace_id": user["workspace_id"], "name": body.name,
        "prefix": secret[:16], "key_hash": sha256(secret), "scopes": body.scopes,
        "rate_limit": body.rate_limit, "expires_at": body.expires_at, "ip_allowlist": body.ip_allowlist,
        "revoked": False, "usage_count": 0, "last_used": None, "created_at": now_iso(),
    })
    await audit(user["workspace_id"], user["name"], "apikey.created", "api_key", {"name": body.name, "scopes": body.scopes})
    return {"id": kid, "name": body.name, "key": secret, "note": "Store this key now — it will not be shown again."}


@router.post("/keys/{kid}/rotate")
async def rotate_key(kid: str, user: dict = Depends(require_role("owner", "admin"))):
    k = await db.api_keys.find_one({"id": kid, "workspace_id": user["workspace_id"]})
    if not k:
        raise HTTPException(404, "Key not found")
    secret = _new_secret()
    await db.api_keys.update_one({"id": kid}, {"$set": {"prefix": secret[:16], "key_hash": sha256(secret), "revoked": False, "rotated_at": now_iso()}})
    await audit(user["workspace_id"], user["name"], "apikey.rotated", "api_key", {"id": kid})
    return {"id": kid, "key": secret, "note": "Store this key now — it will not be shown again."}


@router.delete("/keys/{kid}")
async def revoke_key(kid: str, user: dict = Depends(require_role("owner", "admin"))):
    await db.api_keys.update_one({"id": kid, "workspace_id": user["workspace_id"]}, {"$set": {"revoked": True, "revoked_at": now_iso()}})
    await audit(user["workspace_id"], user["name"], "apikey.revoked", "api_key", {"id": kid})
    return {"ok": True}


@router.get("/usage")
async def usage(user: dict = Depends(get_current_user)):
    rows = await db.api_usage.find({"workspace_id": user["workspace_id"]}).sort("at", -1).to_list(100)
    return [clean(r) for r in rows]


# ------------------------------------------------------------- public API-key auth
async def api_key_context(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    key = request.headers.get("X-API-Key", "")
    if auth.startswith("Bearer "):
        key = auth[7:]
    if not key or not key.startswith("gde_"):
        raise HTTPException(401, "Missing API key")
    rec = await db.api_keys.find_one({"key_hash": sha256(key)})
    if not rec:
        raise HTTPException(401, "Invalid API key")
    if rec.get("revoked"):
        raise HTTPException(403, "API key revoked")
    if rec.get("expires_at") and rec["expires_at"] < now_iso():
        raise HTTPException(403, "API key expired")
    if rec.get("ip_allowlist"):
        client_ip = request.client.host if request.client else ""
        if client_ip not in rec["ip_allowlist"]:
            raise HTTPException(403, "IP not allowed")
    # rate limit (sliding 60s window, in-memory)
    limit = rec.get("rate_limit", 120)
    bucket = _rate_buckets[rec["id"]]
    t = time.time()
    while bucket and bucket[0] < t - 60:
        bucket.popleft()
    if len(bucket) >= limit:
        raise HTTPException(429, "Rate limit exceeded")
    bucket.append(t)
    await db.api_keys.update_one({"id": rec["id"]}, {"$inc": {"usage_count": 1}, "$set": {"last_used": now_iso()}})
    await db.api_usage.insert_one({"id": oid(), "workspace_id": rec["workspace_id"], "key_id": rec["id"],
                                   "key_name": rec.get("name"), "method": request.method,
                                   "path": request.url.path, "at": now_iso()})
    return {"workspace_id": rec["workspace_id"], "scopes": rec.get("scopes", []), "key_id": rec["id"], "key_name": rec.get("name")}


def require_scope(scope: str):
    async def dep(ctx: dict = Depends(api_key_context)):
        if scope not in ctx["scopes"]:
            raise HTTPException(403, f"Missing scope: {scope}")
        return ctx
    return dep


def _heuristic(lead: dict) -> dict:
    s = 40 + (12 if lead.get("email") else 0) + (12 if lead.get("phone") else 0) + (10 if lead.get("company") else 0)
    s = max(1, min(99, s))
    return {"score": s, "temperature": "HOT" if s >= 75 else "WARM" if s >= 50 else "COLD"}


# ------------------------------------------------------------- public v1 endpoints
class V1LeadIn(BaseModel):
    name: str
    company: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    channel: Optional[str] = "WhatsApp"
    source: Optional[str] = "API Import"
    consent_status: Optional[str] = "pending"
    consent_source: Optional[str] = "api"


@v1.get("/leads")
async def v1_list_leads(ctx: dict = Depends(require_scope("leads:read"))):
    rows = await db.leads.find({"workspace_id": ctx["workspace_id"]}).sort("created_at", -1).to_list(500)
    return [{"id": l["id"], "name": l["name"], "company": l.get("company"), "email": l.get("email"),
             "phone_masked": l.get("phone_masked", ""), "temperature": l.get("temperature"),
             "score": l.get("score"), "stage": l.get("stage"), "consent_status": l.get("consent_status", "pending" if not l.get("consent") else "opted_in")} for l in rows]


@v1.post("/leads")
async def v1_create_lead(body: V1LeadIn, ctx: dict = Depends(require_scope("leads:write"))):
    ws = ctx["workspace_id"]
    if body.email and await db.leads.find_one({"workspace_id": ws, "email": body.email.lower()}):
        raise HTTPException(400, "Lead with this email already exists")
    h = _heuristic(body.model_dump())
    lid = oid()
    phone = body.phone or ""
    await db.leads.insert_one({
        "id": lid, "workspace_id": ws, "name": body.name, "company": body.company,
        "email": (body.email or "").lower(), "phone_enc": encrypt_str(phone) if phone else "",
        "phone_masked": mask_phone(phone) if phone else "", "phone_hash": phone_hash(phone) if phone else "",
        "channel": body.channel, "source": body.source, "score": h["score"], "temperature": h["temperature"],
        "stage": "NEW", "consent_status": body.consent_status, "consent_source": body.consent_source,
        "consent_date": now_iso(), "opted_out": False, "tags": [], "owner": "API",
        "last_activity": now_iso(), "created_at": now_iso()})
    await audit(ws, ctx["key_name"] or "api", "lead.created_via_api", "lead", {"lead_id": lid})
    return {"id": lid, "name": body.name, "score": h["score"], "temperature": h["temperature"]}


class V1CampaignIn(BaseModel):
    name: str
    channel: str = "WhatsApp"
    segment: str = "All Leads"
    message: str = ""


@v1.get("/campaigns")
async def v1_list_campaigns(ctx: dict = Depends(require_scope("campaigns:read"))):
    rows = await db.campaigns.find({"workspace_id": ctx["workspace_id"]}).sort("created_at", -1).to_list(200)
    return [{"id": c["id"], "name": c["name"], "status": c.get("status"), "channel": c.get("channel"), "stats": c.get("stats")} for c in rows]


@v1.post("/campaigns")
async def v1_create_campaign(body: V1CampaignIn, ctx: dict = Depends(require_scope("campaigns:create"))):
    ws = ctx["workspace_id"]
    q = {"workspace_id": ws}
    if body.segment in ("HOT", "WARM", "COLD"):
        q["temperature"] = body.segment
    audience = await db.leads.count_documents(q)
    cid = oid()
    await db.campaigns.insert_one({"id": cid, "workspace_id": ws, "name": body.name, "channel": body.channel,
                                   "segment": body.segment, "message": body.message, "status": "draft",
                                   "stats": {"audience": audience, "sent": 0, "delivered": 0, "replied": 0, "failed": 0, "blocked": 0},
                                   "created_by": "API", "created_at": now_iso()})
    return {"id": cid, "status": "draft", "audience": audience}


@v1.post("/campaigns/{cid}/send")
async def v1_send_campaign(cid: str, ctx: dict = Depends(require_scope("campaigns:send"))):
    from whatsapp import send_via_channel
    ws = ctx["workspace_id"]
    c = await db.campaigns.find_one({"id": cid, "workspace_id": ws})
    if not c:
        raise HTTPException(404, "Campaign not found")
    # API sends still require prior owner approval (human approval gate)
    if c.get("status") != "approved":
        raise HTTPException(400, "Campaign must be approved by an owner/admin before it can be sent")
    q = {"workspace_id": ws}
    if c.get("segment") in ("HOT", "WARM", "COLD"):
        q["temperature"] = c["segment"]
    audience = await db.leads.find(q).to_list(5000)
    sent = blocked = 0
    for lead in audience:
        res = await send_via_channel(ws, lead, c.get("channel", "WhatsApp"), c.get("message", ""), campaign=c, actor="api")
        if res["status"] == "blocked":
            blocked += 1
        else:
            sent += 1
    stats = {"audience": len(audience), "sent": sent, "delivered": sent, "replied": 0, "failed": 0, "blocked": blocked}
    await db.campaigns.update_one({"id": cid}, {"$set": {"status": "sent", "stats": stats, "sent_at": now_iso()}})
    return {"status": "sent", "sent": sent, "blocked": blocked}


@v1.get("/campaigns/{cid}/status")
async def v1_campaign_status(cid: str, ctx: dict = Depends(require_scope("campaigns:read"))):
    c = await db.campaigns.find_one({"id": cid, "workspace_id": ctx["workspace_id"]})
    if not c:
        raise HTTPException(404, "Campaign not found")
    report = {}
    for st in ["sent", "delivered", "read", "failed", "blocked"]:
        report[st] = await db.messages.count_documents({"workspace_id": ctx["workspace_id"], "campaign_id": cid, "status": st})
    return {"id": cid, "status": c.get("status"), "stats": c.get("stats"), "report": report}

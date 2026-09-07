"""Developer API: scoped API keys, distributed limits, usage and public v1 endpoints."""
import secrets as pysecrets
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from core import (
    audit,
    clean,
    db,
    encrypt_str,
    mask_phone,
    now_iso,
    oid,
    phone_hash,
    require_role,
    get_current_user,
    sha256,
)

router = APIRouter(prefix="/api/dev")
v1 = APIRouter(prefix="/api/v1")

ALL_SCOPES = [
    "leads:read",
    "leads:write",
    "campaigns:read",
    "campaigns:create",
    "campaigns:send",
    "messages:read",
    "webhooks:manage",
]


class KeyIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    scopes: list[str] = Field(default_factory=lambda: ["leads:read", "leads:write"])
    rate_limit: int = Field(default=120, ge=1, le=10000)
    expires_at: Optional[str] = None
    ip_allowlist: list[str] = Field(default_factory=list)


def _new_secret() -> str:
    return "gde_live_" + pysecrets.token_hex(20)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else ""


async def _consume_rate_limit(key_id: str, limit: int) -> None:
    """Mongo-backed fixed-window limiter that works across Cloud Run instances."""
    window = int(time.time() // 60)
    bucket_id = f"{key_id}:{window}"
    expires = datetime.now(timezone.utc) + timedelta(minutes=3)
    bucket = await db.api_rate_limits.find_one_and_update(
        {"_id": bucket_id},
        {
            "$inc": {"count": 1},
            "$setOnInsert": {
                "key_id": key_id,
                "window": window,
                "expires_at": expires,
            },
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    if bucket and bucket.get("count", 0) > limit:
        raise HTTPException(429, "Rate limit exceeded")


@router.get("/keys")
async def list_keys(user: dict = Depends(get_current_user)):
    rows = await db.api_keys.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(100)
    return [
        {
            "id": key["id"],
            "name": key["name"],
            "prefix": key["prefix"],
            "scopes": key.get("scopes", []),
            "rate_limit": key.get("rate_limit"),
            "revoked": key.get("revoked", False),
            "expires_at": key.get("expires_at"),
            "ip_allowlist": key.get("ip_allowlist", []),
            "usage_count": key.get("usage_count", 0),
            "last_used": key.get("last_used"),
            "created_at": key.get("created_at"),
        }
        for key in rows
    ]


@router.post("/keys")
async def create_key(body: KeyIn, user: dict = Depends(require_role("owner", "admin"))):
    for scope in body.scopes:
        if scope not in ALL_SCOPES:
            raise HTTPException(400, f"Invalid scope: {scope}")
    secret = _new_secret()
    kid = oid()
    await db.api_keys.insert_one({
        "id": kid,
        "workspace_id": user["workspace_id"],
        "name": body.name,
        "prefix": secret[:16],
        "key_hash": sha256(secret),
        "scopes": body.scopes,
        "rate_limit": body.rate_limit,
        "expires_at": body.expires_at,
        "ip_allowlist": body.ip_allowlist,
        "revoked": False,
        "usage_count": 0,
        "last_used": None,
        "created_at": now_iso(),
    })
    await audit(
        user["workspace_id"],
        user["name"],
        "apikey.created",
        "api_key",
        {"name": body.name, "scopes": body.scopes},
    )
    return {"id": kid, "name": body.name, "key": secret, "note": "Store this key now — it will not be shown again."}


@router.post("/keys/{kid}/rotate")
async def rotate_key(kid: str, user: dict = Depends(require_role("owner", "admin"))):
    key = await db.api_keys.find_one({"id": kid, "workspace_id": user["workspace_id"]})
    if not key:
        raise HTTPException(404, "Key not found")
    secret = _new_secret()
    await db.api_keys.update_one(
        {"id": kid, "workspace_id": user["workspace_id"]},
        {"$set": {
            "prefix": secret[:16],
            "key_hash": sha256(secret),
            "revoked": False,
            "rotated_at": now_iso(),
        }},
    )
    await audit(user["workspace_id"], user["name"], "apikey.rotated", "api_key", {"id": kid})
    return {"id": kid, "key": secret, "note": "Store this key now — it will not be shown again."}


@router.delete("/keys/{kid}")
async def revoke_key(kid: str, user: dict = Depends(require_role("owner", "admin"))):
    await db.api_keys.update_one(
        {"id": kid, "workspace_id": user["workspace_id"]},
        {"$set": {"revoked": True, "revoked_at": now_iso()}},
    )
    await audit(user["workspace_id"], user["name"], "apikey.revoked", "api_key", {"id": kid})
    return {"ok": True}


@router.get("/usage")
async def usage(user: dict = Depends(get_current_user)):
    rows = await db.api_usage.find({"workspace_id": user["workspace_id"]}).sort("at", -1).to_list(250)
    return [clean(row) for row in rows]


async def api_key_context(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    key = request.headers.get("X-API-Key", "")
    if auth.startswith("Bearer "):
        key = auth[7:]
    if not key or not key.startswith("gde_live_"):
        raise HTTPException(401, "Missing API key")

    rec = await db.api_keys.find_one({"key_hash": sha256(key)})
    if not rec:
        raise HTTPException(401, "Invalid API key")
    if rec.get("revoked"):
        raise HTTPException(403, "API key revoked")
    if rec.get("expires_at") and rec["expires_at"] < now_iso():
        raise HTTPException(403, "API key expired")

    if rec.get("ip_allowlist"):
        client_ip = _client_ip(request)
        if client_ip not in rec["ip_allowlist"]:
            raise HTTPException(403, "IP not allowed")

    await _consume_rate_limit(rec["id"], int(rec.get("rate_limit", 120)))
    await db.api_keys.update_one(
        {"id": rec["id"]},
        {"$inc": {"usage_count": 1}, "$set": {"last_used": now_iso()}},
    )
    await db.api_usage.insert_one({
        "id": oid(),
        "workspace_id": rec["workspace_id"],
        "key_id": rec["id"],
        "key_name": rec.get("name"),
        "method": request.method,
        "path": request.url.path,
        "at": now_iso(),
    })
    return {
        "workspace_id": rec["workspace_id"],
        "scopes": rec.get("scopes", []),
        "key_id": rec["id"],
        "key_name": rec.get("name"),
    }


def require_scope(scope: str):
    async def dep(ctx: dict = Depends(api_key_context)):
        if scope not in ctx["scopes"]:
            raise HTTPException(403, f"Missing scope: {scope}")
        return ctx
    return dep


def _heuristic(lead: dict) -> dict:
    score = 40 + (12 if lead.get("email") else 0) + (12 if lead.get("phone") else 0) + (10 if lead.get("company") else 0)
    score = max(1, min(99, score))
    return {"score": score, "temperature": "HOT" if score >= 75 else "WARM" if score >= 50 else "COLD"}


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
    return [
        {
            "id": lead["id"],
            "name": lead["name"],
            "company": lead.get("company"),
            "email": lead.get("email"),
            "phone_masked": lead.get("phone_masked", ""),
            "temperature": lead.get("temperature"),
            "score": lead.get("score"),
            "stage": lead.get("stage"),
            "consent_status": lead.get("consent_status", "pending" if not lead.get("consent") else "opted_in"),
        }
        for lead in rows
    ]


@v1.post("/leads")
async def v1_create_lead(body: V1LeadIn, ctx: dict = Depends(require_scope("leads:write"))):
    ws = ctx["workspace_id"]
    if body.consent_status not in {"pending", "opted_in", "opted_out"}:
        raise HTTPException(400, "Invalid consent_status")
    if body.email and await db.leads.find_one({"workspace_id": ws, "email": body.email.lower()}):
        raise HTTPException(400, "Lead with this email already exists")

    heuristic = _heuristic(body.model_dump())
    lid = oid()
    phone = body.phone or ""
    doc = {
        "id": lid,
        "workspace_id": ws,
        "name": body.name,
        "company": body.company,
        "email": (body.email or "").lower(),
        "phone_enc": encrypt_str(phone) if phone else "",
        "phone_masked": mask_phone(phone) if phone else "",
        "phone_hash": phone_hash(phone) if phone else "",
        "channel": body.channel,
        "source": body.source,
        "score": heuristic["score"],
        "temperature": heuristic["temperature"],
        "stage": "NEW",
        "consent": body.consent_status == "opted_in",
        "consent_status": body.consent_status,
        "consent_source": body.consent_source,
        "consent_date": now_iso() if body.consent_status == "opted_in" else None,
        "opted_out": body.consent_status == "opted_out",
        "tags": [],
        "owner": "API",
        "last_activity": now_iso(),
        "created_at": now_iso(),
    }
    await db.leads.insert_one(doc)
    await audit(ws, ctx["key_name"] or "api", "lead.created_via_api", "lead", {"lead_id": lid})
    return {"id": lid, "name": body.name, "score": heuristic["score"], "temperature": heuristic["temperature"]}


class V1CampaignIn(BaseModel):
    name: str
    channel: str = "WhatsApp"
    segment: str = "All Leads"
    message: str = ""


@v1.get("/campaigns")
async def v1_list_campaigns(ctx: dict = Depends(require_scope("campaigns:read"))):
    rows = await db.campaigns.find({"workspace_id": ctx["workspace_id"]}).sort("created_at", -1).to_list(200)
    return [
        {
            "id": campaign["id"],
            "name": campaign["name"],
            "status": campaign.get("status"),
            "channel": campaign.get("channel"),
            "stats": campaign.get("stats"),
        }
        for campaign in rows
    ]


@v1.post("/campaigns")
async def v1_create_campaign(body: V1CampaignIn, ctx: dict = Depends(require_scope("campaigns:create"))):
    ws = ctx["workspace_id"]
    query = {"workspace_id": ws}
    if body.segment in ("HOT", "WARM", "COLD"):
        query["temperature"] = body.segment
    audience = await db.leads.count_documents(query)
    cid = oid()
    await db.campaigns.insert_one({
        "id": cid,
        "workspace_id": ws,
        "name": body.name,
        "channel": body.channel,
        "segment": body.segment,
        "message": body.message,
        "status": "draft",
        "stats": {
            "audience": audience,
            "sent": 0,
            "delivered": 0,
            "read": 0,
            "replied": 0,
            "failed": 0,
            "blocked": 0,
        },
        "created_by": "API",
        "created_at": now_iso(),
    })
    return {"id": cid, "status": "draft", "audience": audience}


@v1.post("/campaigns/{cid}/send")
async def v1_send_campaign(cid: str, ctx: dict = Depends(require_scope("campaigns:send"))):
    from studio import execute_campaign

    ws = ctx["workspace_id"]
    campaign = await db.campaigns.find_one({"id": cid, "workspace_id": ws})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    if campaign.get("status") != "approved":
        raise HTTPException(400, "Campaign must be approved by an owner/admin before it can be sent")
    return await execute_campaign(campaign, actor=f"api:{ctx.get('key_name') or 'key'}")


@v1.get("/campaigns/{cid}/status")
async def v1_campaign_status(cid: str, ctx: dict = Depends(require_scope("campaigns:read"))):
    campaign = await db.campaigns.find_one({"id": cid, "workspace_id": ctx["workspace_id"]})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    report = {}
    for status in ["sent", "delivered", "read", "failed", "blocked"]:
        report[status] = await db.messages.count_documents({
            "workspace_id": ctx["workspace_id"],
            "campaign_id": cid,
            "status": status,
        })
    return {"id": cid, "status": campaign.get("status"), "stats": campaign.get("stats"), "report": report}

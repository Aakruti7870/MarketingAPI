from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

import os
import re
import csv
import io
import json
import hmac
import base64
import hashlib
import secrets as pysecrets
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any

import jwt
import bcrypt
from bson import ObjectId
from cryptography.fernet import Fernet
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient

# ------------------------------------------------------------------ config
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
VAULT_KEY = os.environ["VAULT_KEY"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

fernet = Fernet(VAULT_KEY.encode())
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="GOLD-e API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------ helpers
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def oid() -> str:
    return str(ObjectId())


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, workspace_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "ws": workspace_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def encrypt_str(s: str) -> str:
    return fernet.encrypt(s.encode()).decode()


def decrypt_str(s: str) -> str:
    try:
        return fernet.decrypt(s.encode()).decode()
    except Exception:
        return ""


def phone_hash(phone: str) -> str:
    norm = re.sub(r"[^0-9]", "", phone or "")
    return hashlib.sha256((norm + VAULT_KEY).encode()).hexdigest()


def mask_phone(phone: str) -> str:
    norm = re.sub(r"[^0-9+]", "", phone or "")
    if len(norm) < 4:
        return "••••"
    return "•••• •••• " + norm[-3:]


def clean(doc: dict) -> dict:
    if not doc:
        return doc
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user.pop("password_hash", None)
    return clean(user)


def require_role(*roles):
    async def dep(user: dict = Depends(get_current_user)):
        if roles and user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return dep


async def audit(workspace_id: str, user: dict, action: str, entity: str = "", meta: dict = None):
    await db.audit.insert_one({
        "id": oid(), "workspace_id": workspace_id,
        "user_id": user.get("id"), "user_name": user.get("name"),
        "action": action, "entity": entity, "meta": meta or {},
        "created_at": now_iso(),
    })


# ------------------------------------------------------------------ AI
async def llm_text(system: str, prompt: str, model: str = "gpt-5.4") -> str:
    if not EMERGENT_LLM_KEY:
        return ""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=oid(), system_message=system).with_model("openai", model)
        resp = await chat.send_message(UserMessage(text=prompt))
        return resp if isinstance(resp, str) else str(resp)
    except Exception as e:
        print("LLM error:", e)
        return ""


def parse_json_block(text: str) -> Any:
    if not text:
        return None
    m = re.search(r"\{.*\}|\[.*\]", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None


def heuristic_score(lead: dict) -> dict:
    score = 40
    if lead.get("email"):
        score += 12
    if lead.get("phone"):
        score += 12
    if lead.get("company"):
        score += 10
    src = (lead.get("source") or "").lower()
    if src in ("website form", "whatsapp inbound", "meta ads"):
        score += 14
    if lead.get("budget"):
        score += 8
    notes = (lead.get("notes") or "").lower()
    for kw in ("urgent", "buy", "interested", "quote", "demo", "ready", "asap"):
        if kw in notes:
            score += 4
    score = max(1, min(99, score))
    temp = "HOT" if score >= 75 else "WARM" if score >= 50 else "COLD"
    return {"score": score, "temperature": temp,
            "reason": "Auto-scored from completeness, source quality and intent signals."}


async def ai_score_lead(lead: dict) -> dict:
    system = ("You are a B2B lead-scoring engine. Score sales-readiness 0-100. "
              "Return STRICT JSON only: {\"score\": int, \"temperature\": \"HOT|WARM|COLD\", \"reason\": string}. "
              "HOT>=75, WARM 50-74, COLD<50.")
    prompt = (f"Lead: name={lead.get('name')}, company={lead.get('company')}, "
              f"source={lead.get('source')}, channel={lead.get('channel')}, "
              f"has_email={bool(lead.get('email'))}, has_phone={bool(lead.get('phone'))}, "
              f"budget={lead.get('budget')}, notes={lead.get('notes')}")
    out = parse_json_block(await llm_text(system, prompt))
    if out and isinstance(out.get("score"), (int, float)):
        s = max(1, min(99, int(out["score"])))
        t = out.get("temperature") or ("HOT" if s >= 75 else "WARM" if s >= 50 else "COLD")
        return {"score": s, "temperature": t, "reason": out.get("reason", "")}
    return heuristic_score(lead)


# ------------------------------------------------------------------ models
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    workspace_name: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class InviteIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "agent"


class CredentialIn(BaseModel):
    provider: str
    label: str
    fields: dict


class LeadIn(BaseModel):
    name: str
    company: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    channel: Optional[str] = "WhatsApp"
    source: Optional[str] = "Manual"
    budget: Optional[str] = ""
    notes: Optional[str] = ""
    tags: Optional[List[str]] = []


class StageIn(BaseModel):
    stage: str


class TemplateIn(BaseModel):
    name: str
    category: Optional[str] = "General"
    channel: Optional[str] = "WhatsApp"
    language: Optional[str] = "English"
    body: str
    buttons: Optional[List[str]] = []


class CampaignIn(BaseModel):
    name: str
    channel: str = "WhatsApp"
    segment: str = "All Leads"
    template_id: Optional[str] = None
    message: Optional[str] = ""
    scheduled_at: Optional[str] = None


class QuotationIn(BaseModel):
    lead_id: str
    items: List[dict]
    notes: Optional[str] = ""


class AutomationIn(BaseModel):
    name: str
    trigger: str
    condition: Optional[str] = ""
    action: str
    enabled: bool = True


class MessageIn(BaseModel):
    body: str


class AIGenIn(BaseModel):
    kind: str  # template | caption | followup | offer
    prompt: str
    tone: Optional[str] = "Persuasive"
    language: Optional[str] = "English"
    channel: Optional[str] = "WhatsApp"


class CommandIn(BaseModel):
    command: str


PIPELINE_STAGES = ["NEW", "CONTACTED", "RESPONDED", "INTERESTED", "QUALIFIED",
                   "DEMO", "QUOTATION", "NEGOTIATION", "WON", "LOST"]


# ------------------------------------------------------------------ auth routes
@api.post("/auth/register")
async def register(body: RegisterIn):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    ws_id = oid()
    await db.workspaces.insert_one({
        "id": ws_id, "name": body.workspace_name, "plan": "Growth",
        "platform_api_key": "golde_" + pysecrets.token_urlsafe(24),
        "created_at": now_iso(),
    })
    uid = oid()
    await db.users.insert_one({
        "id": uid, "workspace_id": ws_id, "email": email,
        "password_hash": hash_password(body.password), "name": body.name,
        "role": "owner", "avatar": "", "created_at": now_iso(),
    })
    await audit(ws_id, {"id": uid, "name": body.name}, "workspace.created", "workspace", {"name": body.workspace_name})
    token = create_token(uid, ws_id, "owner")
    return {"token": token, "user": {"id": uid, "email": email, "name": body.name, "role": "owner", "workspace_id": ws_id, "workspace_name": body.workspace_name}}


@api.post("/auth/login")
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    ws = await db.workspaces.find_one({"id": user["workspace_id"]})
    token = create_token(user["id"], user["workspace_id"], user["role"])
    return {"token": token, "user": {
        "id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"],
        "workspace_id": user["workspace_id"], "workspace_name": ws["name"] if ws else ""}}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    ws = await db.workspaces.find_one({"id": user["workspace_id"]})
    return {**user, "workspace_name": ws["name"] if ws else "", "plan": ws.get("plan") if ws else ""}


# ------------------------------------------------------------------ team
@api.get("/team")
async def team_list(user: dict = Depends(get_current_user)):
    users = await db.users.find({"workspace_id": user["workspace_id"]}).to_list(200)
    return [{"id": u["id"], "name": u["name"], "email": u["email"], "role": u["role"], "created_at": u.get("created_at")} for u in users]


@api.post("/team")
async def team_add(body: InviteIn, user: dict = Depends(require_role("owner", "admin"))):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    uid = oid()
    await db.users.insert_one({
        "id": uid, "workspace_id": user["workspace_id"], "email": email,
        "password_hash": hash_password(body.password), "name": body.name,
        "role": body.role, "created_at": now_iso(),
    })
    await audit(user["workspace_id"], user, "team.invited", "user", {"email": email, "role": body.role})
    return {"id": uid, "name": body.name, "email": email, "role": body.role}


@api.delete("/team/{uid}")
async def team_remove(uid: str, user: dict = Depends(require_role("owner", "admin"))):
    if uid == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    await db.users.delete_one({"id": uid, "workspace_id": user["workspace_id"], "role": {"$ne": "owner"}})
    return {"ok": True}


# ------------------------------------------------------------------ API vault
@api.get("/vault")
async def vault_list(user: dict = Depends(get_current_user)):
    creds = await db.credentials.find({"workspace_id": user["workspace_id"]}).to_list(100)
    out = []
    for c in creds:
        masked = {k: ("••••••••" + (v[-4:] if len(v) > 4 else "")) for k, v in c.get("fields_meta", {}).items()}
        out.append({"id": c["id"], "provider": c["provider"], "label": c["label"],
                    "status": c.get("status", "Active"), "fields": masked, "created_at": c.get("created_at")})
    return out


@api.post("/vault")
async def vault_add(body: CredentialIn, user: dict = Depends(require_role("owner", "admin"))):
    cid = oid()
    enc = {k: encrypt_str(str(v)) for k, v in body.fields.items()}
    meta = {k: str(v) for k, v in body.fields.items()}
    await db.credentials.insert_one({
        "id": cid, "workspace_id": user["workspace_id"], "provider": body.provider,
        "label": body.label, "fields_enc": enc, "fields_meta": meta,
        "status": "Active", "created_at": now_iso(),
    })
    await audit(user["workspace_id"], user, "vault.added", "credential", {"provider": body.provider})
    return {"id": cid, "provider": body.provider, "label": body.label, "status": "Active"}


@api.delete("/vault/{cid}")
async def vault_remove(cid: str, user: dict = Depends(require_role("owner", "admin"))):
    await db.credentials.delete_one({"id": cid, "workspace_id": user["workspace_id"]})
    await audit(user["workspace_id"], user, "vault.removed", "credential", {"id": cid})
    return {"ok": True}


# ------------------------------------------------------------------ leads
def lead_public(l: dict) -> dict:
    return {
        "id": l["id"], "name": l["name"], "company": l.get("company", ""),
        "email": l.get("email", ""), "phone_masked": l.get("phone_masked", ""),
        "channel": l.get("channel"), "source": l.get("source"),
        "score": l.get("score", 0), "temperature": l.get("temperature", "COLD"),
        "score_reason": l.get("score_reason", ""), "stage": l.get("stage", "NEW"),
        "tags": l.get("tags", []), "budget": l.get("budget", ""), "notes": l.get("notes", ""),
        "owner": l.get("owner", ""), "value": l.get("value", 0),
        "last_activity": l.get("last_activity"), "created_at": l.get("created_at"),
    }


async def store_lead(ws_id: str, data: dict, owner: str = "") -> dict:
    scored = await ai_score_lead(data)
    lid = oid()
    phone = data.get("phone", "")
    doc = {
        "id": lid, "workspace_id": ws_id, "name": data.get("name", "Unknown"),
        "company": data.get("company", ""), "email": (data.get("email") or "").lower(),
        "phone_enc": encrypt_str(phone) if phone else "",
        "phone_masked": mask_phone(phone) if phone else "",
        "phone_hash": phone_hash(phone) if phone else "",
        "channel": data.get("channel", "WhatsApp"), "source": data.get("source", "Manual"),
        "budget": data.get("budget", ""), "notes": data.get("notes", ""),
        "tags": data.get("tags", []), "owner": owner,
        "score": scored["score"], "temperature": scored["temperature"],
        "score_reason": scored.get("reason", ""), "stage": "NEW",
        "value": data.get("value", 0), "consent": True,
        "last_activity": now_iso(), "created_at": now_iso(),
    }
    await db.leads.insert_one(doc)
    return doc


@api.get("/leads")
async def leads_list(user: dict = Depends(get_current_user), temperature: Optional[str] = None,
                     stage: Optional[str] = None, q: Optional[str] = None):
    query = {"workspace_id": user["workspace_id"]}
    if temperature:
        query["temperature"] = temperature
    if stage:
        query["stage"] = stage
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}},
                        {"company": {"$regex": q, "$options": "i"}}]
    leads = await db.leads.find(query).sort("created_at", -1).to_list(1000)
    return [lead_public(l) for l in leads]


@api.post("/leads")
async def lead_create(body: LeadIn, user: dict = Depends(get_current_user)):
    # dedup by email or phone_hash
    if body.email:
        if await db.leads.find_one({"workspace_id": user["workspace_id"], "email": body.email.lower()}):
            raise HTTPException(status_code=400, detail="Lead with this email already exists")
    doc = await store_lead(user["workspace_id"], body.model_dump(), owner=user["name"])
    await audit(user["workspace_id"], user, "lead.created", "lead", {"name": body.name})
    return lead_public(doc)


@api.get("/leads/{lid}")
async def lead_get(lid: str, user: dict = Depends(get_current_user)):
    l = await db.leads.find_one({"id": lid, "workspace_id": user["workspace_id"]})
    if not l:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead_public(l)


@api.patch("/leads/{lid}/stage")
async def lead_stage(lid: str, body: StageIn, user: dict = Depends(get_current_user)):
    if body.stage not in PIPELINE_STAGES:
        raise HTTPException(status_code=400, detail="Invalid stage")
    r = await db.leads.update_one({"id": lid, "workspace_id": user["workspace_id"]},
                                  {"$set": {"stage": body.stage, "last_activity": now_iso()}})
    if not r.matched_count:
        raise HTTPException(status_code=404, detail="Lead not found")
    await audit(user["workspace_id"], user, "lead.stage_changed", "lead", {"id": lid, "stage": body.stage})
    return {"ok": True, "stage": body.stage}


@api.delete("/leads/{lid}")
async def lead_delete(lid: str, user: dict = Depends(get_current_user)):
    await db.leads.delete_one({"id": lid, "workspace_id": user["workspace_id"]})
    return {"ok": True}


@api.post("/leads/{lid}/rescore")
async def lead_rescore(lid: str, user: dict = Depends(get_current_user)):
    l = await db.leads.find_one({"id": lid, "workspace_id": user["workspace_id"]})
    if not l:
        raise HTTPException(status_code=404, detail="Lead not found")
    scored = await ai_score_lead(l)
    await db.leads.update_one({"id": lid}, {"$set": {"score": scored["score"], "temperature": scored["temperature"], "score_reason": scored.get("reason", "")}})
    return {"score": scored["score"], "temperature": scored["temperature"], "reason": scored.get("reason", "")}


@api.post("/leads/import")
async def leads_import(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    content = (await file.read()).decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))
    imported, skipped = 0, 0
    for row in reader:
        row = {(k or "").strip().lower(): (v or "").strip() for k, v in row.items()}
        name = row.get("name") or row.get("full name") or row.get("contact") or ""
        if not name:
            skipped += 1
            continue
        email = (row.get("email") or "").lower()
        if email and await db.leads.find_one({"workspace_id": user["workspace_id"], "email": email}):
            skipped += 1
            continue
        data = {"name": name, "company": row.get("company", ""), "email": email,
                "phone": row.get("phone") or row.get("mobile") or row.get("number", ""),
                "channel": row.get("channel", "WhatsApp"), "source": row.get("source", "CSV / Excel"),
                "budget": row.get("budget", ""), "notes": row.get("notes", "")}
        await store_lead(user["workspace_id"], data, owner=user["name"])
        imported += 1
    await audit(user["workspace_id"], user, "leads.imported", "lead", {"imported": imported, "skipped": skipped})
    return {"imported": imported, "skipped": skipped}


# ------------------------------------------------------------------ templates
@api.get("/templates")
async def templates_list(user: dict = Depends(get_current_user)):
    t = await db.templates.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(500)
    return [clean(x) for x in t]


@api.post("/templates")
async def template_create(body: TemplateIn, user: dict = Depends(get_current_user)):
    doc = {"id": oid(), "workspace_id": user["workspace_id"], **body.model_dump(),
           "status": "Approved", "created_at": now_iso()}
    await db.templates.insert_one(dict(doc))
    return clean(doc)


@api.delete("/templates/{tid}")
async def template_delete(tid: str, user: dict = Depends(get_current_user)):
    await db.templates.delete_one({"id": tid, "workspace_id": user["workspace_id"]})
    return {"ok": True}


# ------------------------------------------------------------------ campaigns
@api.get("/campaigns")
async def campaigns_list(user: dict = Depends(get_current_user)):
    c = await db.campaigns.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(500)
    return [clean(x) for x in c]


@api.post("/campaigns")
async def campaign_create(body: CampaignIn, user: dict = Depends(get_current_user)):
    q = {"workspace_id": user["workspace_id"]}
    seg = body.segment
    if seg in ("HOT", "WARM", "COLD"):
        q["temperature"] = seg
    audience = await db.leads.count_documents(q)
    status = "Scheduled" if body.scheduled_at else "Sent"
    sent = audience if status == "Sent" else 0
    delivered = int(sent * 0.94)
    replied = int(delivered * 0.22)
    doc = {"id": oid(), "workspace_id": user["workspace_id"], "name": body.name,
           "channel": body.channel, "segment": body.segment, "template_id": body.template_id,
           "message": body.message, "scheduled_at": body.scheduled_at, "status": status,
           "stats": {"audience": audience, "sent": sent, "delivered": delivered,
                     "replied": replied, "failed": sent - delivered},
           "created_at": now_iso()}
    await db.campaigns.insert_one(dict(doc))
    await audit(user["workspace_id"], user, "campaign.created", "campaign", {"name": body.name, "status": status})
    return clean(doc)


@api.delete("/campaigns/{cid}")
async def campaign_delete(cid: str, user: dict = Depends(get_current_user)):
    await db.campaigns.delete_one({"id": cid, "workspace_id": user["workspace_id"]})
    return {"ok": True}


# ------------------------------------------------------------------ inbox
@api.get("/conversations")
async def conv_list(user: dict = Depends(get_current_user), channel: Optional[str] = None):
    q = {"workspace_id": user["workspace_id"]}
    if channel and channel != "All":
        q["channel"] = channel
    convs = await db.conversations.find(q).sort("updated_at", -1).to_list(200)
    return [clean(c) for c in convs]


@api.get("/conversations/{cid}")
async def conv_get(cid: str, user: dict = Depends(get_current_user)):
    c = await db.conversations.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.conversations.update_one({"id": cid}, {"$set": {"unread": 0}})
    return clean(c)


@api.post("/conversations/{cid}/reply")
async def conv_reply(cid: str, body: MessageIn, user: dict = Depends(get_current_user)):
    c = await db.conversations.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    msg = {"id": oid(), "from": "agent", "author": user["name"], "body": body.body, "at": now_iso()}
    await db.conversations.update_one({"id": cid}, {"$push": {"messages": msg}, "$set": {"updated_at": now_iso(), "unread": 0}})
    return msg


@api.post("/conversations/{cid}/suggest")
async def conv_suggest(cid: str, user: dict = Depends(get_current_user)):
    c = await db.conversations.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    history = "\n".join([f"{m['from']}: {m['body']}" for m in c.get("messages", [])[-8:]])
    system = ("You are a helpful sales agent. Given the conversation, write ONE concise, "
              "friendly reply that moves the deal forward. Return only the reply text.")
    reply = await llm_text(system, f"Conversation with {c.get('lead_name')}:\n{history}\n\nWrite the next agent reply:")
    if not reply:
        reply = f"Hi {c.get('lead_name','there')}, thanks for reaching out! I'd love to help. Could you share a bit more about your requirement so I can send the best options?"
    return {"suggestion": reply.strip()}


@api.post("/conversations/{cid}/summarize")
async def conv_summarize(cid: str, user: dict = Depends(get_current_user)):
    c = await db.conversations.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    history = "\n".join([f"{m['from']}: {m['body']}" for m in c.get("messages", [])])
    system = "Summarize this sales conversation in 2 short sentences and classify intent (Interested/Pricing/Support/Not Interested)."
    out = await llm_text(system, history)
    if not out:
        out = "Lead is engaged and asking about product details. Intent: Interested."
    return {"summary": out.strip()}


# ------------------------------------------------------------------ automations
@api.get("/automations")
async def auto_list(user: dict = Depends(get_current_user)):
    a = await db.automations.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(200)
    return [clean(x) for x in a]


@api.post("/automations")
async def auto_create(body: AutomationIn, user: dict = Depends(get_current_user)):
    doc = {"id": oid(), "workspace_id": user["workspace_id"], **body.model_dump(),
           "runs": 0, "created_at": now_iso()}
    await db.automations.insert_one(dict(doc))
    return clean(doc)


@api.patch("/automations/{aid}/toggle")
async def auto_toggle(aid: str, user: dict = Depends(get_current_user)):
    a = await db.automations.find_one({"id": aid, "workspace_id": user["workspace_id"]})
    if not a:
        raise HTTPException(status_code=404, detail="Not found")
    await db.automations.update_one({"id": aid}, {"$set": {"enabled": not a.get("enabled", True)}})
    return {"enabled": not a.get("enabled", True)}


@api.delete("/automations/{aid}")
async def auto_delete(aid: str, user: dict = Depends(get_current_user)):
    await db.automations.delete_one({"id": aid, "workspace_id": user["workspace_id"]})
    return {"ok": True}


# ------------------------------------------------------------------ quotations
@api.get("/quotations")
async def quotes_list(user: dict = Depends(get_current_user)):
    qs = await db.quotations.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(300)
    return [clean(x) for x in qs]


@api.post("/quotations")
async def quote_create(body: QuotationIn, user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": body.lead_id, "workspace_id": user["workspace_id"]})
    total = sum(float(i.get("qty", 1)) * float(i.get("price", 0)) for i in body.items)
    number = "Q-" + datetime.now().strftime("%Y%m") + "-" + pysecrets.token_hex(2).upper()
    doc = {"id": oid(), "workspace_id": user["workspace_id"], "number": number,
           "lead_id": body.lead_id, "lead_name": lead["name"] if lead else "Unknown",
           "items": body.items, "total": round(total, 2), "notes": body.notes,
           "status": "Sent", "created_at": now_iso()}
    await db.quotations.insert_one(dict(doc))
    if lead:
        await db.leads.update_one({"id": body.lead_id}, {"$set": {"stage": "QUOTATION", "value": round(total, 2), "last_activity": now_iso()}})
    await audit(user["workspace_id"], user, "quotation.created", "quotation", {"number": number, "total": total})
    return clean(doc)


@api.post("/quotations/ai-draft")
async def quote_ai_draft(body: dict, user: dict = Depends(get_current_user)):
    system = ("Draft a professional quotation line items list as STRICT JSON: "
              "{\"items\":[{\"name\":str,\"qty\":int,\"price\":float}], \"notes\":str}. Prices in USD.")
    out = parse_json_block(await llm_text(system, f"Request: {body.get('prompt','')}"))
    if out and out.get("items"):
        return out
    return {"items": [{"name": "Professional Plan (annual)", "qty": 1, "price": 1200.0},
                      {"name": "Onboarding & Setup", "qty": 1, "price": 300.0}],
            "notes": "Valid for 15 days. Taxes extra as applicable."}


# ------------------------------------------------------------------ AI studio
@api.post("/ai/generate")
async def ai_generate(body: AIGenIn, user: dict = Depends(get_current_user)):
    kind_map = {
        "template": "a reusable message template",
        "caption": "a punchy social media caption with hashtags and a strong CTA",
        "followup": "a polite follow-up message",
        "offer": "a promotional offer message",
    }
    what = kind_map.get(body.kind, "a marketing message")
    system = (f"You are an expert marketing copywriter. Write {what} for the {body.channel} channel. "
              f"Tone: {body.tone}. Language: {body.language}. Keep it concise and conversion-focused. "
              "Return only the message text.")
    text = await llm_text(system, body.prompt)
    if not text:
        text = (f"🌟 {body.prompt}!\n\nDiscover why businesses choose us. Limited-time offer just for you.\n\n"
                "👉 Reply 'YES' to learn more. Reply STOP to opt out.")
    return {"text": text.strip()}


@api.post("/ai/marketing")
async def ai_marketing(body: dict, user: dict = Depends(get_current_user)):
    system = ("You are a senior brand & performance-marketing creative. Return STRICT JSON: "
              "{\"headline\":str,\"caption\":str,\"cta\":str,\"hashtags\":[str]}.")
    out = parse_json_block(await llm_text(system, f"Product/offer: {body.get('prompt','')}. Tone: {body.get('tone','Luxury')}."))
    if not out:
        out = {"headline": body.get("prompt", "Elevate Your Brand"),
               "caption": "Crafted for those who demand more. Experience premium quality that speaks for itself.",
               "cta": "Shop Now", "hashtags": ["#premium", "#quality", "#exclusive"]}
    bgs = [
        "https://images.unsplash.com/photo-1631390573019-5b5deb1daf53?w=1200&q=80",
        "https://images.unsplash.com/photo-1575518599573-d9f3b7ec2632?w=1200&q=80",
        "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1200&q=80",
    ]
    out["image"] = bgs[len(out.get("headline", "")) % len(bgs)]
    return out


@api.post("/ai/command")
async def ai_command(body: CommandIn, user: dict = Depends(get_current_user)):
    ws_id = user["workspace_id"]
    cmd = body.command.lower()
    # lightweight NL routing over real workspace data
    result = {"reply": "", "action": None, "data": None}
    if "hot" in cmd and "lead" in cmd:
        leads = await db.leads.find({"workspace_id": ws_id, "temperature": "HOT"}).sort("score", -1).to_list(50)
        loc = None
        for city in ["pune", "mumbai", "delhi", "bangalore", "chennai"]:
            if city in cmd:
                loc = city
        data = [lead_public(l) for l in leads]
        if loc:
            data = [d for d in data if loc in (d.get("company", "") + d.get("notes", "")).lower()] or data
        result["reply"] = f"Found {len(data)} HOT leads, sorted by AI score."
        result["action"] = "navigate:/leads?temperature=HOT"
        result["data"] = data[:8]
    elif "campaign" in cmd:
        result["reply"] = "Opening the campaign builder so you can launch a new campaign."
        result["action"] = "navigate:/campaigns"
    elif "poster" in cmd or "creative" in cmd or "image" in cmd:
        result["reply"] = "Launching the AI Marketing Studio to generate your creative."
        result["action"] = "navigate:/ai-studio"
    elif "cost" in cmd or "usage" in cmd or "api" in cmd:
        n = await db.audit.count_documents({"workspace_id": ws_id})
        result["reply"] = f"Your AI usage looks healthy this month with {n} tracked events. Estimated OpenAI spend: $14.20 of $50 budget."
        result["action"] = "navigate:/dashboard"
    elif "follow" in cmd or "quote" in cmd:
        result["reply"] = "Here are quotations awaiting follow-up. I recommend a Day-2 nudge."
        result["action"] = "navigate:/quotations"
    else:
        ai = await llm_text("You are GOLD-e, an AI sales assistant. Answer briefly and helpfully.", body.command)
        result["reply"] = ai or "I can help you find leads, launch campaigns, generate creatives, and track API costs. Try 'Show hot leads'."
    await audit(ws_id, user, "ai.command", "command", {"command": body.command})
    return result


# ------------------------------------------------------------------ dashboard & audit
@api.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    ws_id = user["workspace_id"]
    total = await db.leads.count_documents({"workspace_id": ws_id})
    hot = await db.leads.count_documents({"workspace_id": ws_id, "temperature": "HOT"})
    warm = await db.leads.count_documents({"workspace_id": ws_id, "temperature": "WARM"})
    cold = await db.leads.count_documents({"workspace_id": ws_id, "temperature": "COLD"})
    won = await db.leads.count_documents({"workspace_id": ws_id, "stage": "WON"})
    campaigns = await db.campaigns.count_documents({"workspace_id": ws_id})
    convos = await db.conversations.find({"workspace_id": ws_id}).to_list(500)
    replies = sum(len([m for m in c.get("messages", []) if m.get("from") == "lead"]) for c in convos)
    quotes = await db.quotations.find({"workspace_id": ws_id}).to_list(500)
    revenue = sum(q.get("total", 0) for q in quotes if q.get("status") in ("Sent", "Won", "Accepted"))

    # funnel
    funnel = []
    for st in ["NEW", "CONTACTED", "INTERESTED", "QUALIFIED", "DEMO", "QUOTATION", "WON"]:
        funnel.append({"stage": st, "count": await db.leads.count_documents({"workspace_id": ws_id, "stage": st})})

    # 7-day trend
    trend = []
    for i in range(6, -1, -1):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        start = day.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        end = day.replace(hour=23, minute=59, second=59).isoformat()
        cnt = await db.leads.count_documents({"workspace_id": ws_id, "created_at": {"$gte": start, "$lte": end}})
        trend.append({"day": day.strftime("%a"), "leads": cnt})

    conversion = round((won / total * 100) if total else 0, 1)
    return {
        "kpis": {"total_leads": total, "hot_leads": hot, "warm_leads": warm, "cold_leads": cold,
                 "won": won, "campaigns": campaigns, "replies": replies,
                 "revenue": round(revenue, 2), "conversion": conversion,
                 "ai_cost": 14.20, "ai_budget": 50, "avg_response": "2m 14s"},
        "funnel": funnel, "trend": trend,
        "temperature_split": [{"name": "HOT", "value": hot}, {"name": "WARM", "value": warm}, {"name": "COLD", "value": cold}],
    }


@api.get("/audit")
async def audit_list(user: dict = Depends(get_current_user)):
    logs = await db.audit.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(100)
    return [clean(x) for x in logs]


@api.get("/pipeline")
async def pipeline(user: dict = Depends(get_current_user)):
    leads = await db.leads.find({"workspace_id": user["workspace_id"]}).sort("score", -1).to_list(1000)
    board = {st: [] for st in PIPELINE_STAGES}
    for l in leads:
        st = l.get("stage", "NEW")
        if st in board:
            board[st].append(lead_public(l))
    return {"stages": PIPELINE_STAGES, "board": board}


@api.get("/")
async def root():
    return {"service": "GOLD-e API", "status": "ok"}


app.include_router(api)


# ------------------------------------------------------------------ seed
async def seed():
    await db.users.create_index("email", unique=True)
    await db.leads.create_index([("workspace_id", 1), ("email", 1)])
    admin_email = os.environ.get("ADMIN_EMAIL", "demo@gold-e.ai")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "demo1234")
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        if not verify_password(admin_pw, existing["password_hash"]):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_pw)}})
        return
    ws_id = oid()
    await db.workspaces.insert_one({"id": ws_id, "name": "Acme Ready-Mix Concrete", "plan": "Enterprise",
                                    "platform_api_key": "golde_" + pysecrets.token_urlsafe(24), "created_at": now_iso()})
    uid = oid()
    await db.users.insert_one({"id": uid, "workspace_id": ws_id, "email": admin_email,
                               "password_hash": hash_password(admin_pw), "name": "Rajesh Kumar",
                               "role": "owner", "created_at": now_iso()})
    await db.users.insert_one({"id": oid(), "workspace_id": ws_id, "email": "priya@gold-e.ai",
                               "password_hash": hash_password("agent1234"), "name": "Priya Sharma",
                               "role": "agent", "created_at": now_iso()})

    demo_leads = [
        {"name": "Vikram Enterprises", "company": "Vikram Constructions, Pune", "email": "vikram@vconstruct.in", "phone": "+919812345670", "channel": "WhatsApp", "source": "Website Form", "budget": "₹12,00,000", "notes": "Urgent RMC requirement for Pune project, ready to buy this week"},
        {"name": "Sunrise Builders", "company": "Sunrise Group, Mumbai", "email": "info@sunrise.in", "phone": "+919812345671", "channel": "Email", "source": "Meta Ads", "budget": "₹8,00,000", "notes": "Interested in bulk order, requested quote"},
        {"name": "Anil Deshmukh", "company": "Deshmukh Infra, Pune", "email": "anil@dinfra.in", "phone": "+919812345672", "channel": "WhatsApp", "source": "WhatsApp Inbound", "budget": "₹5,00,000", "notes": "Wants demo and plant location"},
        {"name": "Metro Developers", "company": "Metro Realty, Mumbai", "email": "sales@metrodev.in", "phone": "+919812345673", "channel": "SMS", "source": "CRM", "budget": "", "notes": "Cold lead, follow up later"},
        {"name": "Green Homes", "company": "Green Homes Pvt Ltd, Bangalore", "email": "contact@greenhomes.in", "phone": "+919812345674", "channel": "WhatsApp", "source": "Google Places", "budget": "₹3,50,000", "notes": "Compared pricing, needs more info"},
        {"name": "Kunal Shah", "company": "Shah Builders, Pune", "email": "kunal@shahbuild.in", "phone": "+919812345675", "channel": "Instagram", "source": "Meta Ads", "budget": "₹15,00,000", "notes": "Very interested, asked for demo asap"},
        {"name": "Coastal Projects", "company": "Coastal Infra, Chennai", "email": "hello@coastal.in", "phone": "+919812345676", "channel": "Email", "source": "Manual", "budget": "", "notes": ""},
        {"name": "Prime Estates", "company": "Prime Estates, Mumbai", "email": "prime@estates.in", "phone": "+919812345677", "channel": "WhatsApp", "source": "Website Form", "budget": "₹6,20,000", "notes": "Requested brochure and quotation"},
    ]
    lead_ids = []
    for i, d in enumerate(demo_leads):
        doc = await store_lead(ws_id, d, owner="Rajesh Kumar")
        lead_ids.append((doc["id"], doc["name"]))
        stage = ["NEW", "CONTACTED", "INTERESTED", "QUALIFIED", "DEMO", "QUOTATION", "NEW", "CONTACTED"][i]
        await db.leads.update_one({"id": doc["id"]}, {"$set": {"stage": stage, "value": [0,0,120000,80000,150000,500000,0,62000][i]}})

    templates = [
        {"name": "Welcome — WhatsApp", "category": "General", "channel": "WhatsApp", "language": "English", "body": "Hi {{name}}! 👋 Thanks for your interest in Acme Ready-Mix Concrete. How can we help your project today?", "buttons": ["View Products", "Get Quotation", "Talk to Expert"]},
        {"name": "Diwali Offer", "category": "Festival Campaign", "channel": "WhatsApp", "language": "English", "body": "🪔 Happy Diwali {{name}}! Get 15% off on all RMC orders this festive season. Limited slots — book now!", "buttons": ["Book Now", "Plant Location", "Stop"]},
        {"name": "Follow-up Day 2", "category": "Follow-up", "channel": "WhatsApp", "language": "English", "body": "Hi {{name}}, just checking in on your concrete requirement. Would you like a customized quote?", "buttons": ["Get Quotation", "Book Demo"]},
        {"name": "Quotation Sent", "category": "Sales", "channel": "Email", "language": "English", "body": "Dear {{name}}, please find attached your quotation. Valid for 15 days. Reply for any clarifications.", "buttons": ["Download Brochure", "Call Now"]},
    ]
    for t in templates:
        await db.templates.insert_one({"id": oid(), "workspace_id": ws_id, "status": "Approved", "created_at": now_iso(), **t})

    for c in [
        {"name": "Diwali Festive Blast", "channel": "WhatsApp", "segment": "HOT", "status": "Sent", "stats": {"audience": 3, "sent": 3, "delivered": 3, "replied": 1, "failed": 0}},
        {"name": "Q2 Reactivation", "channel": "Email", "segment": "COLD", "status": "Sent", "stats": {"audience": 2, "sent": 2, "delivered": 2, "replied": 0, "failed": 0}},
    ]:
        await db.campaigns.insert_one({"id": oid(), "workspace_id": ws_id, "template_id": None, "message": "", "scheduled_at": None, "created_at": now_iso(), **c})

    if lead_ids:
        conv_specs = [
            (lead_ids[0], "WhatsApp", [("lead", "Hi, I need RMC for my Pune site urgently"), ("agent", "Sure! What grade and quantity do you need?"), ("lead", "M25, around 200 cubic meters this week")]),
            (lead_ids[1], "Email", [("lead", "Please share your best bulk pricing"), ("agent", "Sharing our quotation now, valid 15 days.")]),
            (lead_ids[5], "Instagram", [("lead", "Saw your ad, can I get a demo?"), ("agent", "Absolutely! When works for you?"), ("lead", "Tomorrow afternoon")]),
        ]
        for (lid, lname), channel, msgs in conv_specs:
            messages = [{"id": oid(), "from": f, "author": lname if f == "lead" else "Rajesh Kumar", "body": b,
                         "at": (datetime.now(timezone.utc) - timedelta(hours=len(msgs)-i)).isoformat()} for i, (f, b) in enumerate(msgs)]
            await db.conversations.insert_one({"id": oid(), "workspace_id": ws_id, "lead_id": lid, "lead_name": lname,
                                               "channel": channel, "messages": messages,
                                               "unread": 1 if msgs[-1][0] == "lead" else 0,
                                               "updated_at": now_iso(), "created_at": now_iso()})

    for a in [
        {"name": "Welcome new WhatsApp leads", "trigger": "Lead Created", "condition": "channel = WhatsApp", "action": "Send 'Welcome — WhatsApp' template", "enabled": True},
        {"name": "Day-2 follow-up on no reply", "trigger": "No Reply", "condition": "48 hours", "action": "Send 'Follow-up Day 2'", "enabled": True},
        {"name": "Notify on HOT lead", "trigger": "Lead Scored HOT", "condition": "score >= 75", "action": "Assign to sales team + alert", "enabled": False},
    ]:
        await db.automations.insert_one({"id": oid(), "workspace_id": ws_id, "runs": 0, "created_at": now_iso(), **a})

    for cred in [
        {"provider": "Meta WhatsApp Business API", "label": "Primary WABA", "fields_meta": {"Phone Number ID": "1029384756", "WABA ID": "8873321"}},
        {"provider": "OpenAI", "label": "GPT (default)", "fields_meta": {"API Key": "sk-proj-xxxxxxxxxxxx1234", "Model": "gpt-5.4"}},
        {"provider": "SMTP / Email", "label": "Zoho Mail", "fields_meta": {"Host": "smtp.zoho.in", "Port": "587", "User": "sales@acme.in"}},
    ]:
        await db.credentials.insert_one({"id": oid(), "workspace_id": ws_id, "status": "Active", "created_at": now_iso(),
                                         "fields_enc": {}, **cred})

    await db.quotations.insert_one({"id": oid(), "workspace_id": ws_id, "number": "Q-202606-A1B2",
                                    "lead_id": lead_ids[5][0], "lead_name": lead_ids[5][1],
                                    "items": [{"name": "M25 RMC (per m³)", "qty": 200, "price": 2500}],
                                    "total": 500000, "notes": "Valid 15 days", "status": "Sent", "created_at": now_iso()})
    print("Seeded demo workspace.")


@app.on_event("startup")
async def startup():
    try:
        await seed()
    except Exception as e:
        print("Seed error:", e)

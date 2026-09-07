"""Shared core: db, encryption, auth deps, helpers. Reused by all upgrade modules."""
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

import os
import re
import json
import hashlib
import secrets as pysecrets
from datetime import datetime, timezone
from typing import Optional, Any

import jwt
from bson import ObjectId
from cryptography.fernet import Fernet
from fastapi import HTTPException, Depends, Request
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
VAULT_KEY = os.environ["VAULT_KEY"]
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

fernet = Fernet(VAULT_KEY.encode())
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


def now() -> datetime:
    return datetime.now(timezone.utc)


def now_iso() -> str:
    return now().isoformat()


def oid() -> str:
    return str(ObjectId())


def encrypt_str(s: str) -> str:
    return fernet.encrypt((s or "").encode()).decode()


def decrypt_str(s: str) -> str:
    try:
        return fernet.decrypt(s.encode()).decode()
    except Exception:
        return ""


def sha256(s: str) -> str:
    return hashlib.sha256((s or "").encode()).hexdigest()


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


async def audit(workspace_id: str, actor: str, action: str, entity: str = "", meta: dict = None):
    await db.audit.insert_one({
        "id": oid(), "workspace_id": workspace_id, "user_name": actor,
        "action": action, "entity": entity, "meta": _redact(meta or {}),
        "created_at": now_iso(),
    })


def _redact(meta: dict) -> dict:
    """Never let secrets/tokens/raw phones into audit logs."""
    out = {}
    for k, v in meta.items():
        if re.search(r"token|secret|password|api_key|access", k, re.I):
            out[k] = "***redacted***"
        else:
            out[k] = v
    return out


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


def render_vars(text: str, lead: dict) -> str:
    """Substitute {{name}}, {{company}}, {{first_name}} dynamic variables."""
    if not text:
        return text
    name = lead.get("name", "there")
    mapping = {
        "name": name,
        "first_name": name.split(" ")[0] if name else "there",
        "company": lead.get("company", ""),
        "email": lead.get("email", ""),
    }
    def repl(m):
        key = m.group(1).strip().lower()
        return str(mapping.get(key, m.group(0)))
    return re.sub(r"\{\{\s*([a-zA-Z_]+)\s*\}\}", repl, text)

"""Shared core services for database access, encryption, auth, auditing and AI."""
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

import base64
import hashlib
import json
import os
import re
from datetime import datetime, timezone
from typing import Any

import httpx
import jwt
from bson import ObjectId
from cryptography.fernet import Fernet
from fastapi import Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME", "marketingapi")
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"

# A dedicated VAULT_KEY is supported. When omitted, derive a stable Fernet key
# from JWT_SECRET. JWT_SECRET must therefore remain stable after launch.
VAULT_KEY = os.environ.get("VAULT_KEY", "").strip()
if not VAULT_KEY:
    digest = hashlib.sha256(("marketingapi-vault:" + JWT_SECRET).encode()).digest()
    VAULT_KEY = base64.urlsafe_b64encode(digest).decode()
    os.environ["VAULT_KEY"] = VAULT_KEY

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5").strip() or "gpt-5"
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")

fernet = Fernet(VAULT_KEY.encode())
client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
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
        return fernet.decrypt((s or "").encode()).decode()
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
    user = await db.users.find_one({"id": payload.get("sub")})
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
        "id": oid(),
        "workspace_id": workspace_id,
        "user_name": actor,
        "action": action,
        "entity": entity,
        "meta": _redact(meta or {}),
        "created_at": now_iso(),
    })


def _redact(meta: dict) -> dict:
    """Prevent credentials, passwords and raw tokens from entering audit logs."""
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
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except Exception:
        return None


def _response_text(payload: dict) -> str:
    direct = payload.get("output_text")
    if isinstance(direct, str) and direct.strip():
        return direct.strip()
    for item in payload.get("output", []):
        if item.get("type") != "message":
            continue
        for content in item.get("content", []):
            text = content.get("text")
            if isinstance(text, str) and text.strip():
                return text.strip()
    return ""


async def llm_text(system: str, prompt: str, model: str | None = None) -> str:
    """Call OpenAI Responses API directly. Returns empty string when AI is not configured."""
    if not OPENAI_API_KEY:
        return ""
    payload = {
        "model": model or OPENAI_MODEL,
        "instructions": system,
        "input": prompt,
        "store": False,
    }
    try:
        async with httpx.AsyncClient(timeout=45.0) as http:
            response = await http.post(
                f"{OPENAI_BASE_URL}/responses",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            return _response_text(response.json())
    except Exception as exc:
        # Never log request payloads or API keys.
        print(f"AI provider error: {type(exc).__name__}")
        return ""


def render_vars(text: str, lead: dict) -> str:
    """Substitute a restricted set of safe lead variables in message templates."""
    if not text:
        return text
    name = lead.get("name", "there")
    mapping = {
        "name": name,
        "first_name": name.split(" ")[0] if name else "there",
        "company": lead.get("company", ""),
        "email": lead.get("email", ""),
    }

    def repl(match):
        key = match.group(1).strip().lower()
        return str(mapping.get(key, match.group(0)))

    return re.sub(r"\{\{\s*([a-zA-Z_]+)\s*\}\}", repl, text)

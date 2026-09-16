"""Production-safe AI endpoints and persistent assistant history.

Prototype fallbacks are allowed only when ENABLE_SIMULATION=true. In production,
provider failures return non-2xx responses so the coin middleware refunds the
charge instead of billing users for canned/fabricated output.
"""
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

import billing
import core
import poster
import server
from core import audit, clean, db, get_current_user, now_iso, oid, parse_json_block

router = APIRouter(prefix="/api")


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


SIMULATION_ENABLED = _env_bool("ENABLE_SIMULATION", False)


class CommandIn(BaseModel):
    command: str = Field(min_length=1, max_length=3000)
    thread_id: Optional[str] = None


class TextGenIn(BaseModel):
    kind: str
    prompt: str = Field(min_length=1, max_length=8000)
    tone: Optional[str] = "Persuasive"
    language: Optional[str] = "English"
    channel: Optional[str] = "WhatsApp"


def _provider_unavailable(detail: str = "AI provider is unavailable. Your coins were not charged."):
    raise HTTPException(status_code=503, detail=detail)


def _month_start() -> str:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()


async def _ensure_thread(user: dict, thread_id: Optional[str], first_message: str) -> dict:
    ws = user["workspace_id"]
    if thread_id:
        existing = await db.assistant_threads.find_one({
            "id": thread_id,
            "workspace_id": ws,
            "user_id": user["id"],
        })
        if existing:
            return existing

    thread = {
        "id": oid(),
        "workspace_id": ws,
        "user_id": user["id"],
        "title": first_message.strip()[:80] or "New conversation",
        "message_count": 0,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.assistant_threads.insert_one(dict(thread))
    return thread


async def _append_thread_message(thread_id: str, user: dict, role: str, text: str, *, action=None, data=None):
    message = {
        "id": oid(),
        "role": role,
        "text": text,
        "action": action,
        "data": data if isinstance(data, list) else None,
        "created_at": now_iso(),
    }
    await db.assistant_messages.insert_one({
        **message,
        "workspace_id": user["workspace_id"],
        "user_id": user["id"],
        "thread_id": thread_id,
    })
    await db.assistant_threads.update_one(
        {"id": thread_id, "workspace_id": user["workspace_id"], "user_id": user["id"]},
        {"$inc": {"message_count": 1}, "$set": {"updated_at": now_iso()}},
    )
    return message


@router.get("/assistant/threads")
async def list_threads(user: dict = Depends(get_current_user), q: str = ""):
    query = {"workspace_id": user["workspace_id"], "user_id": user["id"]}
    if q.strip():
        query["title"] = {"$regex": q.strip(), "$options": "i"}
    rows = await db.assistant_threads.find(query).sort("updated_at", -1).to_list(200)
    return [clean(row) for row in rows]


@router.get("/assistant/threads/{thread_id}")
async def get_thread(thread_id: str, user: dict = Depends(get_current_user)):
    thread = await db.assistant_threads.find_one({
        "id": thread_id,
        "workspace_id": user["workspace_id"],
        "user_id": user["id"],
    })
    if not thread:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = await db.assistant_messages.find({
        "thread_id": thread_id,
        "workspace_id": user["workspace_id"],
        "user_id": user["id"],
    }).sort("created_at", 1).to_list(500)
    return {"thread": clean(thread), "messages": [clean(message) for message in messages]}


@router.delete("/assistant/threads/{thread_id}")
async def delete_thread(thread_id: str, user: dict = Depends(get_current_user)):
    query = {
        "id": thread_id,
        "workspace_id": user["workspace_id"],
        "user_id": user["id"],
    }
    result = await db.assistant_threads.delete_one(query)
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.assistant_messages.delete_many({
        "thread_id": thread_id,
        "workspace_id": user["workspace_id"],
        "user_id": user["id"],
    })
    return {"ok": True}


@router.post("/ai/generate")
async def ai_generate(body: TextGenIn, user: dict = Depends(get_current_user)):
    if SIMULATION_ENABLED:
        legacy = server.AIGenIn(**body.model_dump())
        return await server.ai_generate(legacy, user)

    kind_map = {
        "template": "a reusable message template",
        "caption": "a punchy social media caption with hashtags and a strong CTA",
        "followup": "a polite follow-up message",
        "offer": "a promotional offer message",
    }
    what = kind_map.get(body.kind, "a marketing message")
    system = (
        f"You are an expert marketing copywriter. Write {what} for the {body.channel} channel. "
        f"Tone: {body.tone}. Language: {body.language}. Keep it concise and conversion-focused. "
        "Return only the message text."
    )
    text = await core.llm_text(system, body.prompt)
    if not text.strip():
        _provider_unavailable()
    return {"text": text.strip()}


@router.post("/ai/marketing")
async def ai_marketing(body: dict, user: dict = Depends(get_current_user)):
    if SIMULATION_ENABLED:
        return await server.ai_marketing(body, user)

    prompt = str(body.get("prompt", "")).strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Marketing prompt is required")
    system = (
        "You are a senior brand and performance-marketing creative. Return STRICT JSON: "
        "{\"headline\":str,\"caption\":str,\"cta\":str,\"hashtags\":[str]}."
    )
    out = parse_json_block(await core.llm_text(
        system,
        f"Product/offer: {prompt}. Tone: {body.get('tone', 'Professional')}.",
    ))
    if not out or not out.get("headline") or not out.get("caption"):
        _provider_unavailable("AI marketing generation failed. Your coins were not charged.")
    return out


@router.post("/quotations/ai-draft")
async def quote_ai_draft(body: dict, user: dict = Depends(get_current_user)):
    if SIMULATION_ENABLED:
        return await server.quote_ai_draft(body, user)

    prompt = str(body.get("prompt", "")).strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Quotation request is required")
    system = (
        "Draft a professional quotation line-items list as STRICT JSON: "
        "{\"items\":[{\"name\":str,\"qty\":int,\"price\":float}],\"notes\":str}. "
        "Use Indian Rupees (INR) for prices unless the user explicitly requests another currency."
    )
    out = parse_json_block(await core.llm_text(system, f"Request: {prompt}"))
    if not out or not out.get("items"):
        _provider_unavailable("AI quotation drafting failed. Your coins were not charged.")
    return out


@router.post("/ai/poster")
async def ai_poster(body: poster.PosterIn, user: dict = Depends(get_current_user)):
    result = await poster.generate_poster(body, user)
    if result.get("image_url") or SIMULATION_ENABLED:
        return result

    # Do not keep a failed/no-image generation as a billable asset in production.
    asset_id = result.get("id")
    if asset_id:
        await db.generated_assets.delete_one({"id": asset_id, "workspace_id": user["workspace_id"]})
    _provider_unavailable("AI image generation failed. Your coins were not charged.")


@router.post("/ai/command")
async def ai_command(body: CommandIn, user: dict = Depends(get_current_user)):
    if SIMULATION_ENABLED:
        legacy = server.CommandIn(command=body.command)
        result = await server.ai_command(legacy, user)
    else:
        ws = user["workspace_id"]
        cmd = body.command.lower()
        result = {"reply": "", "action": None, "data": None}

        if "hot" in cmd and "lead" in cmd:
            leads = await db.leads.find({"workspace_id": ws, "temperature": "HOT"}).sort("score", -1).to_list(50)
            data = [server.lead_public(lead) for lead in leads]
            result.update({
                "reply": f"Found {len(data)} HOT leads, sorted by AI score.",
                "action": "navigate:/leads?temperature=HOT",
                "data": data[:8],
            })
        elif "campaign" in cmd:
            result.update({"reply": "Opening Campaign Studio.", "action": "navigate:/campaigns"})
        elif "poster" in cmd or "creative" in cmd or "image" in cmd:
            result.update({"reply": "Opening AI Marketing Studio.", "action": "navigate:/ai-studio"})
        elif "cost" in cmd or "usage" in cmd or "coin" in cmd:
            wallet = await billing.ensure_wallet(ws)
            used_this_month = await db.coin_ledger.count_documents({
                "workspace_id": ws,
                "created_at": {"$gte": _month_start()},
                "direction": "debit",
            })
            result.update({
                "reply": (
                    f"You have {wallet.get('coin_balance', 0)} coins remaining. "
                    f"There are {used_this_month} recorded AI debit events this month."
                ),
                "action": "navigate:/workspace",
            })
        elif "follow" in cmd or "quote" in cmd:
            pending_quotes = await db.quotations.count_documents({
                "workspace_id": ws,
                "status": {"$nin": ["Won", "Accepted", "Lost"]},
            })
            result.update({
                "reply": f"You have {pending_quotes} quotations that may need follow-up.",
                "action": "navigate:/quotations",
            })
        else:
            ai = await core.llm_text(
                "You are GOLD-e AI, a concise business growth assistant. Give practical, grounded answers and never invent workspace facts.",
                body.command,
            )
            if not ai.strip():
                _provider_unavailable()
            result["reply"] = ai.strip()

        await audit(ws, user.get("name", "user"), "ai.command", "command", {"command": body.command})

    thread = await _ensure_thread(user, body.thread_id, body.command)
    await _append_thread_message(thread["id"], user, "user", body.command)
    await _append_thread_message(
        thread["id"],
        user,
        "assistant",
        result.get("reply", ""),
        action=result.get("action"),
        data=result.get("data"),
    )
    return {**result, "thread_id": thread["id"]}

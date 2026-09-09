"""Meta social messaging adapters for Instagram and Facebook Messenger.

Workspace credentials are encrypted, webhook signatures are verified, and raw
provider-scoped recipient IDs are never exposed in the public lead payload.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets as pysecrets
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel

from core import VAULT_KEY, audit, db, decrypt_str, encrypt_str, get_current_user, now_iso, oid

router = APIRouter(prefix="/api", tags=["meta-social"])

META_API_VERSION = os.environ.get("META_API_VERSION", "v21.0")
GRAPH = f"https://graph.facebook.com/{META_API_VERSION}"


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


SIMULATION_ENABLED = _env_bool("ENABLE_SIMULATION", False)


def social_hash(channel: str, social_id: str) -> str:
    return hashlib.sha256(f"{channel.lower()}:{social_id}:{VAULT_KEY}".encode()).hexdigest()


def _decrypt_fields(doc: dict | None) -> dict[str, str]:
    if not doc:
        return {}
    return {key: decrypt_str(value) for key, value in (doc.get("fields_enc") or {}).items()}


async def _connection(workspace_id: str, slug: str) -> tuple[dict | None, dict[str, str]]:
    doc = await db.channel_connections.find_one({
        "workspace_id": workspace_id,
        "channel": slug,
        "enabled": {"$ne": False},
    })
    return doc, _decrypt_fields(doc)


async def _find_connection_by_entry_id(entry_id: str) -> tuple[str, dict, dict[str, str]] | None:
    rows = await db.channel_connections.find({
        "channel": {"$in": ["instagram", "facebook"]},
        "enabled": {"$ne": False},
    }).to_list(1000)
    for doc in rows:
        config = _decrypt_fields(doc)
        slug = doc.get("channel")
        if slug == "instagram" and config.get("instagram_account_id") == entry_id:
            return slug, doc, config
        if slug == "facebook" and config.get("page_id") == entry_id:
            return slug, doc, config
    return None


async def _mark_verified(workspace_id: str, slug: str, provider_id: str | None = None) -> None:
    await db.channel_connections.update_one(
        {"workspace_id": workspace_id, "channel": slug},
        {"$set": {
            "last_verified_at": now_iso(),
            "last_provider_id": provider_id,
            "last_error": None,
        }},
    )


async def _mark_error(workspace_id: str, slug: str, code: str) -> None:
    await db.channel_connections.update_one(
        {"workspace_id": workspace_id, "channel": slug},
        {"$set": {"last_error": code, "last_error_at": now_iso()}},
    )


async def send_social(workspace_id: str, lead: dict, channel: str, body: str) -> dict[str, Any]:
    normalized = channel.strip().lower()
    if normalized not in {"instagram", "facebook"}:
        return {"mode": "disabled", "error": "social_channel_unsupported", "provider_id": None}

    id_field = "instagram_scoped_id_enc" if normalized == "instagram" else "facebook_psid_enc"
    destination = decrypt_str(lead.get(id_field, ""))
    if not destination:
        return {"mode": "disabled", "error": "missing_social_destination", "provider_id": None}

    if SIMULATION_ENABLED:
        return {"mode": "simulation", "provider_id": f"{normalized}.sim.{pysecrets.token_hex(8)}"}

    doc, config = await _connection(workspace_id, normalized)
    if not doc:
        return {"mode": "disabled", "error": "social_provider_not_configured", "provider_id": None}

    if normalized == "instagram":
        account_id = config.get("instagram_account_id", "").strip()
        token = config.get("access_token", "").strip()
        if not account_id or not token:
            return {"mode": "disabled", "error": "instagram_provider_not_configured", "provider_id": None}
        endpoint = f"{GRAPH}/{account_id}/messages"
        payload = {"recipient": {"id": destination}, "message": {"text": body}}
    else:
        page_id = config.get("page_id", "").strip()
        token = config.get("page_access_token", "").strip()
        if not page_id or not token:
            return {"mode": "disabled", "error": "facebook_provider_not_configured", "provider_id": None}
        endpoint = f"{GRAPH}/{page_id}/messages"
        payload = {
            "messaging_type": "RESPONSE",
            "recipient": {"id": destination},
            "message": {"text": body},
        }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                endpoint,
                params={"access_token": token},
                headers={"Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
        provider_id = data.get("message_id") or data.get("messageId") or data.get("id")
        await _mark_verified(workspace_id, normalized, str(provider_id) if provider_id else None)
        return {"mode": "live", "provider_id": str(provider_id) if provider_id else None}
    except Exception as exc:
        print(f"Meta social send failed: {type(exc).__name__}")
        code = f"{normalized}_provider_send_failed"
        await _mark_error(workspace_id, normalized, code)
        return {"mode": "live", "error": code, "provider_id": None}


async def _find_or_create_lead(workspace_id: str, channel: str, sender_id: str, name: str = "") -> dict:
    normalized = channel.lower()
    hash_field = "instagram_scoped_id_hash" if normalized == "instagram" else "facebook_psid_hash"
    enc_field = "instagram_scoped_id_enc" if normalized == "instagram" else "facebook_psid_enc"
    digest = social_hash(normalized, sender_id)
    lead = await db.leads.find_one({"workspace_id": workspace_id, hash_field: digest})
    if lead:
        return lead

    display_channel = "Instagram" if normalized == "instagram" else "Facebook"
    lead = {
        "id": oid(),
        "workspace_id": workspace_id,
        "name": name.strip() or f"{display_channel} Contact",
        "company": "",
        "email": "",
        "phone_enc": "",
        "phone_hash": None,
        "phone_masked": "",
        "channel": display_channel,
        "source": f"{display_channel} Inbound",
        "budget": "",
        "notes": "Created from inbound Meta conversation",
        "tags": ["meta-inbound"],
        "owner": "",
        "score": 50,
        "temperature": "WARM",
        "score_reason": "Inbound social conversation",
        "stage": "RESPONDED",
        "value": 0,
        "consent": False,
        "consent_status": "pending",
        "consent_source": "meta_inbound",
        "opted_out": False,
        hash_field: digest,
        enc_field: encrypt_str(sender_id),
        "last_reply_at": now_iso(),
        "last_activity": now_iso(),
        "created_at": now_iso(),
    }
    await db.leads.insert_one(dict(lead))
    await audit(workspace_id, "meta-webhook", "lead.created_from_social", "lead", {
        "lead_id": lead["id"], "channel": display_channel,
    })
    return lead


async def _store_inbound(workspace_id: str, channel: str, lead: dict, text: str, provider_id: str | None) -> None:
    display_channel = "Instagram" if channel.lower() == "instagram" else "Facebook"
    await db.messages.insert_one({
        "id": oid(), "workspace_id": workspace_id, "lead_id": lead["id"],
        "lead_name": lead.get("name"), "channel": display_channel, "direction": "inbound",
        "body": text, "status": "received", "provider_id": provider_id, "created_at": now_iso(),
    })
    conv = await db.conversations.find_one({"workspace_id": workspace_id, "lead_id": lead["id"]})
    entry = {"id": oid(), "from": "lead", "author": lead.get("name"), "body": text, "at": now_iso()}
    if conv:
        await db.conversations.update_one(
            {"id": conv["id"]},
            {"$push": {"messages": entry}, "$set": {"updated_at": now_iso(), "channel": display_channel}, "$inc": {"unread": 1}},
        )
    else:
        await db.conversations.insert_one({
            "id": oid(), "workspace_id": workspace_id, "lead_id": lead["id"],
            "lead_name": lead.get("name"), "channel": display_channel,
            "messages": [entry], "unread": 1, "updated_at": now_iso(), "created_at": now_iso(),
        })
    await db.leads.update_one(
        {"id": lead["id"], "workspace_id": workspace_id},
        {"$set": {"last_reply_at": now_iso(), "last_activity": now_iso(), "stage": "RESPONDED"}},
    )
    await db.followups.update_many(
        {"workspace_id": workspace_id, "lead_id": lead["id"], "status": {"$in": ["scheduled", "processing"]}},
        {"$set": {"status": "stopped", "stopped_reason": "replied", "stopped_at": now_iso()}},
    )


async def _process_entry(workspace_id: str, channel: str, entry: dict) -> None:
    for event in entry.get("messaging", []) or []:
        sender_id = str((event.get("sender") or {}).get("id") or "")
        message = event.get("message") or {}
        if sender_id and message:
            text = message.get("text") or ""
            provider_id = message.get("mid") or message.get("id")
            lead = await _find_or_create_lead(workspace_id, channel, sender_id)
            await _store_inbound(workspace_id, channel, lead, text, provider_id)

        delivery = event.get("delivery") or {}
        for provider_id in delivery.get("mids") or []:
            await db.messages.update_one(
                {"workspace_id": workspace_id, "provider_id": provider_id},
                {"$set": {"status": "delivered", "delivered_at": now_iso()}},
            )

        if event.get("read"):
            recipient_id = str((event.get("sender") or {}).get("id") or "")
            if recipient_id:
                hash_field = "instagram_scoped_id_hash" if channel == "instagram" else "facebook_psid_hash"
                lead = await db.leads.find_one({"workspace_id": workspace_id, hash_field: social_hash(channel, recipient_id)})
                if lead:
                    await db.messages.update_many(
                        {
                            "workspace_id": workspace_id,
                            "lead_id": lead["id"],
                            "channel": {"$regex": f"^{channel}$", "$options": "i"},
                            "direction": "outbound",
                            "status": "sent",
                        },
                        {"$set": {"status": "read", "read_at": now_iso()}},
                    )


@router.get("/webhooks/meta/social")
async def webhook_verify(request: Request):
    verify_token = os.environ.get("META_WEBHOOK_VERIFY_TOKEN", "").strip()
    q = request.query_params
    if not verify_token:
        raise HTTPException(status_code=503, detail="Webhook verification token is not configured")
    if q.get("hub.mode") == "subscribe" and q.get("hub.verify_token") == verify_token:
        return Response(q.get("hub.challenge", ""), media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/webhooks/meta/social")
async def webhook_receive(request: Request):
    raw = await request.body()
    try:
        payload = json.loads(raw)
        entries = payload.get("entry") or []
        entry_id = str(entries[0].get("id") or "") if entries else ""
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Meta payload")
    if not entry_id:
        raise HTTPException(status_code=400, detail="Missing Meta entry id")

    match = await _find_connection_by_entry_id(entry_id)
    if not match:
        return Response("ignored", status_code=200)
    channel, doc, config = match
    app_secret = config.get("app_secret", "")
    if not app_secret:
        raise HTTPException(status_code=503, detail="Meta app secret unavailable")

    signature = request.headers.get("x-hub-signature-256", "")
    expected = "sha256=" + hmac.new(app_secret.encode(), raw, hashlib.sha256).hexdigest()
    if not signature or not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=401, detail="Bad signature")

    for entry in entries:
        await _process_entry(doc["workspace_id"], channel, entry)
    return Response("EVENT_RECEIVED", status_code=200)


class SimInboundIn(BaseModel):
    channel: str
    sender_id: str
    text: str = "Hello GOLD-e AI"
    name: str = ""


@router.post("/webhooks/meta/social/simulate")
async def simulate_inbound(body: SimInboundIn, user: dict = Depends(get_current_user)):
    if not SIMULATION_ENABLED:
        raise HTTPException(status_code=404, detail="Simulation is disabled")
    channel = body.channel.strip().lower()
    if channel not in {"instagram", "facebook"}:
        raise HTTPException(status_code=400, detail="Choose Instagram or Facebook")
    lead = await _find_or_create_lead(user["workspace_id"], channel, body.sender_id, body.name)
    await _store_inbound(user["workspace_id"], channel, lead, body.text, f"{channel}.in.sim.{pysecrets.token_hex(6)}")
    return {"ok": True, "lead_id": lead["id"], "channel": channel}

"""Consent-safe multi-channel outbound dispatcher."""
from typing import Optional

from consent import can_send
from core import audit, db, now_iso, oid, render_vars
from provider_adapters import send_email, send_sms
from social import send_social
from whatsapp import send_via_channel as send_whatsapp


async def _mirror_to_inbox(workspace_id: str, lead: dict, channel: str, body: str, actor: str) -> None:
    conv = await db.conversations.find_one({"workspace_id": workspace_id, "lead_id": lead["id"]})
    entry = {"id": oid(), "from": "agent", "author": actor, "body": body, "at": now_iso()}
    if conv:
        await db.conversations.update_one(
            {"id": conv["id"]},
            {"$push": {"messages": entry}, "$set": {"updated_at": now_iso(), "channel": channel}},
        )
    else:
        await db.conversations.insert_one({
            "id": oid(), "workspace_id": workspace_id, "lead_id": lead["id"],
            "lead_name": lead.get("name"), "channel": channel, "messages": [entry],
            "unread": 0, "updated_at": now_iso(), "created_at": now_iso(),
        })


async def send_via_channel(
    workspace_id: str,
    lead: dict,
    channel: str,
    body: str,
    campaign: Optional[dict] = None,
    template: Optional[dict] = None,
    buttons: Optional[list] = None,
    actor: str = "system",
    kind: str = "text",
    media_url: str = "",
) -> dict:
    normalized = (channel or "").strip().lower()
    if normalized == "whatsapp":
        return await send_whatsapp(
            workspace_id, lead, channel, body, campaign=campaign, template=template,
            buttons=buttons, actor=actor, kind=kind, media_url=media_url,
        )

    gate = await can_send(workspace_id, lead, channel, campaign, template)
    msg_id = oid()
    rendered = render_vars(body, lead)
    base = {
        "id": msg_id, "workspace_id": workspace_id, "lead_id": lead["id"],
        "lead_name": lead.get("name"), "channel": channel, "direction": "outbound",
        "campaign_id": campaign.get("id") if campaign else None, "body": rendered,
        "kind": kind, "buttons": buttons or [], "actor": actor, "created_at": now_iso(),
    }

    if not gate["allow"]:
        base.update({"status": "blocked", "block_reason": gate["reason"], "block_code": gate["code"]})
        await db.messages.insert_one(dict(base))
        await audit(workspace_id, actor, "message.blocked", "message", {
            "lead_id": lead["id"], "channel": channel, "reason": gate["code"],
        })
        return {"status": "blocked", "reason": gate["reason"], "code": gate["code"], "message_id": msg_id}

    if normalized == "email":
        result = await send_email(workspace_id, lead, rendered, campaign=campaign)
    elif normalized == "sms":
        result = await send_sms(workspace_id, lead, rendered)
    elif normalized in {"instagram", "facebook"}:
        result = await send_social(workspace_id, lead, channel, rendered)
    else:
        result = {"mode": "disabled", "error": "channel_provider_not_configured", "provider_id": None}

    status = "failed" if result.get("error") else "delivered" if result.get("mode") == "simulation" else "sent"
    provider_id = result.get("provider_id")
    base.update({
        "status": status, "mode": result.get("mode", "disabled"),
        "provider_id": provider_id, "sent_at": now_iso() if status != "failed" else None,
    })
    if result.get("error"):
        base["error"] = result["error"]
    await db.messages.insert_one(dict(base))

    await audit(workspace_id, actor, "message.sent" if status != "failed" else "message.failed", "message", {
        "lead_id": lead["id"], "channel": channel, "provider_id": provider_id,
        "mode": result.get("mode", "disabled"), "error": result.get("error"),
    })
    if status != "failed":
        await _mirror_to_inbox(workspace_id, lead, channel, rendered, actor)

    return {
        "status": status, "mode": result.get("mode", "disabled"),
        "provider_id": provider_id, "message_id": msg_id, "code": result.get("error"),
    }

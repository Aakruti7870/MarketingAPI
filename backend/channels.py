"""Channel & integration hub for GOLD-e AI.

Workspace credentials are encrypted at rest. A connection is marked Live only
after a provider adapter has completed a successful send/verification.
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core import audit, db, encrypt_str, get_current_user, now_iso, require_role

router = APIRouter(prefix="/api/channels", tags=["channels"])

CHANNELS: dict[str, dict[str, Any]] = {
    "whatsapp": {"name": "WhatsApp", "group": "Messaging", "provider": "Meta Cloud API", "fields": []},
    "email": {"name": "Email", "group": "Messaging", "provider": "SMTP", "fields": ["host", "port", "security", "username", "password", "from_email"]},
    "sms": {"name": "SMS", "group": "Messaging", "provider": "MSG91", "fields": ["auth_key", "sender_id", "template_id", "base_url", "route", "country"]},
    "instagram": {"name": "Instagram", "group": "Messaging", "provider": "Meta API", "fields": ["instagram_account_id", "page_id", "access_token", "app_secret"]},
    "facebook": {"name": "Facebook", "group": "Messaging", "provider": "Meta API", "fields": ["page_id", "page_access_token", "app_secret"]},
    "website-chat": {"name": "Website Chat", "group": "Messaging", "provider": "GOLD-e Widget", "fields": ["site_name", "allowed_origin"]},
    "google-places": {"name": "Google Places", "group": "Lead Sources", "provider": "Google Maps Platform", "fields": ["api_key", "region"]},
    "meta-ads": {"name": "Meta Ads", "group": "Lead Sources", "provider": "Meta Marketing API", "fields": ["ad_account_id", "access_token", "pixel_id"]},
    "website-forms": {"name": "Website Forms", "group": "Lead Sources", "provider": "GOLD-e API", "fields": ["allowed_origin", "form_name"]},
    "google-sheets": {"name": "Google Sheets", "group": "Integrations", "provider": "Google", "fields": ["spreadsheet_id", "sheet_name", "service_account_json"]},
    "crm": {"name": "CRM", "group": "Integrations", "provider": "Custom CRM", "fields": ["provider", "base_url", "api_key"]},
    "zapier-make": {"name": "Zapier / Make", "group": "Integrations", "provider": "Webhook", "fields": ["webhook_url", "secret"]},
    "custom-webhook": {"name": "Custom Webhook", "group": "Integrations", "provider": "Webhook", "fields": ["webhook_url", "secret"]},
}

SECRET_HINTS = ("token", "secret", "password", "key", "json")


class ChannelIn(BaseModel):
    label: str = Field(default="", max_length=100)
    enabled: bool = True
    fields: dict[str, str] = Field(default_factory=dict)


class ChannelTestSendIn(BaseModel):
    lead_id: str
    channel: str
    body: str = "GOLD-e AI provider verification message"


def _public_generic(slug: str, definition: dict, doc: dict | None) -> dict:
    configured = bool(doc and doc.get("enabled", True))
    verified = bool(configured and (doc or {}).get("last_verified_at"))
    field_names = sorted((doc or {}).get("fields_enc", {}).keys())
    return {
        "id": slug,
        **definition,
        "connected": configured,
        "status": "live" if verified else "configured" if configured else "setup_required",
        "label": (doc or {}).get("label", ""),
        "configured_fields": field_names,
        "updated_at": (doc or {}).get("updated_at"),
        "last_verified_at": (doc or {}).get("last_verified_at"),
        "last_error": (doc or {}).get("last_error"),
        "note": "Provider verified by a successful live send." if verified else "Credentials saved securely. Run a controlled test send to verify the provider." if configured else "Add provider credentials to connect this channel.",
    }


@router.get("")
async def list_channels(user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    rows = await db.channel_connections.find({"workspace_id": ws}).to_list(100)
    by_slug = {row.get("channel"): row for row in rows}
    whatsapp = await db.whatsapp_connections.find_one({"workspace_id": ws})
    output = []
    for slug, definition in CHANNELS.items():
        if slug == "whatsapp":
            connected = bool(whatsapp and whatsapp.get("mode") == "live")
            output.append({
                "id": slug, **definition, "connected": connected,
                "status": "live" if connected else "setup_required",
                "label": "Primary WABA" if connected else "",
                "configured_fields": ["phone_number_id", "waba_id"] if connected else [],
                "updated_at": whatsapp.get("updated_at") if whatsapp else None,
                "last_verified_at": whatsapp.get("updated_at") if connected else None,
                "last_error": None,
                "note": "Live Meta WhatsApp Cloud API connection." if connected else "Connect Meta WhatsApp Cloud API credentials.",
            })
        else:
            output.append(_public_generic(slug, definition, by_slug.get(slug)))
    return output


@router.post("/test-send")
async def test_send(body: ChannelTestSendIn, user: dict = Depends(get_current_user)):
    channel = body.channel.strip()
    if channel.lower() not in {"whatsapp", "email", "sms"}:
        raise HTTPException(status_code=400, detail="This channel does not have a live delivery adapter yet")
    lead = await db.leads.find_one({"id": body.lead_id, "workspace_id": user["workspace_id"]})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    from multichannel import send_via_channel
    return await send_via_channel(
        user["workspace_id"], lead, channel, body.body, actor=user.get("name", "user")
    )


@router.get("/{slug}")
async def get_channel(slug: str, user: dict = Depends(get_current_user)):
    if slug not in CHANNELS:
        raise HTTPException(404, detail="Unknown channel or integration")
    if slug == "whatsapp":
        conn = await db.whatsapp_connections.find_one({"workspace_id": user["workspace_id"]})
        connected = bool(conn and conn.get("mode") == "live")
        return {"id": slug, **CHANNELS[slug], "connected": connected, "status": "live" if connected else "setup_required"}
    doc = await db.channel_connections.find_one({"workspace_id": user["workspace_id"], "channel": slug})
    return _public_generic(slug, CHANNELS[slug], doc)


@router.put("/{slug}")
async def save_channel(slug: str, body: ChannelIn, user: dict = Depends(require_role("owner", "admin"))):
    if slug not in CHANNELS or slug == "whatsapp":
        raise HTTPException(400, detail="Use the dedicated WhatsApp connection screen for WhatsApp")
    allowed = set(CHANNELS[slug]["fields"])
    supplied = {k: str(v).strip() for k, v in body.fields.items() if k in allowed and str(v).strip()}
    existing = await db.channel_connections.find_one({"workspace_id": user["workspace_id"], "channel": slug})
    if not supplied and not existing and body.enabled:
        raise HTTPException(400, detail="Add at least one configuration field")

    fields_enc = dict((existing or {}).get("fields_enc", {}))
    fields_enc.update({key: encrypt_str(value) for key, value in supplied.items()})
    field_kinds = dict((existing or {}).get("field_kinds", {}))
    field_kinds.update({key: ("secret" if any(h in key.lower() for h in SECRET_HINTS) else "value") for key in supplied})

    doc = {
        "workspace_id": user["workspace_id"], "channel": slug,
        "label": body.label.strip() or (existing or {}).get("label", ""), "enabled": body.enabled,
        "fields_enc": fields_enc,
        "field_kinds": field_kinds,
        "last_verified_at": None if supplied else (existing or {}).get("last_verified_at"),
        "last_error": None,
        "updated_at": now_iso(), "updated_by": user.get("id"),
    }
    await db.channel_connections.update_one(
        {"workspace_id": user["workspace_id"], "channel": slug}, {"$set": doc}, upsert=True,
    )
    await audit(user["workspace_id"], user.get("name", "user"), "channel.configured", "channel", {"channel": slug, "fields": list(supplied.keys())})
    return _public_generic(slug, CHANNELS[slug], doc)


@router.delete("/{slug}")
async def delete_channel(slug: str, user: dict = Depends(require_role("owner", "admin"))):
    if slug == "whatsapp":
        raise HTTPException(400, detail="Disconnect WhatsApp from the dedicated WhatsApp screen")
    if slug not in CHANNELS:
        raise HTTPException(404, detail="Unknown channel or integration")
    await db.channel_connections.delete_one({"workspace_id": user["workspace_id"], "channel": slug})
    await audit(user["workspace_id"], user.get("name", "user"), "channel.disconnected", "channel", {"channel": slug})
    return {"ok": True, "channel": slug, "status": "setup_required"}

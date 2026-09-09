"""Channel & integration hub for GOLD-e AI.

This module centralizes workspace connection state. WhatsApp keeps using the
existing live Meta connection; other providers are stored encrypted and are
reported as configured until a provider-specific delivery adapter verifies them.
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core import audit, db, encrypt_str, get_current_user, now_iso, require_role

router = APIRouter(prefix="/api/channels", tags=["channels"])

CHANNELS: dict[str, dict[str, Any]] = {
    "whatsapp": {"name": "WhatsApp", "group": "Messaging", "provider": "Meta Cloud API", "fields": []},
    "email": {"name": "Email", "group": "Messaging", "provider": "SMTP / API", "fields": ["provider", "host", "port", "username", "password", "from_email", "api_key"]},
    "sms": {"name": "SMS", "group": "Messaging", "provider": "MSG91 / API", "fields": ["provider", "auth_key", "sender_id", "template_id", "base_url"]},
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


def _public_generic(slug: str, definition: dict, doc: dict | None) -> dict:
    configured = bool(doc and doc.get("enabled", True))
    field_names = sorted((doc or {}).get("fields_enc", {}).keys())
    return {
        "id": slug,
        **definition,
        "connected": configured,
        "status": "configured" if configured else "setup_required",
        "label": (doc or {}).get("label", ""),
        "configured_fields": field_names,
        "updated_at": (doc or {}).get("updated_at"),
        "note": "Credentials saved securely. Provider delivery is enabled only where a live adapter is available.",
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
                "note": "Live Meta WhatsApp Cloud API connection." if connected else "Connect Meta WhatsApp Cloud API credentials.",
            })
        else:
            output.append(_public_generic(slug, definition, by_slug.get(slug)))
    return output


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
    if not supplied and body.enabled:
        raise HTTPException(400, detail="Add at least one configuration field")
    fields_enc = {key: encrypt_str(value) for key, value in supplied.items()}
    doc = {
        "workspace_id": user["workspace_id"], "channel": slug,
        "label": body.label.strip(), "enabled": body.enabled,
        "fields_enc": fields_enc,
        "field_kinds": {key: ("secret" if any(h in key.lower() for h in SECRET_HINTS) else "value") for key in supplied},
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

"""Live outbound provider adapters for non-WhatsApp channels.

Adapters are deliberately small and fail closed. Workspace credentials are read
from encrypted channel_connections documents. ENABLE_SIMULATION is honored for
CI/local E2E only; Cloud Run production keeps it false.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import smtplib
import ssl
from email.message import EmailMessage
from typing import Any

import httpx

from core import db, decrypt_str, now_iso


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


SIMULATION_ENABLED = _env_bool("ENABLE_SIMULATION", False)
DEFAULT_MSG91_URL = "https://api.msg91.com/api/v2/sendsms"


async def _connection(workspace_id: str, channel: str) -> dict | None:
    return await db.channel_connections.find_one({
        "workspace_id": workspace_id,
        "channel": channel,
        "enabled": {"$ne": False},
    })


def _fields(doc: dict | None) -> dict[str, str]:
    if not doc:
        return {}
    output: dict[str, str] = {}
    for key, encrypted in (doc.get("fields_enc") or {}).items():
        output[key] = decrypt_str(encrypted)
    return output


async def _mark_verified(workspace_id: str, channel: str, provider_id: str | None = None) -> None:
    await db.channel_connections.update_one(
        {"workspace_id": workspace_id, "channel": channel},
        {"$set": {
            "last_verified_at": now_iso(),
            "last_provider_id": provider_id,
            "last_error": None,
        }},
    )


async def _mark_error(workspace_id: str, channel: str, code: str) -> None:
    await db.channel_connections.update_one(
        {"workspace_id": workspace_id, "channel": channel},
        {"$set": {"last_error": code, "last_error_at": now_iso()}},
    )


def _smtp_send_sync(config: dict[str, str], to_email: str, subject: str, body: str) -> None:
    host = config.get("host", "").strip()
    from_email = config.get("from_email", "").strip()
    if not host or not from_email:
        raise RuntimeError("smtp_configuration_incomplete")

    try:
        port = int(config.get("port") or 587)
    except ValueError as exc:
        raise RuntimeError("smtp_port_invalid") from exc

    username = config.get("username", "").strip()
    password = config.get("password", "")
    security = (config.get("security") or ("ssl" if port == 465 else "starttls")).strip().lower()

    message = EmailMessage()
    message["From"] = from_email
    message["To"] = to_email
    message["Subject"] = subject or "Message from GOLD-e AI"
    message.set_content(body)

    context = ssl.create_default_context()
    if security == "ssl":
        with smtplib.SMTP_SSL(host, port, timeout=30, context=context) as client:
            if username:
                client.login(username, password)
            refused = client.send_message(message)
    else:
        with smtplib.SMTP(host, port, timeout=30) as client:
            client.ehlo()
            if security == "starttls":
                client.starttls(context=context)
                client.ehlo()
            if username:
                client.login(username, password)
            refused = client.send_message(message)

    if refused:
        raise RuntimeError("smtp_recipient_refused")


async def send_email(workspace_id: str, lead: dict, body: str, campaign: dict | None = None) -> dict[str, Any]:
    destination = (lead.get("email") or "").strip()
    if not destination or "@" not in destination:
        return {"mode": "disabled", "error": "missing_email_destination", "provider_id": None}

    if SIMULATION_ENABLED:
        provider_id = f"email.sim.{lead.get('id', 'unknown')}"
        return {"mode": "simulation", "provider_id": provider_id}

    doc = await _connection(workspace_id, "email")
    config = _fields(doc)
    if not doc or not config.get("host") or not config.get("from_email"):
        return {"mode": "disabled", "error": "email_provider_not_configured", "provider_id": None}

    subject = (campaign or {}).get("name") or "GOLD-e AI"
    try:
        await asyncio.to_thread(_smtp_send_sync, config, destination, subject, body)
        await _mark_verified(workspace_id, "email")
        return {"mode": "live", "provider_id": None}
    except Exception as exc:
        code = str(exc) if str(exc).startswith("smtp_") else "email_provider_send_failed"
        print(f"Email provider failed: {type(exc).__name__}")
        await _mark_error(workspace_id, "email", code)
        return {"mode": "live", "error": code, "provider_id": None}


def _digits(phone: str) -> str:
    return re.sub(r"[^0-9]", "", phone or "")


async def send_sms(workspace_id: str, lead: dict, body: str) -> dict[str, Any]:
    from core import decrypt_str as _decrypt

    destination = _digits(_decrypt(lead.get("phone_enc", "")))
    if not destination:
        return {"mode": "disabled", "error": "missing_sms_destination", "provider_id": None}

    if SIMULATION_ENABLED:
        provider_id = f"sms.sim.{lead.get('id', 'unknown')}"
        return {"mode": "simulation", "provider_id": provider_id}

    doc = await _connection(workspace_id, "sms")
    config = _fields(doc)
    auth_key = config.get("auth_key", "").strip()
    sender_id = config.get("sender_id", "").strip()
    if not doc or not auth_key or not sender_id:
        return {"mode": "disabled", "error": "sms_provider_not_configured", "provider_id": None}

    endpoint = (config.get("base_url") or DEFAULT_MSG91_URL).strip()
    sms_item: dict[str, Any] = {"message": body, "to": [destination]}
    if config.get("template_id"):
        sms_item["DLT_TE_ID"] = config["template_id"].strip()
    payload = {
        "sender": sender_id,
        "route": config.get("route", "4") or "4",
        "country": config.get("country", "91") or "91",
        "sms": [sms_item],
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                endpoint,
                headers={"authkey": auth_key, "Content-Type": "application/json"},
                json=payload,
            )
            response.raise_for_status()
            try:
                data = response.json()
            except json.JSONDecodeError:
                data = {"raw": response.text[:200]}
        provider_id = (
            data.get("request_id")
            or data.get("requestId")
            or data.get("message_id")
            or data.get("id")
        )
        await _mark_verified(workspace_id, "sms", str(provider_id) if provider_id else None)
        return {"mode": "live", "provider_id": str(provider_id) if provider_id else None}
    except Exception as exc:
        print(f"SMS provider failed: {type(exc).__name__}")
        await _mark_error(workspace_id, "sms", "sms_provider_send_failed")
        return {"mode": "live", "error": "sms_provider_send_failed", "provider_id": None}

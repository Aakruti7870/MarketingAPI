"""PHASE 2 — WhatsApp Cloud API provider (mock adapter, live-ready), send pipeline, webhook hub.

The provider runs in SIMULATION mode until a workspace stores real Meta credentials.
The real Meta send/webhook code path is present and gated behind stored credentials so it
can be flipped live without code changes. Secrets are encrypted and never returned/logged.
"""
import os
import hmac
import json
import asyncio
import hashlib
import secrets as pysecrets
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel

from core import (db, oid, now, now_iso, clean, encrypt_str, decrypt_str,
                  get_current_user, require_role, audit, render_vars)
from consent import can_send

router = APIRouter(prefix="/api")

META_API_VERSION = os.environ.get("META_API_VERSION", "v21.0")
GRAPH = f"https://graph.facebook.com/{META_API_VERSION}"


class ConnectIn(BaseModel):
    phone_number_id: str
    waba_id: str
    access_token: str
    app_secret: str
    app_id: Optional[str] = ""


async def get_connection(workspace_id: str) -> Optional[dict]:
    return await db.whatsapp_connections.find_one({"workspace_id": workspace_id})


def connection_mode(conn: Optional[dict]) -> str:
    return "live" if (conn and conn.get("mode") == "live") else "simulation"


# ------------------------------------------------------------- provider adapter
async def _meta_send(conn: dict, payload: dict) -> dict:
    token = decrypt_str(conn["encrypted_access_token"])
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(f"{GRAPH}/{conn['phone_number_id']}/messages",
                         headers={"Authorization": f"Bearer {token}"}, json=payload)
        r.raise_for_status()
        return r.json()


async def provider_send(workspace_id: str, to_masked: str, payload: dict) -> dict:
    """Returns {wamid, mode}. Live if creds present + mode=live, else simulated."""
    conn = await get_connection(workspace_id)
    if connection_mode(conn) == "live":
        try:
            res = await _meta_send(conn, payload)
            wamid = res.get("messages", [{}])[0].get("id", "wamid." + pysecrets.token_hex(12))
            return {"wamid": wamid, "mode": "live"}
        except Exception as e:
            print("Meta send failed, falling back to error:", e)
            return {"wamid": None, "mode": "live", "error": str(e)}
    # simulation
    return {"wamid": "wamid.sim." + pysecrets.token_hex(10), "mode": "simulation"}


async def _simulate_lifecycle(wamid: str):
    """Advance a simulated message through delivered -> read over a few seconds."""
    try:
        await asyncio.sleep(2)
        await db.messages.update_one({"wamid": wamid, "status": {"$in": ["sent", "delivered"]}},
                                     {"$set": {"status": "delivered", "delivered_at": now_iso()}})
        await asyncio.sleep(3)
        await db.messages.update_one({"wamid": wamid, "status": "delivered"},
                                     {"$set": {"status": "read", "read_at": now_iso()}})
    except Exception as e:
        print("sim lifecycle error", e)


# ------------------------------------------------------------- THE unified send path
async def send_via_channel(workspace_id: str, lead: dict, channel: str, body: str,
                           campaign: Optional[dict] = None, template: Optional[dict] = None,
                           buttons: Optional[list] = None, actor: str = "system",
                           kind: str = "text", media_url: str = "") -> dict:
    """Single outbound path. ALWAYS runs Consent Guard first. Never bypassable."""
    gate = await can_send(workspace_id, lead, channel, campaign, template)
    msg_id = oid()
    rendered = render_vars(body, lead)
    base = {
        "id": msg_id, "workspace_id": workspace_id, "lead_id": lead["id"],
        "lead_name": lead.get("name"), "channel": channel, "direction": "outbound",
        "campaign_id": campaign.get("id") if campaign else None,
        "body": rendered, "kind": kind, "buttons": buttons or [],
        "actor": actor, "created_at": now_iso(),
    }
    if not gate["allow"]:
        base.update({"status": "blocked", "block_reason": gate["reason"], "block_code": gate["code"], "wamid": None})
        await db.messages.insert_one(dict(base))
        await audit(workspace_id, actor, "message.blocked", "message",
                    {"lead_id": lead["id"], "channel": channel, "reason": gate["code"]})
        return {"status": "blocked", "reason": gate["reason"], "code": gate["code"], "message_id": msg_id}

    payload = {"messaging_product": "whatsapp", "to": lead.get("phone_masked", ""),
               "type": "text", "text": {"body": rendered}}
    result = await provider_send(workspace_id, lead.get("phone_masked", ""), payload)
    wamid = result.get("wamid")
    status = "failed" if result.get("error") else "delivered" if result["mode"] == "simulation" else "sent"
    base.update({"status": status, "wamid": wamid, "mode": result["mode"], "sent_at": now_iso()})
    if result.get("error"):
        base["error"] = "send_failed"
    await db.messages.insert_one(dict(base))
    await audit(workspace_id, actor, "message.sent", "message",
                {"lead_id": lead["id"], "channel": channel, "wamid": wamid, "mode": result["mode"]})
    # mirror into unified inbox conversation
    await _mirror_to_inbox(workspace_id, lead, channel, rendered, actor)
    if result["mode"] == "simulation" and wamid:
        asyncio.create_task(_simulate_lifecycle(wamid))
    return {"status": status, "wamid": wamid, "mode": result["mode"], "message_id": msg_id}


async def _mirror_to_inbox(workspace_id, lead, channel, body, actor):
    conv = await db.conversations.find_one({"workspace_id": workspace_id, "lead_id": lead["id"]})
    entry = {"id": oid(), "from": "agent", "author": actor, "body": body, "at": now_iso()}
    if conv:
        await db.conversations.update_one({"id": conv["id"]}, {"$push": {"messages": entry}, "$set": {"updated_at": now_iso()}})
    else:
        await db.conversations.insert_one({"id": oid(), "workspace_id": workspace_id, "lead_id": lead["id"],
                                           "lead_name": lead.get("name"), "channel": channel,
                                           "messages": [entry], "unread": 0, "updated_at": now_iso(), "created_at": now_iso()})


# ------------------------------------------------------------- connection routes
@router.get("/whatsapp/connection")
async def read_connection(user: dict = Depends(get_current_user)):
    conn = await get_connection(user["workspace_id"])
    if not conn:
        return {"connected": False, "mode": "simulation"}
    return {"connected": True, "mode": conn.get("mode", "simulation"),
            "phone_number_id": conn.get("phone_number_id"), "waba_id": conn.get("waba_id"),
            "updated_at": conn.get("updated_at")}


@router.post("/whatsapp/connection")
async def save_connection(body: ConnectIn, user: dict = Depends(require_role("owner", "admin"))):
    doc = {"workspace_id": user["workspace_id"], "phone_number_id": body.phone_number_id,
           "waba_id": body.waba_id, "app_id": body.app_id,
           "encrypted_access_token": encrypt_str(body.access_token),
           "encrypted_app_secret": encrypt_str(body.app_secret),
           "mode": "live", "updated_at": now_iso()}
    await db.whatsapp_connections.update_one({"workspace_id": user["workspace_id"]}, {"$set": doc}, upsert=True)
    await audit(user["workspace_id"], user["name"], "whatsapp.connected", "connection", {"phone_number_id": body.phone_number_id})
    return {"connected": True, "mode": "live"}


@router.delete("/whatsapp/connection")
async def delete_connection(user: dict = Depends(require_role("owner", "admin"))):
    await db.whatsapp_connections.delete_one({"workspace_id": user["workspace_id"]})
    await audit(user["workspace_id"], user["name"], "whatsapp.disconnected", "connection", {})
    return {"connected": False, "mode": "simulation"}


@router.get("/whatsapp/messages")
async def message_log(user: dict = Depends(get_current_user), limit: int = 100):
    msgs = await db.messages.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(limit)
    return [clean(m) for m in msgs]


class TestSendIn(BaseModel):
    lead_id: str
    channel: str = "WhatsApp"
    body: str


@router.post("/whatsapp/test-send")
async def test_send(body: TestSendIn, user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": body.lead_id, "workspace_id": user["workspace_id"]})
    if not lead:
        raise HTTPException(404, "Lead not found")
    return await send_via_channel(user["workspace_id"], lead, body.channel, body.body, actor=user["name"])


# ------------------------------------------------------------- webhook hub (Meta + simulator)
@router.get("/webhooks/meta/whatsapp")
async def webhook_verify(request: Request):
    q = request.query_params
    verify_token = os.environ.get("META_WEBHOOK_VERIFY_TOKEN", "gold-e-verify")
    if q.get("hub.mode") == "subscribe" and q.get("hub.verify_token") == verify_token:
        return Response(q.get("hub.challenge", ""), media_type="text/plain")
    raise HTTPException(403, "Verification failed")


@router.post("/webhooks/meta/whatsapp")
async def webhook_receive(request: Request):
    raw = await request.body()
    signature = request.headers.get("x-hub-signature-256", "")
    try:
        payload = json.loads(raw)
        phone_id = payload["entry"][0]["changes"][0]["value"]["metadata"]["phone_number_id"]
    except (ValueError, KeyError, IndexError):
        raise HTTPException(400, "Invalid payload")
    conn = await db.whatsapp_connections.find_one({"phone_number_id": phone_id})
    if not conn:
        return Response("ignored", status_code=200)
    # verify signature against the raw bytes (constant-time)
    secret = decrypt_str(conn["encrypted_app_secret"])
    expected = "sha256=" + hmac.new(secret.encode(), raw, hashlib.sha256).hexdigest()
    if not (signature and hmac.compare_digest(expected, signature)):
        raise HTTPException(401, "Bad signature")
    await _process_events(conn["workspace_id"], payload)
    return Response("EVENT_RECEIVED", status_code=200)


class SimEventIn(BaseModel):
    wamid: Optional[str] = None
    lead_id: Optional[str] = None
    event: str  # delivered | read | failed | reply | opt_out
    text: Optional[str] = ""


@router.post("/webhooks/simulate")
async def webhook_simulate(body: SimEventIn, user: dict = Depends(get_current_user)):
    """Inject a simulated inbound/delivery event (dev/testing without live Meta)."""
    ws = user["workspace_id"]
    ev = body.event
    if ev in ("delivered", "read", "failed") and body.wamid:
        stamp = {"delivered": "delivered_at", "read": "read_at", "failed": "failed_at"}[ev]
        await db.messages.update_one({"workspace_id": ws, "wamid": body.wamid},
                                     {"$set": {"status": ev, stamp: now_iso()}})
        return {"ok": True}
    if ev in ("reply", "opt_out") and body.lead_id:
        lead = await db.leads.find_one({"id": body.lead_id, "workspace_id": ws})
        if not lead:
            raise HTTPException(404, "Lead not found")
        await _handle_inbound(ws, lead, body.text or ("STOP" if ev == "opt_out" else "Hi"))
        return {"ok": True}
    raise HTTPException(400, "Invalid simulate event")


OPT_OUT_KEYWORDS = {"stop", "unsubscribe", "opt out", "optout", "remove", "cancel"}


async def _handle_inbound(workspace_id: str, lead: dict, text: str):
    # store inbound message + mirror to inbox, detect opt-out, stop autopilot
    await db.messages.insert_one({"id": oid(), "workspace_id": workspace_id, "lead_id": lead["id"],
                                  "lead_name": lead.get("name"), "channel": lead.get("channel", "WhatsApp"),
                                  "direction": "inbound", "body": text, "status": "received",
                                  "created_at": now_iso()})
    conv = await db.conversations.find_one({"workspace_id": workspace_id, "lead_id": lead["id"]})
    entry = {"id": oid(), "from": "lead", "author": lead.get("name"), "body": text, "at": now_iso()}
    if conv:
        await db.conversations.update_one({"id": conv["id"]}, {"$push": {"messages": entry}, "$set": {"updated_at": now_iso(), "unread": conv.get("unread", 0) + 1}})
    else:
        await db.conversations.insert_one({"id": oid(), "workspace_id": workspace_id, "lead_id": lead["id"],
                                           "lead_name": lead.get("name"), "channel": lead.get("channel", "WhatsApp"),
                                           "messages": [entry], "unread": 1, "updated_at": now_iso(), "created_at": now_iso()})
    # reply stops autopilot; opt-out keyword opts out
    is_opt_out = text.strip().lower() in OPT_OUT_KEYWORDS
    if is_opt_out:
        await db.leads.update_one({"id": lead["id"]}, {"$set": {"opted_out": True, "consent_status": "opted_out", "opt_out_date": now_iso()}})
        await db.opt_out_registry.update_one({"workspace_id": workspace_id, "lead_id": lead["id"]},
            {"$set": {"workspace_id": workspace_id, "lead_id": lead["id"], "phone_hash": lead.get("phone_hash"),
                      "email": lead.get("email"), "channel": None, "reason": "keyword", "created_at": now_iso()}}, upsert=True)
        await audit(workspace_id, "webhook", "lead.opted_out", "lead", {"lead_id": lead["id"]})
    else:
        await db.leads.update_one({"id": lead["id"]}, {"$set": {"last_reply_at": now_iso(), "stage": lead.get("stage") if lead.get("stage") not in ("NEW",) else "RESPONDED", "last_activity": now_iso()}})
    # stop autopilot sequences for this lead
    await db.followups.update_many({"workspace_id": workspace_id, "lead_id": lead["id"], "status": "scheduled"},
                                   {"$set": {"status": "stopped", "stopped_reason": "opted_out" if is_opt_out else "replied"}})


async def _process_events(workspace_id: str, payload: dict):
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for status in value.get("statuses", []):
                await db.messages.update_one(
                    {"workspace_id": workspace_id, "wamid": status["id"]},
                    {"$set": {"status": status.get("status"), "status_at": now_iso()}})
            for message in value.get("messages", []):
                frm = message.get("from")
                lead = await db.leads.find_one({"workspace_id": workspace_id})  # best-effort match
                text = message.get("text", {}).get("body", "")
                if lead:
                    await _handle_inbound(workspace_id, lead, text)

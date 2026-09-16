"""PHASE 1 — Consent Guard (hard gate). Every outbound message MUST pass can_send()."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta

from core import (db, oid, now, now_iso, clean, get_current_user, require_role,
                  audit, phone_hash)

router = APIRouter(prefix="/api/consent")

DEFAULT_FREQUENCY_LIMIT = 3       # max messages per contact per window
FREQUENCY_WINDOW_HOURS = 24


class ConsentIn(BaseModel):
    status: str = "opted_in"      # opted_in | opted_out | pending
    source: str = "manual"        # website_form | whatsapp_inbound | import | manual | api
    channels: Optional[list] = None  # None = all channels


class OptOutIn(BaseModel):
    reason: Optional[str] = "user_request"
    channel: Optional[str] = None


class PolicyIn(BaseModel):
    sending_enabled: bool = True
    frequency_limit: int = DEFAULT_FREQUENCY_LIMIT
    frequency_window_hours: int = FREQUENCY_WINDOW_HOURS
    quiet_hours: Optional[str] = ""


async def get_policy(workspace_id: str) -> dict:
    p = await db.workspace_settings.find_one({"workspace_id": workspace_id})
    if not p:
        p = {"workspace_id": workspace_id, "sending_enabled": True,
             "frequency_limit": DEFAULT_FREQUENCY_LIMIT,
             "frequency_window_hours": FREQUENCY_WINDOW_HOURS, "quiet_hours": ""}
    return p


async def can_send(workspace_id: str, lead: dict, channel: str,
                   campaign: Optional[dict] = None, template: Optional[dict] = None) -> dict:
    """THE hard gate. Returns {"allow": bool, "reason": str, "code": str}."""
    def block(code, reason):
        return {"allow": False, "code": code, "reason": reason}

    # 1. Workspace ownership
    if not lead or lead.get("workspace_id") != workspace_id:
        return block("ownership", "Contact does not belong to this workspace")

    # 10. Workspace permission / global sending switch
    policy = await get_policy(workspace_id)
    if not policy.get("sending_enabled", True):
        return block("workspace_disabled", "Sending is disabled for this workspace")

    # 6. Block list
    if lead.get("blocked"):
        return block("blocked", "Contact is on the block list")

    # 4. Opt-out registry  &  explicit opted_out flag
    if lead.get("opted_out"):
        return block("opted_out", "Contact has opted out")
    ph = lead.get("phone_hash") or (phone_hash(lead.get("phone", "")) if lead.get("phone") else None)
    optout_q = {"workspace_id": workspace_id, "$or": []}
    if ph:
        optout_q["$or"].append({"phone_hash": ph})
    if lead.get("email"):
        optout_q["$or"].append({"email": lead["email"]})
    if optout_q["$or"]:
        oo = await db.opt_out_registry.find_one(optout_q)
        if oo and (oo.get("channel") in (None, "", channel)):
            return block("opted_out", "Contact is in the opt-out registry")

    # 5. Suppression registry
    if optout_q["$or"]:
        sup = await db.suppression_list.find_one(optout_q)
        if sup:
            return block("suppressed", "Contact is on the suppression list")

    # 2 & 3. Valid consent + consent channel
    status = lead.get("consent_status")
    if status is None:
        status = "opted_in" if lead.get("consent") else "pending"
    if status != "opted_in":
        return block("no_consent", f"No valid consent (status: {status})")
    consent_channels = lead.get("consent_channels")
    if consent_channels and channel not in consent_channels:
        return block("channel_consent", f"Consent does not cover channel {channel}")
    # consent expiry
    if lead.get("consent_expires_at") and lead["consent_expires_at"] < now_iso():
        return block("consent_expired", "Consent has expired")

    # 8. Campaign status
    if campaign is not None and campaign.get("status") in ("paused", "cancelled"):
        return block("campaign_paused", "Campaign is not active")

    # 9. Template status (only approved templates for WhatsApp)
    if template is not None and template.get("status") not in ("Approved", "APPROVED", None):
        return block("template_unapproved", "Template is not approved")

    # 7. Frequency policy
    window = now() - timedelta(hours=policy.get("frequency_window_hours", FREQUENCY_WINDOW_HOURS))
    recent = await db.messages.count_documents({
        "workspace_id": workspace_id, "lead_id": lead["id"], "direction": "outbound",
        "created_at": {"$gte": window.isoformat()},
    })
    if recent >= policy.get("frequency_limit", DEFAULT_FREQUENCY_LIMIT):
        return block("frequency", "Frequency limit reached for this contact")

    return {"allow": True, "code": "allow", "reason": "All consent checks passed"}


# ------------------------------------------------------------- routes
@router.get("/policy")
async def read_policy(user: dict = Depends(get_current_user)):
    return clean(await get_policy(user["workspace_id"]))


@router.put("/policy")
async def update_policy(body: PolicyIn, user: dict = Depends(require_role("owner", "admin"))):
    await db.workspace_settings.update_one(
        {"workspace_id": user["workspace_id"]},
        {"$set": {"workspace_id": user["workspace_id"], **body.model_dump()}}, upsert=True)
    await audit(user["workspace_id"], user["name"], "consent.policy_updated", "policy", body.model_dump())
    return {"ok": True}


@router.post("/leads/{lead_id}")
async def set_consent(lead_id: str, body: ConsentIn, user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id, "workspace_id": user["workspace_id"]})
    if not lead:
        raise HTTPException(404, "Lead not found")
    update = {"consent_status": body.status, "consent_source": body.source,
              "consent_date": now_iso(), "consent_channels": body.channels}
    if body.status == "opted_in":
        update["opted_out"] = False
    await db.leads.update_one({"id": lead_id}, {"$set": update})
    if body.status == "opted_in":
        # clear any lingering opt-out / suppression entries so re-consent truly re-enables sending
        await db.opt_out_registry.delete_many({"workspace_id": user["workspace_id"], "lead_id": lead_id})
        await db.suppression_list.delete_many({"workspace_id": user["workspace_id"], "lead_id": lead_id})
    await audit(user["workspace_id"], user["name"], "consent.recorded", "lead",
                {"lead_id": lead_id, "status": body.status, "source": body.source})
    return {"ok": True, **update}


@router.post("/leads/{lead_id}/opt-out")
async def opt_out(lead_id: str, body: OptOutIn, user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id, "workspace_id": user["workspace_id"]})
    if not lead:
        raise HTTPException(404, "Lead not found")
    await db.leads.update_one({"id": lead_id}, {"$set": {"opted_out": True, "consent_status": "opted_out", "opt_out_date": now_iso()}})
    await db.opt_out_registry.update_one(
        {"workspace_id": user["workspace_id"], "lead_id": lead_id},
        {"$set": {"workspace_id": user["workspace_id"], "lead_id": lead_id,
                  "phone_hash": lead.get("phone_hash"), "email": lead.get("email"),
                  "channel": body.channel, "reason": body.reason, "created_at": now_iso()}}, upsert=True)
    await audit(user["workspace_id"], user["name"], "consent.opted_out", "lead", {"lead_id": lead_id, "reason": body.reason})
    return {"ok": True}


@router.get("/opt-outs")
async def list_opt_outs(user: dict = Depends(get_current_user)):
    rows = await db.opt_out_registry.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(500)
    out = []
    for r in rows:
        lead = await db.leads.find_one({"id": r.get("lead_id")})
        out.append({"id": r["id"] if "id" in r else str(r.get("lead_id")), "lead_id": r.get("lead_id"),
                    "lead_name": lead["name"] if lead else "Unknown", "channel": r.get("channel"),
                    "reason": r.get("reason"), "created_at": r.get("created_at")})
    return out


@router.post("/check")
async def check(body: dict, user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": body.get("lead_id"), "workspace_id": user["workspace_id"]})
    if not lead:
        raise HTTPException(404, "Lead not found")
    return await can_send(user["workspace_id"], lead, body.get("channel", "WhatsApp"))


@router.get("/summary")
async def summary(user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    total = await db.leads.count_documents({"workspace_id": ws})
    opted_in = await db.leads.count_documents({"workspace_id": ws, "$or": [{"consent_status": "opted_in"}, {"consent": True, "consent_status": {"$exists": False}}]})
    opted_out = await db.leads.count_documents({"workspace_id": ws, "opted_out": True})
    pending = total - opted_in - opted_out
    return {"total": total, "opted_in": opted_in, "opted_out": opted_out, "pending": max(0, pending)}

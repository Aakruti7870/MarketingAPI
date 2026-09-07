"""PHASE 3 — Campaign Studio: objective, audience, dynamic message, CTA/reply buttons,
poster attach, owner approval, pre-send safety (Consent Guard), send, pause."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from core import db, oid, now_iso, clean, get_current_user, require_role, audit, render_vars
from consent import can_send
from whatsapp import send_via_channel
from autopilot import schedule_followups, stop_followups

router = APIRouter(prefix="/api/studio")


class FollowupStep(BaseModel):
    day: int
    message: str


class FollowupConfig(BaseModel):
    enabled: bool = False
    time_unit: str = "days"      # days | minutes | seconds (seconds/minutes for demo)
    steps: list = []


class CampaignIn(BaseModel):
    name: str
    objective: str = "Lead nurturing"
    channel: str = "WhatsApp"
    segment: str = "All Leads"
    message: str = ""
    template_id: Optional[str] = None
    asset_id: Optional[str] = None
    cta_buttons: list = []       # [{label, url}]
    reply_buttons: list = []     # ["Yes", "No", "Tell me more"]
    schedule_at: Optional[str] = None
    followup: Optional[dict] = None


async def resolve_audience(workspace_id: str, segment: str):
    q = {"workspace_id": workspace_id}
    if segment in ("HOT", "WARM", "COLD"):
        q["temperature"] = segment
    return await db.leads.find(q).to_list(5000)


@router.post("/campaigns")
async def create(body: CampaignIn, user: dict = Depends(get_current_user)):
    audience = await resolve_audience(user["workspace_id"], body.segment)
    doc = {"id": oid(), "workspace_id": user["workspace_id"], **body.model_dump(),
           "status": "draft", "stats": {"audience": len(audience), "sent": 0, "delivered": 0,
                                        "replied": 0, "failed": 0, "blocked": 0},
           "created_by": user["name"], "created_at": now_iso()}
    await db.campaigns.insert_one(dict(doc))
    await audit(user["workspace_id"], user["name"], "campaign.created", "campaign", {"name": body.name})
    return clean(doc)


@router.get("/campaigns/{cid}")
async def detail(cid: str, user: dict = Depends(get_current_user)):
    c = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(404, "Campaign not found")
    # live report from messages
    report = {}
    for st in ["sent", "delivered", "read", "failed", "blocked"]:
        report[st] = await db.messages.count_documents({"workspace_id": user["workspace_id"], "campaign_id": cid, "status": st})
    report["replied"] = await db.messages.count_documents({"workspace_id": user["workspace_id"], "campaign_id": cid, "direction": "inbound"})
    return {**clean(c), "report": report}


@router.patch("/campaigns/{cid}")
async def update(cid: str, body: CampaignIn, user: dict = Depends(get_current_user)):
    c = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(404, "Campaign not found")
    if c.get("status") in ("sending", "sent"):
        raise HTTPException(400, "Cannot edit a campaign that is sending/sent")
    await db.campaigns.update_one({"id": cid}, {"$set": {**body.model_dump(), "status": "draft"}})
    return {"ok": True}


@router.post("/campaigns/{cid}/preview")
async def preview(cid: str, user: dict = Depends(get_current_user)):
    c = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(404, "Campaign not found")
    audience = await resolve_audience(user["workspace_id"], c.get("segment", "All Leads"))
    allowed, blocked, reasons = 0, 0, {}
    for lead in audience:
        gate = await can_send(user["workspace_id"], lead, c.get("channel", "WhatsApp"), c)
        if gate["allow"]:
            allowed += 1
        else:
            blocked += 1
            reasons[gate["code"]] = reasons.get(gate["code"], 0) + 1
    sample = render_vars(c.get("message", ""), audience[0]) if audience else c.get("message", "")
    return {"audience": len(audience), "allowed": allowed, "blocked": blocked,
            "block_reasons": reasons, "sample": sample}


@router.post("/campaigns/{cid}/approve")
async def approve(cid: str, user: dict = Depends(require_role("owner", "admin"))):
    c = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(404, "Campaign not found")
    await db.campaigns.update_one({"id": cid}, {"$set": {"status": "approved", "approved_by": user["name"], "approved_at": now_iso()}})
    await audit(user["workspace_id"], user["name"], "campaign.approved", "campaign", {"id": cid})
    return {"ok": True, "status": "approved"}


@router.post("/campaigns/{cid}/send")
async def send(cid: str, user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    c = await db.campaigns.find_one({"id": cid, "workspace_id": ws})
    if not c:
        raise HTTPException(404, "Campaign not found")
    if c.get("status") != "approved":
        raise HTTPException(400, "Campaign must be approved before sending (human approval required)")
    await db.campaigns.update_one({"id": cid}, {"$set": {"status": "sending"}})
    audience = await resolve_audience(ws, c.get("segment", "All Leads"))
    template = None
    if c.get("template_id"):
        template = await db.templates.find_one({"id": c["template_id"], "workspace_id": ws})
    sent = blocked = failed = 0
    for lead in audience:
        res = await send_via_channel(ws, lead, c.get("channel", "WhatsApp"), c.get("message", ""),
                                     campaign=c, template=template, buttons=c.get("cta_buttons"),
                                     actor=f"campaign:{c['name']}")
        if res["status"] == "blocked":
            blocked += 1
        elif res["status"] == "failed":
            failed += 1
        else:
            sent += 1
            fu = c.get("followup") or {}
            if fu.get("enabled") and fu.get("steps"):
                await schedule_followups(ws, c, lead)
    stats = {"audience": len(audience), "sent": sent, "delivered": sent, "replied": 0, "failed": failed, "blocked": blocked}
    await db.campaigns.update_one({"id": cid}, {"$set": {"status": "sent", "stats": stats, "sent_at": now_iso()}})
    await audit(ws, user["name"], "campaign.sent", "campaign", {"id": cid, "sent": sent, "blocked": blocked})
    return {"status": "sent", "sent": sent, "blocked": blocked, "failed": failed}


@router.post("/campaigns/{cid}/pause")
async def pause(cid: str, user: dict = Depends(get_current_user)):
    c = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not c:
        raise HTTPException(404, "Campaign not found")
    await db.campaigns.update_one({"id": cid}, {"$set": {"status": "paused"}})
    await stop_followups(user["workspace_id"], cid, reason="campaign_paused")
    await audit(user["workspace_id"], user["name"], "campaign.paused", "campaign", {"id": cid})
    return {"ok": True, "status": "paused"}

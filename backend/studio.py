"""Campaign Studio: audience, approval, consent preview, scheduling and delivery."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from autopilot import schedule_followups, stop_followups
from consent import can_send
from core import audit, clean, db, get_current_user, now_iso, oid, render_vars, require_role
from whatsapp import send_via_channel

router = APIRouter(prefix="/api/studio")


class FollowupStep(BaseModel):
    day: int
    message: str


class FollowupConfig(BaseModel):
    enabled: bool = False
    time_unit: str = "days"
    steps: list = Field(default_factory=list)


class CampaignIn(BaseModel):
    name: str
    objective: str = "Lead nurturing"
    channel: str = "WhatsApp"
    segment: str = "All Leads"
    message: str = ""
    template_id: Optional[str] = None
    asset_id: Optional[str] = None
    cta_buttons: list = Field(default_factory=list)
    reply_buttons: list = Field(default_factory=list)
    schedule_at: Optional[str] = None
    followup: Optional[dict] = None


async def resolve_audience(workspace_id: str, segment: str):
    query = {"workspace_id": workspace_id}
    if segment in ("HOT", "WARM", "COLD"):
        query["temperature"] = segment
    return await db.leads.find(query).to_list(5000)


async def _live_report(workspace_id: str, campaign_id: str) -> dict:
    report = {}
    for status in ["sent", "delivered", "read", "failed", "blocked"]:
        report[status] = await db.messages.count_documents({
            "workspace_id": workspace_id,
            "campaign_id": campaign_id,
            "status": status,
        })
    report["replied"] = await db.messages.count_documents({
        "workspace_id": workspace_id,
        "campaign_id": campaign_id,
        "direction": "inbound",
    })
    return report


async def execute_campaign(campaign: dict, actor: str) -> dict:
    """Execute an approved/scheduled campaign once using an atomic state claim."""
    ws = campaign["workspace_id"]
    cid = campaign["id"]
    claim = await db.campaigns.update_one(
        {"id": cid, "workspace_id": ws, "status": {"$in": ["approved", "scheduled"]}},
        {"$set": {"status": "sending", "sending_at": now_iso()}},
    )
    if claim.modified_count != 1:
        fresh = await db.campaigns.find_one({"id": cid, "workspace_id": ws})
        return {"status": fresh.get("status") if fresh else "missing", "already_claimed": True}

    audience = await resolve_audience(ws, campaign.get("segment", "All Leads"))
    template = None
    if campaign.get("template_id"):
        template = await db.templates.find_one({"id": campaign["template_id"], "workspace_id": ws})

    counters = {"sent": 0, "delivered": 0, "read": 0, "failed": 0, "blocked": 0}
    for lead in audience:
        result = await send_via_channel(
            ws,
            lead,
            campaign.get("channel", "WhatsApp"),
            campaign.get("message", ""),
            campaign=campaign,
            template=template,
            buttons=campaign.get("cta_buttons"),
            actor=actor,
        )
        state = result.get("status", "failed")
        if state in counters:
            counters[state] += 1
        elif state == "sent":
            counters["sent"] += 1
        else:
            counters["failed"] += 1

        if state not in ("blocked", "failed"):
            followup = campaign.get("followup") or {}
            if followup.get("enabled") and followup.get("steps"):
                await schedule_followups(ws, campaign, lead)

    # Never claim delivery unless the provider/webhook actually reported it.
    stats = {
        "audience": len(audience),
        "sent": counters["sent"] + counters["delivered"] + counters["read"],
        "delivered": counters["delivered"] + counters["read"],
        "read": counters["read"],
        "replied": 0,
        "failed": counters["failed"],
        "blocked": counters["blocked"],
    }
    await db.campaigns.update_one(
        {"id": cid, "workspace_id": ws},
        {"$set": {"status": "sent", "stats": stats, "sent_at": now_iso()}},
    )
    await audit(ws, actor, "campaign.sent", "campaign", {
        "id": cid,
        "sent": stats["sent"],
        "blocked": stats["blocked"],
        "failed": stats["failed"],
    })
    return {"status": "sent", **stats}


async def run_scheduled_campaigns(limit: int = 20) -> dict:
    """Run due scheduled campaigns; safe to call repeatedly from Cloud Scheduler."""
    due = await db.campaigns.find({
        "status": "scheduled",
        "schedule_at": {"$lte": now_iso()},
    }).sort("schedule_at", 1).to_list(limit)
    result = {"found": len(due), "executed": 0, "skipped": 0}
    for campaign in due:
        out = await execute_campaign(campaign, actor="scheduler")
        if out.get("already_claimed"):
            result["skipped"] += 1
        else:
            result["executed"] += 1
    return result


@router.post("/campaigns")
async def create(body: CampaignIn, user: dict = Depends(get_current_user)):
    audience = await resolve_audience(user["workspace_id"], body.segment)
    doc = {
        "id": oid(),
        "workspace_id": user["workspace_id"],
        **body.model_dump(),
        "status": "draft",
        "stats": {
            "audience": len(audience),
            "sent": 0,
            "delivered": 0,
            "read": 0,
            "replied": 0,
            "failed": 0,
            "blocked": 0,
        },
        "created_by": user["name"],
        "created_at": now_iso(),
    }
    await db.campaigns.insert_one(dict(doc))
    await audit(user["workspace_id"], user["name"], "campaign.created", "campaign", {"name": body.name})
    return clean(doc)


@router.get("/campaigns/{cid}")
async def detail(cid: str, user: dict = Depends(get_current_user)):
    campaign = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    return {**clean(campaign), "report": await _live_report(user["workspace_id"], cid)}


@router.patch("/campaigns/{cid}")
async def update(cid: str, body: CampaignIn, user: dict = Depends(get_current_user)):
    campaign = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    if campaign.get("status") in ("sending", "sent"):
        raise HTTPException(400, "Cannot edit a campaign that is sending/sent")
    await db.campaigns.update_one(
        {"id": cid, "workspace_id": user["workspace_id"]},
        {"$set": {**body.model_dump(), "status": "draft", "approved_at": None, "approved_by": None}},
    )
    return {"ok": True}


@router.post("/campaigns/{cid}/preview")
async def preview(cid: str, user: dict = Depends(get_current_user)):
    campaign = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    audience = await resolve_audience(user["workspace_id"], campaign.get("segment", "All Leads"))
    allowed = blocked = 0
    reasons = {}
    for lead in audience:
        gate = await can_send(user["workspace_id"], lead, campaign.get("channel", "WhatsApp"), campaign)
        if gate["allow"]:
            allowed += 1
        else:
            blocked += 1
            reasons[gate["code"]] = reasons.get(gate["code"], 0) + 1
    sample = render_vars(campaign.get("message", ""), audience[0]) if audience else campaign.get("message", "")
    return {
        "audience": len(audience),
        "allowed": allowed,
        "blocked": blocked,
        "block_reasons": reasons,
        "sample": sample,
    }


@router.post("/campaigns/{cid}/approve")
async def approve(cid: str, user: dict = Depends(require_role("owner", "admin"))):
    campaign = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    status = "scheduled" if campaign.get("schedule_at") and campaign["schedule_at"] > now_iso() else "approved"
    await db.campaigns.update_one(
        {"id": cid, "workspace_id": user["workspace_id"]},
        {"$set": {"status": status, "approved_by": user["name"], "approved_at": now_iso()}},
    )
    await audit(user["workspace_id"], user["name"], "campaign.approved", "campaign", {"id": cid, "status": status})
    return {"ok": True, "status": status}


@router.post("/campaigns/{cid}/send")
async def send(cid: str, user: dict = Depends(get_current_user)):
    campaign = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    if campaign.get("status") != "approved":
        raise HTTPException(400, "Campaign must be approved and not waiting for a future schedule")
    return await execute_campaign(campaign, actor=user["name"])


@router.post("/campaigns/{cid}/pause")
async def pause(cid: str, user: dict = Depends(get_current_user)):
    campaign = await db.campaigns.find_one({"id": cid, "workspace_id": user["workspace_id"]})
    if not campaign:
        raise HTTPException(404, "Campaign not found")
    await db.campaigns.update_one(
        {"id": cid, "workspace_id": user["workspace_id"]},
        {"$set": {"status": "paused", "paused_at": now_iso()}},
    )
    await stop_followups(user["workspace_id"], cid, reason="campaign_paused")
    await audit(user["workspace_id"], user["name"], "campaign.paused", "campaign", {"id": cid})
    return {"ok": True, "status": "paused"}

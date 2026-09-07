"""PHASE 5 — Follow-up Autopilot. Configurable per campaign. STOPS on reply / opt-out /
convert / consent revoke / campaign pause. Runs an in-process scheduler loop."""
import asyncio
from datetime import timedelta
from fastapi import APIRouter, Depends

from core import db, oid, now, now_iso, clean, get_current_user

router = APIRouter(prefix="/api/autopilot")


def _delta(unit: str, amount: int) -> timedelta:
    if unit == "seconds":
        return timedelta(seconds=amount)
    if unit == "minutes":
        return timedelta(minutes=amount)
    return timedelta(days=amount)


async def schedule_followups(workspace_id: str, campaign: dict, lead: dict):
    fu = campaign.get("followup") or {}
    unit = fu.get("time_unit", "days")
    base = now()
    for idx, step in enumerate(fu.get("steps", [])):
        due = base + _delta(unit, int(step.get("day", (idx + 1) * 2)))
        await db.followups.insert_one({
            "id": oid(), "workspace_id": workspace_id, "campaign_id": campaign["id"],
            "campaign_name": campaign.get("name"), "lead_id": lead["id"], "lead_name": lead.get("name"),
            "channel": campaign.get("channel", "WhatsApp"), "step_index": idx,
            "day": step.get("day"), "message": step.get("message", ""),
            "due_at": due.isoformat(), "status": "scheduled", "created_at": now_iso(),
        })


async def stop_followups(workspace_id: str, campaign_id: str, reason: str):
    await db.followups.update_many(
        {"workspace_id": workspace_id, "campaign_id": campaign_id, "status": "scheduled"},
        {"$set": {"status": "stopped", "stopped_reason": reason}})


async def _run_due():
    """Process due follow-ups; enforce all STOP conditions before each send."""
    from whatsapp import send_via_channel   # lazy import to avoid cycle
    due = await db.followups.find({"status": "scheduled", "due_at": {"$lte": now_iso()}}).to_list(200)
    for f in due:
        ws = f["workspace_id"]
        lead = await db.leads.find_one({"id": f["lead_id"], "workspace_id": ws})
        campaign = await db.campaigns.find_one({"id": f["campaign_id"], "workspace_id": ws})
        if not lead or not campaign:
            await db.followups.update_one({"id": f["id"]}, {"$set": {"status": "stopped", "stopped_reason": "missing"}})
            continue
        # STOP conditions
        stop = None
        if campaign.get("status") in ("paused", "cancelled"):
            stop = "campaign_paused"
        elif lead.get("opted_out"):
            stop = "opted_out"
        elif lead.get("last_reply_at") and lead["last_reply_at"] > campaign.get("sent_at", ""):
            stop = "replied"
        elif lead.get("stage") == "WON":
            stop = "converted"
        if stop:
            await db.followups.update_one({"id": f["id"]}, {"$set": {"status": "stopped", "stopped_reason": stop}})
            continue
        res = await send_via_channel(ws, lead, f["channel"], f["message"], campaign=campaign,
                                     actor=f"autopilot:{campaign.get('name')}")
        await db.followups.update_one({"id": f["id"]},
            {"$set": {"status": "blocked" if res["status"] == "blocked" else "sent",
                      "sent_at": now_iso(), "result": res.get("status")}})


async def autopilot_loop():
    while True:
        try:
            await _run_due()
        except Exception as e:
            print("autopilot loop error:", e)
        await asyncio.sleep(15)


@router.get("")
async def list_followups(user: dict = Depends(get_current_user)):
    rows = await db.followups.find({"workspace_id": user["workspace_id"]}).sort("due_at", 1).to_list(500)
    return [clean(r) for r in rows]


@router.get("/summary")
async def summary(user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    out = {}
    for st in ["scheduled", "sent", "stopped", "blocked"]:
        out[st] = await db.followups.count_documents({"workspace_id": ws, "status": st})
    return out

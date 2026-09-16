"""Follow-up Autopilot.

Cloud Run production uses an authenticated scheduler tick instead of relying on a
per-instance infinite loop. The optional in-process loop remains available only
for local development when ENABLE_IN_PROCESS_AUTOPILOT=true.
"""
import asyncio
import os
import secrets
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request

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
        followup_key = f"{campaign['id']}:{lead['id']}:{idx}"
        await db.followups.update_one(
            {"workspace_id": workspace_id, "followup_key": followup_key},
            {"$setOnInsert": {
                "id": oid(),
                "followup_key": followup_key,
                "workspace_id": workspace_id,
                "campaign_id": campaign["id"],
                "campaign_name": campaign.get("name"),
                "lead_id": lead["id"],
                "lead_name": lead.get("name"),
                "channel": campaign.get("channel", "WhatsApp"),
                "step_index": idx,
                "day": step.get("day"),
                "message": step.get("message", ""),
                "due_at": due.isoformat(),
                "status": "scheduled",
                "created_at": now_iso(),
            }},
            upsert=True,
        )


async def stop_followups(workspace_id: str, campaign_id: str, reason: str):
    await db.followups.update_many(
        {
            "workspace_id": workspace_id,
            "campaign_id": campaign_id,
            "status": {"$in": ["scheduled", "processing"]},
        },
        {"$set": {"status": "stopped", "stopped_reason": reason, "stopped_at": now_iso()}},
    )


async def run_due(limit: int = 200) -> dict:
    """Process due follow-ups once with atomic claims to prevent duplicate sends."""
    from multichannel import send_via_channel

    due = await db.followups.find(
        {"status": "scheduled", "due_at": {"$lte": now_iso()}}
    ).sort("due_at", 1).to_list(limit)

    summary = {"found": len(due), "sent": 0, "blocked": 0, "failed": 0, "stopped": 0}
    for item in due:
        claim = await db.followups.update_one(
            {"id": item["id"], "status": "scheduled"},
            {"$set": {"status": "processing", "processing_at": now_iso()}},
        )
        if claim.modified_count != 1:
            continue

        ws = item["workspace_id"]
        lead = await db.leads.find_one({"id": item["lead_id"], "workspace_id": ws})
        campaign = await db.campaigns.find_one({"id": item["campaign_id"], "workspace_id": ws})

        stop_reason = None
        if not lead or not campaign:
            stop_reason = "missing"
        elif campaign.get("status") in ("paused", "cancelled"):
            stop_reason = "campaign_paused"
        elif lead.get("opted_out"):
            stop_reason = "opted_out"
        elif lead.get("last_reply_at") and lead["last_reply_at"] > campaign.get("sent_at", ""):
            stop_reason = "replied"
        elif lead.get("stage") == "WON":
            stop_reason = "converted"

        if stop_reason:
            await db.followups.update_one(
                {"id": item["id"], "status": "processing"},
                {"$set": {
                    "status": "stopped",
                    "stopped_reason": stop_reason,
                    "stopped_at": now_iso(),
                }},
            )
            summary["stopped"] += 1
            continue

        try:
            result = await send_via_channel(
                ws,
                lead,
                item["channel"],
                item["message"],
                campaign=campaign,
                actor=f"autopilot:{campaign.get('name')}",
            )
            state = result.get("status")
            final_status = "blocked" if state == "blocked" else "failed" if state == "failed" else "sent"
            await db.followups.update_one(
                {"id": item["id"], "status": "processing"},
                {"$set": {"status": final_status, "sent_at": now_iso(), "result": state}},
            )
            summary[final_status] += 1
        except Exception as exc:
            await db.followups.update_one(
                {"id": item["id"], "status": "processing"},
                {"$set": {
                    "status": "failed",
                    "failed_at": now_iso(),
                    "error": type(exc).__name__,
                }},
            )
            summary["failed"] += 1

    return summary


async def run_saas_scheduler() -> dict:
    """One production scheduler pass: campaigns first, then due follow-ups."""
    from studio import run_scheduled_campaigns

    campaigns = await run_scheduled_campaigns()
    followups = await run_due()
    return {"campaigns": campaigns, "followups": followups, "ran_at": now_iso()}


async def autopilot_loop():
    """Local-only compatibility loop; disabled by default on Cloud Run."""
    if os.environ.get("ENABLE_IN_PROCESS_AUTOPILOT", "false").lower() not in {"1", "true", "yes", "on"}:
        return
    while True:
        try:
            await run_saas_scheduler()
        except Exception as exc:
            print(f"autopilot loop error: {type(exc).__name__}")
        await asyncio.sleep(30)


@router.post("/internal/run")
async def scheduler_tick(request: Request):
    """Cloud Scheduler target. Protect with CRON_SECRET from Secret Manager."""
    configured = os.environ.get("CRON_SECRET", "")
    supplied = request.headers.get("X-Cron-Secret", "")
    if not configured:
        raise HTTPException(status_code=503, detail="Scheduler secret is not configured")
    if not supplied or not secrets.compare_digest(configured, supplied):
        raise HTTPException(status_code=401, detail="Invalid scheduler credential")
    return await run_saas_scheduler()


@router.get("")
async def list_followups(user: dict = Depends(get_current_user)):
    rows = await db.followups.find({"workspace_id": user["workspace_id"]}).sort("due_at", 1).to_list(500)
    return [clean(row) for row in rows]


@router.get("/summary")
async def summary(user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    out = {}
    for status in ["scheduled", "processing", "sent", "stopped", "blocked", "failed"]:
        out[status] = await db.followups.count_documents({"workspace_id": ws, "status": status})
    return out

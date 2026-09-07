"""Workspace SaaS plan, entitlement, usage and provider-readiness APIs.

This module intentionally does not let a workspace self-upgrade. Billing can
later update workspaces.plan after a verified payment/webhook event.
"""
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from core import db, get_current_user

router = APIRouter(prefix="/api/saas")

PLANS = {
    "Starter": {
        "leads": 1000,
        "team_members": 3,
        "monthly_messages": 2000,
        "api_keys": 2,
        "monthly_ai_actions": 200,
    },
    "Growth": {
        "leads": 10000,
        "team_members": 10,
        "monthly_messages": 25000,
        "api_keys": 10,
        "monthly_ai_actions": 2000,
    },
    "Scale": {
        "leads": 100000,
        "team_members": 50,
        "monthly_messages": 250000,
        "api_keys": 50,
        "monthly_ai_actions": 20000,
    },
    "Enterprise": {
        "leads": None,
        "team_members": None,
        "monthly_messages": None,
        "api_keys": None,
        "monthly_ai_actions": None,
    },
}


def _month_start() -> str:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()


def _pct(value: int, limit: int | None) -> float | None:
    if limit is None:
        return None
    if limit <= 0:
        return 100.0
    return round(min(100.0, value / limit * 100), 1)


@router.get("/plans")
async def plans(user: dict = Depends(get_current_user)):
    workspace = await db.workspaces.find_one({"id": user["workspace_id"]}) or {}
    current = workspace.get("plan") or "Growth"
    return {
        "current": current if current in PLANS else "Growth",
        "plans": PLANS,
        "billing_managed": True,
    }


@router.get("/overview")
async def overview(user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    workspace = await db.workspaces.find_one({"id": ws}) or {}
    plan = workspace.get("plan") or "Growth"
    if plan not in PLANS:
        plan = "Growth"
    limits = PLANS[plan]
    month_start = _month_start()

    leads = await db.leads.count_documents({"workspace_id": ws})
    team_members = await db.users.count_documents({"workspace_id": ws})
    api_keys = await db.api_keys.count_documents({"workspace_id": ws, "revoked": {"$ne": True}})
    monthly_messages = await db.messages.count_documents({
        "workspace_id": ws,
        "direction": "outbound",
        "created_at": {"$gte": month_start},
    })
    generated_assets = await db.generated_assets.count_documents({
        "workspace_id": ws,
        "created_at": {"$gte": month_start},
    })
    ai_audits = await db.audit.count_documents({
        "workspace_id": ws,
        "created_at": {"$gte": month_start},
        "action": {"$regex": "^ai\\."},
    })
    monthly_ai_actions = generated_assets + ai_audits

    whatsapp = await db.whatsapp_connections.find_one({"workspace_id": ws})
    openai_configured = bool(os.environ.get("OPENAI_API_KEY", "").strip())
    scheduler_configured = bool(os.environ.get("CRON_SECRET", "").strip())

    usage = {
        "leads": leads,
        "team_members": team_members,
        "monthly_messages": monthly_messages,
        "api_keys": api_keys,
        "monthly_ai_actions": monthly_ai_actions,
    }
    utilization = {key: _pct(value, limits.get(key)) for key, value in usage.items()}

    return {
        "workspace": {
            "id": ws,
            "name": workspace.get("name", user.get("workspace_name", "")),
            "plan": plan,
        },
        "usage": usage,
        "limits": limits,
        "utilization": utilization,
        "providers": {
            "openai": {"configured": openai_configured},
            "whatsapp": {
                "configured": bool(whatsapp),
                "mode": whatsapp.get("mode", "disabled") if whatsapp else "disabled",
            },
            "scheduler": {"configured": scheduler_configured},
        },
        "period": {"month_start": month_start},
    }

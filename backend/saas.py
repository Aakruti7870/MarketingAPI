"""Workspace SaaS plan, entitlement, usage and provider-readiness APIs."""
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from billing import PLAN_LIMITS, PRICING, ensure_wallet
from core import db, get_current_user

router = APIRouter(prefix="/api/saas")


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
    workspace = await ensure_wallet(user["workspace_id"])
    current = workspace.get("plan") or "Free"
    return {
        "current": current if current in PLAN_LIMITS else "Free",
        "plans": PLAN_LIMITS,
        "pricing": PRICING,
        "billing_managed": True,
    }


@router.get("/overview")
async def overview(user: dict = Depends(get_current_user)):
    ws = user["workspace_id"]
    workspace = await ensure_wallet(ws)
    plan = workspace.get("plan") or "Free"
    if plan not in PLAN_LIMITS:
        plan = "Free"
    limits = PLAN_LIMITS[plan]
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
            "billing_interval": workspace.get("billing_interval"),
            "subscription_status": workspace.get("subscription_status", "free"),
        },
        "wallet": {
            "coin_balance": workspace.get("coin_balance", 0),
            "coin_period": workspace.get("coin_period", "lifetime"),
            "free_grant": 100,
            "paid_monthly_refill": 2000,
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

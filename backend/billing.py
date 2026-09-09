"""Pricing, coin wallet, and billing APIs.

Launch model:
- Free: 100 one-time coins. They never reset.
- Pro Monthly: INR 1,999/month with 2,000 coins refreshed monthly.
- Pro Annual: INR 19,990/year with the same 2,000-coin monthly refresh.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core import db, get_current_user, now_iso, oid

router = APIRouter(prefix="/api/billing")

FREE_COINS = 100
PRO_MONTHLY_COINS = 2000

PLAN_LIMITS = {
    "Free": {
        "leads": 1000,
        "team_members": 1,
        "monthly_messages": 500,
        "api_keys": 1,
        "monthly_ai_actions": None,
    },
    "Pro": {
        "leads": 10000,
        "team_members": 10,
        "monthly_messages": 25000,
        "api_keys": 10,
        "monthly_ai_actions": None,
    },
}

COIN_COSTS = {
    "ai_text": 1,
    "lead_rescore": 1,
    "conversation_ai": 1,
    "ai_marketing": 2,
    "quotation_ai": 2,
    "ai_command": 2,
    "ai_poster": 10,
}

PRICING = {
    "currency": "INR",
    "tax_note": "Taxes/GST extra as applicable. Meta/WhatsApp messaging charges are separate.",
    "free": {
        "name": "Free",
        "price": 0,
        "interval": "lifetime",
        "coins": FREE_COINS,
        "coin_policy": "one_time",
        "description": "Start with the complete workflow and spend 100 coins on AI-powered actions.",
        "features": [
            "100 one-time coins",
            "1 workspace owner",
            "Up to 1,000 leads",
            "CRM, pipeline and inbox",
            "Campaign drafts and basic analytics",
            "1 developer API key",
        ],
    },
    "monthly": {
        "name": "Pro Monthly",
        "plan": "Pro",
        "price": 1999,
        "interval": "month",
        "coins": PRO_MONTHLY_COINS,
        "coin_policy": "monthly_refresh",
        "description": "For growing teams that want full automation without an annual commitment.",
        "features": [
            "2,000 coins every month",
            "Up to 10 team members",
            "Up to 10,000 leads",
            "25,000 platform messages / month",
            "10 developer API keys",
            "AI Studio, Autopilot and advanced analytics",
            "Live WhatsApp integration",
        ],
    },
    "annual": {
        "name": "Pro Annual",
        "plan": "Pro",
        "price": 19990,
        "interval": "year",
        "effective_monthly": 1666,
        "list_annual": 23988,
        "save": 3998,
        "save_percent": 16.7,
        "coins": PRO_MONTHLY_COINS,
        "coin_policy": "monthly_refresh",
        "description": "Best value for teams using GOLD-e as an ongoing revenue operating system.",
        "features": [
            "2,000 coins refreshed every month (24,000/year)",
            "Everything in Pro Monthly",
            "Save ₹3,998 versus month-to-month billing",
            "Annual commitment with monthly coin controls",
            "Priority product support",
        ],
    },
    "coin_costs": COIN_COSTS,
}


def _period_key() -> str:
    now = datetime.now(timezone.utc)
    return f"{now.year:04d}-{now.month:02d}"


def _normalize_plan(plan: str | None) -> str:
    return plan if plan in PLAN_LIMITS else "Free"


async def ensure_wallet(workspace_id: str) -> dict:
    """Initialize/migrate a workspace wallet and refresh paid monthly coins once per month."""
    workspace = await db.workspaces.find_one({"id": workspace_id})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    plan = _normalize_plan(workspace.get("plan"))
    updates = {}
    if workspace.get("plan") != plan:
        updates["plan"] = plan

    if "coin_balance" not in workspace:
        if plan == "Pro" and workspace.get("subscription_status") == "active":
            updates.update({
                "coin_balance": PRO_MONTHLY_COINS,
                "coin_period": _period_key(),
                "coin_lifetime_granted": PRO_MONTHLY_COINS,
            })
        else:
            updates.update({
                "coin_balance": FREE_COINS,
                "coin_period": "lifetime",
                "coin_lifetime_granted": FREE_COINS,
                "subscription_status": workspace.get("subscription_status") or "free",
            })

    if updates:
        await db.workspaces.update_one({"id": workspace_id}, {"$set": updates)
        workspace.update(updates)

    if plan == "Pro" and workspace.get("subscription_status") == "active":
        current_period = _period_key()
        if workspace.get("coin_period") != current_period:
            await db.workspaces.update_one(
                {"id": workspace_id},
                {"$set": {
                    "coin_balance": PRO_MONTHLY_COINS,
                    "coin_period": current_period,
                    "coins_refreshed_at": now_iso(),
                }},
            )
            workspace["coin_balance"] = PRO_MONTHLY_COINS
            workspace["coin_period"] = current_period

    return workspace


async def debit_coins(workspace_id: str, cost: int, action: str, actor: str = "system") -> dict:
    if cost <= 0:
        return await ensure_wallet(workspace_id)
    await ensure_wallet(workspace_id)
    workspace = await db.workspaces.find_one_and_update(
        {"id": workspace_id, "coin_balance": {"$gte": cost}},
        {"$inc": {"coin_balance": -cost}, "$set": {"last_coin_spend_at": now_iso()}},
        return_document=True,
    )
    if not workspace:
        current = await db.workspaces.find_one({"id": workspace_id}) or {}
        raise HTTPException(
            status_code=402,
            detail={
                "code": "coins_exhausted",
                "message": "Your coin balance is too low for this AI action.",
                "required": cost,
                "balance": current.get("coin_balance", 0),
                "pricing_url": "/pricing",
            },
        )
    await db.coin_ledger.insert_one({
        "id": oid(),
        "workspace_id": workspace_id,
        "direction": "debit",
        "coins": cost,
        "action": action,
        "actor": actor,
        "balance_after": workspace.get("coin_balance", 0),
        "created_at": now_iso(),
    })
    return workspace


async def refund_coins(workspace_id: str, cost: int, action: str, actor: str = "system") -> None:
    if cost <= 0:
        return
    await db.workspaces.update_one({"id": workspace_id}, {"$inc": {"coin_balance": cost}})
    await db.coin_ledger.insert_one({
        "id": oid(),
        "workspace_id": workspace_id,
        "direction": "credit",
        "coins": cost,
        "action": f"refund:{action}",
        "actor": actor,
        "created_at": now_iso(),
    })


@router.get("/pricing")
async def pricing():
    return PRICING


@router.get("/wallet")
async def wallet(user: dict = Depends(get_current_user)):
    workspace = await ensure_wallet(user["workspace_id"])
    return {
        "plan": _normalize_plan(workspace.get("plan")),
        "billing_interval": workspace.get("billing_interval"),
        "subscription_status": workspace.get("subscription_status", "free"),
        "coin_balance": workspace.get("coin_balance", 0),
        "coin_period": workspace.get("coin_period", "lifetime"),
        "monthly_refill": PRO_MONTHLY_COINS if workspace.get("plan") == "Pro" else 0,
    }


@router.get("/ledger")
async def ledger(user: dict = Depends(get_current_user)):
    rows = await db.coin_ledger.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(100)
    for row in rows:
        row.pop("_id", None)
    return rows


class UpgradeIntent(BaseModel):
    interval: str


@router.post("/upgrade-intent", status_code=202)
async def upgrade_intent(body: UpgradeIntent, user: dict = Depends(get_current_user)):
    if user.get("role") not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only workspace owners/admins can manage billing")
    if body.interval not in ("month", "year"):
        raise HTTPException(status_code=400, detail="Choose monthly or annual billing")
    request_id = oid()
    await db.billing_intents.insert_one({
        "id": request_id,
        "workspace_id": user["workspace_id"],
        "requested_by": user.get("id"),
        "plan": "Pro",
        "interval": body.interval,
        "status": "checkout_available",
        "created_at": now_iso(),
    })
    return {
        "id": request_id,
        "status": "checkout_available",
        "checkout_ready": True,
        "checkout_endpoint": "/api/billing/cashfree/checkout",
    }


# Mounted last so Cashfree can reuse the billing contract without exposing its
# secret-bearing implementation to frontend code.
from cashfree_billing import router as cashfree_router  # noqa: E402
router.include_router(cashfree_router)

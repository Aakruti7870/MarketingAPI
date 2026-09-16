"""Multi-business Agentic AI platform APIs.

A single GOLD-e workspace can configure an industry-specific agent, its business
context, channels and operating instructions. Paid Pro workspaces can activate
agents; billing remains server-controlled by the existing Cashfree flow.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from core import audit, db, get_current_user, now_iso, oid

router = APIRouter(prefix="/agentic-platform", tags=["agentic-platform"])
INDUSTRY_OPTIONS = [
    {"id": "healthcare", "name": "Healthcare", "agent": "Healthcare Smart Agent"},
    {"id": "infrastructure", "name": "Infrastructure & Real Estate", "agent": "Infrastructure Sales Agent"},
    {"id": "b2b", "name": "B2B / Wholesale / Distribution", "agent": "B2B Sales Agent"},
    {"id": "small-business", "name": "Retail / Kirana / Small Business", "agent": "Small Business Order Agent"},
    {"id": "social-growth", "name": "Digital Marketing / Social Growth", "agent": "Social Growth Agent"},
]
BOT_IDS = {item["id"] for item in INDUSTRY_OPTIONS}
CHANNELS = {"web", "whatsapp"}

class AgentSetupIn(BaseModel):
    business_name: str = Field(min_length=2, max_length=160)
    industry: str = Field(min_length=2, max_length=80)
    bot_id: str = Field(min_length=2, max_length=80)
    channels: list[str] = Field(default_factory=lambda: ["web"])
    instructions: str = Field(default="", max_length=4000)

class AgentStateIn(BaseModel):
    enabled: bool

def _is_billing_owner(user: dict) -> bool:
    return user.get("role") in {"owner", "admin"}

async def _workspace(user: dict) -> dict:
    workspace = await db.workspaces.find_one({"id": user["workspace_id"]})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

def _public_agent(doc: dict) -> dict:
    return {
        "id": doc["id"], "workspace_id": doc["workspace_id"], "business_name": doc["business_name"],
        "industry": doc["industry"], "bot_id": doc["bot_id"], "bot_name": doc["bot_name"],
        "channels": doc.get("channels", []), "instructions": doc.get("instructions", ""),
        "enabled": bool(doc.get("enabled")), "created_at": doc.get("created_at"), "updated_at": doc.get("updated_at"),
    }

@router.get("/catalog")
async def catalog():
    return {"product": "GOLD-e AI Agentic Business Platform", "model": "one_platform_multi_business", "industries": INDUSTRY_OPTIONS, "channels": sorted(CHANNELS), "paid_access": {"required_plan": "Pro", "required_subscription_status": "active", "checkout": "/pricing"}}

@router.get("/workspace")
async def workspace_agent(user: dict = Depends(get_current_user)):
    workspace = await _workspace(user)
    agent = await db.agentic_bots.find_one({"workspace_id": user["workspace_id"]})
    return {"plan": workspace.get("plan", "Free"), "subscription_status": workspace.get("subscription_status", "free"), "agent": _public_agent(agent) if agent else None}

@router.post("/setup")
async def setup_agent(body: AgentSetupIn, user: dict = Depends(get_current_user)):
    if not _is_billing_owner(user):
        raise HTTPException(status_code=403, detail="Only workspace owners/admins can configure an Agentic AI business bot")
    workspace = await _workspace(user)
    if workspace.get("plan") != "Pro" or workspace.get("subscription_status") != "active":
        raise HTTPException(status_code=402, detail={"code": "agentic_plan_required", "message": "Activate a Pro plan before deploying an Agentic AI business bot.", "required_plan": "Pro", "pricing_url": "/pricing"})
    if body.industry not in BOT_IDS or body.bot_id not in BOT_IDS:
        raise HTTPException(status_code=422, detail="Choose a supported business industry and agent")
    if body.industry != body.bot_id:
        raise HTTPException(status_code=422, detail="The selected agent must match the selected business industry")
    channels = [channel.strip().lower() for channel in body.channels if channel.strip()]
    if not channels or any(channel not in CHANNELS for channel in channels):
        raise HTTPException(status_code=422, detail="Supported channels are web and whatsapp")
    bot_name = next(item["agent"] for item in INDUSTRY_OPTIONS if item["id"] == body.bot_id)
    existing = await db.agentic_bots.find_one({"workspace_id": user["workspace_id"]})
    agent_id = existing["id"] if existing else oid()
    created_at = existing.get("created_at", now_iso()) if existing else now_iso()
    doc = {"id": agent_id, "workspace_id": user["workspace_id"], "business_name": body.business_name.strip(), "industry": body.industry, "bot_id": body.bot_id, "bot_name": bot_name, "channels": sorted(set(channels)), "instructions": body.instructions.strip(), "enabled": True, "created_at": created_at, "updated_at": now_iso(), "configured_by": user.get("id")}
    await db.agentic_bots.update_one({"workspace_id": user["workspace_id"]}, {"$set": doc}, upsert=True)
    await audit(user["workspace_id"], user, "agentic_bot.configured", "agentic_bot", {"bot_id": body.bot_id, "channels": sorted(set(channels))})
    return _public_agent(doc)

@router.post("/state")
async def set_agent_state(body: AgentStateIn, user: dict = Depends(get_current_user)):
    if not _is_billing_owner(user):
        raise HTTPException(status_code=403, detail="Only workspace owners/admins can change Agentic AI deployment state")
    agent = await db.agentic_bots.find_one({"workspace_id": user["workspace_id"]})
    if not agent:
        raise HTTPException(status_code=404, detail="Configure an Agentic AI business bot first")
    workspace = await _workspace(user)
    if body.enabled and (workspace.get("plan") != "Pro" or workspace.get("subscription_status") != "active"):
        raise HTTPException(status_code=402, detail={"code": "agentic_plan_required", "message": "An active Pro plan is required to enable the agent.", "pricing_url": "/pricing"})
    await db.agentic_bots.update_one({"workspace_id": user["workspace_id"]}, {"$set": {"enabled": body.enabled, "updated_at": now_iso()}})
    await audit(user["workspace_id"], user, "agentic_bot.state_changed", "agentic_bot", {"enabled": body.enabled})
    agent["enabled"] = body.enabled
    agent["updated_at"] = now_iso()
    return _public_agent(agent)

@router.on_event("startup")
async def ensure_indexes():
    await db.agentic_bots.create_index("workspace_id", unique=True)

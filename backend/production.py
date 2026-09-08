"""Cloud Run production entrypoint for the MarketingAPI backend.

Firebase Hosting serves the React build and rewrites /api/** requests here.
"""
import base64
import hashlib
import os
import re
import secrets as pysecrets

from fastapi import Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

os.environ.setdefault("DB_NAME", "marketingapi")

jwt_secret = os.environ.get("JWT_SECRET", "").strip()
if not jwt_secret:
    raise RuntimeError("JWT_SECRET is required")

if not os.environ.get("VAULT_KEY"):
    digest = hashlib.sha256(("marketingapi-vault:" + jwt_secret).encode()).digest()
    os.environ["VAULT_KEY"] = base64.urlsafe_b64encode(digest).decode()

import billing
import core
import privacy
import saas
import secure_team
import secure_vault
import server
import studio

app = server.app


def _remove_route(path: str, methods: set[str]):
    """Remove an explicitly superseded legacy route before adding its safe replacement."""
    app.router.routes = [
        route for route in app.router.routes
        if not (
            getattr(route, "path", None) == path
            and bool(set(getattr(route, "methods", set()) or set()) & methods)
        )
    ]


# Replace routes that had prototype-only or unsafe production semantics.
_remove_route("/api/auth/register", {"POST"})
_remove_route("/api/vault", {"GET", "POST"})
_remove_route("/api/vault/{cid}", {"DELETE"})
_remove_route("/api/team", {"GET", "POST"})
_remove_route("/api/team/{uid}", {"DELETE"})
_remove_route("/api/dashboard", {"GET"})
_remove_route("/api/audit", {"GET"})
_remove_route("/api/campaigns", {"POST"})
_remove_route("/api/consent/opt-outs", {"GET"})

app.include_router(secure_vault.router)
app.include_router(secure_team.router)
app.include_router(billing.router)
app.include_router(saas.router)
app.include_router(privacy.router)


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


server.llm_text = core.llm_text

if not _env_bool("SEED_DEMO_DATA", False):
    async def _skip_demo_seed():
        return None

    server.seed = _skip_demo_seed

allowed_origins = [
    origin.strip().rstrip("/")
    for origin in os.environ.get("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
for middleware in app.user_middleware:
    if middleware.cls is CORSMiddleware:
        middleware.kwargs["allow_origins"] = allowed_origins
        middleware.kwargs["allow_credentials"] = False
app.middleware_stack = None


@app.post("/api/auth/register")
async def production_register(body: server.RegisterIn):
    """Every new workspace starts Free with a single non-renewing 100-coin grant."""
    email = body.email.lower()
    if await server.db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    ws_id = server.oid()
    await server.db.workspaces.insert_one({
        "id": ws_id,
        "name": body.workspace_name,
        "plan": "Free",
        "billing_interval": None,
        "subscription_status": "free",
        "coin_balance": billing.FREE_COINS,
        "coin_period": "lifetime",
        "coin_lifetime_granted": billing.FREE_COINS,
        "platform_api_key": "golde_" + pysecrets.token_urlsafe(24),
        "created_at": server.now_iso(),
    })
    uid = server.oid()
    await server.db.users.insert_one({
        "id": uid,
        "workspace_id": ws_id,
        "email": email,
        "password_hash": server.hash_password(body.password),
        "name": body.name,
        "role": "owner",
        "avatar": "",
        "created_at": server.now_iso(),
    })
    await server.audit(
        ws_id,
        {"id": uid, "name": body.name},
        "workspace.created",
        "workspace",
        {"name": body.workspace_name, "plan": "Free", "free_coins": billing.FREE_COINS},
    )
    token = server.create_token(uid, ws_id, "owner")
    return {
        "token": token,
        "user": {
            "id": uid,
            "email": email,
            "name": body.name,
            "role": "owner",
            "workspace_id": ws_id,
            "workspace_name": body.workspace_name,
            "plan": "Free",
            "coin_balance": billing.FREE_COINS,
        },
    }


COIN_RULES = [
    (re.compile(r"^/api/leads/[^/]+/rescore$"), billing.COIN_COSTS["lead_rescore"], "lead_rescore"),
    (re.compile(r"^/api/conversations/[^/]+/(suggest|summarize)$"), billing.COIN_COSTS["conversation_ai"], "conversation_ai"),
    (re.compile(r"^/api/quotations/ai-draft$"), billing.COIN_COSTS["quotation_ai"], "quotation_ai"),
    (re.compile(r"^/api/ai/generate$"), billing.COIN_COSTS["ai_text"], "ai_text"),
    (re.compile(r"^/api/ai/marketing$"), billing.COIN_COSTS["ai_marketing"], "ai_marketing"),
    (re.compile(r"^/api/ai/command$"), billing.COIN_COSTS["ai_command"], "ai_command"),
    (re.compile(r"^/api/ai/poster$"), billing.COIN_COSTS["ai_poster"], "ai_poster"),
]


def _coin_rule(path: str):
    for pattern, cost, action in COIN_RULES:
        if pattern.match(path):
            return cost, action
    return None


@app.middleware("http")
async def coin_meter(request: Request, call_next):
    """Debit premium AI actions atomically and refund automatically on failed requests."""
    if request.method != "POST":
        return await call_next(request)
    rule = _coin_rule(request.url.path)
    if not rule or not request.headers.get("Authorization", "").startswith("Bearer "):
        return await call_next(request)

    try:
        user = await server.get_current_user(request)
    except HTTPException:
        return await call_next(request)

    cost, action = rule
    try:
        await billing.debit_coins(user["workspace_id"], cost, action, actor=user.get("id", "user"))
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    try:
        response = await call_next(request)
    except Exception:
        await billing.refund_coins(user["workspace_id"], cost, action, actor=user.get("id", "user"))
        raise

    if response.status_code >= 400:
        await billing.refund_coins(user["workspace_id"], cost, action, actor=user.get("id", "user"))
    return response


@app.get("/api/dashboard")
async def production_dashboard(user: dict = Depends(server.get_current_user)):
    payload = await server.dashboard(user)
    payload = dict(payload)
    kpis = dict(payload.get("kpis") or {})
    kpis.pop("ai_cost", None)
    kpis.pop("ai_budget", None)
    kpis.pop("avg_response", None)
    payload["kpis"] = kpis
    return payload


@app.get("/api/audit")
async def production_audit(user: dict = Depends(server.require_role("owner", "admin"))):
    return await server.audit_list(user)


@app.post("/api/campaigns")
async def production_campaign_create(
    body: server.CampaignIn,
    user: dict = Depends(server.get_current_user),
):
    studio_body = studio.CampaignIn(
        name=body.name,
        channel=body.channel,
        segment=body.segment,
        template_id=body.template_id,
        message=body.message or "",
        schedule_at=body.scheduled_at,
    )
    return await studio.create(studio_body, user)


@app.get("/api/consent/opt-outs")
async def production_opt_outs(user: dict = Depends(server.get_current_user)):
    ws = user["workspace_id"]
    rows = await server.db.opt_out_registry.find({"workspace_id": ws}).sort("created_at", -1).to_list(500)
    output = []
    for row in rows:
        lead = await server.db.leads.find_one({"id": row.get("lead_id"), "workspace_id": ws})
        output.append({
            "id": row.get("id") or str(row.get("lead_id")),
            "lead_id": row.get("lead_id"),
            "lead_name": lead.get("name", "Unknown") if lead else "Unknown",
            "channel": row.get("channel"),
            "reason": row.get("reason"),
            "created_at": row.get("created_at"),
        })
    return output


@app.on_event("startup")
async def production_indexes():
    """Indexes and one-way safety migration needed by the production service."""
    try:
        await secure_vault.migrate_legacy_plaintext_metadata()
        # Pre-launch pricing migration: legacy prototype plan names become Free unless billing later activates Pro.
        await core.db.workspaces.update_many(
            {"plan": {"$in": ["Starter", "Growth", "Scale", "Enterprise"]}, "subscription_status": {"$ne": "active"}},
            {"$set": {"plan": "Free"}},
        )
        await core.db.whatsapp_connections.create_index("phone_number_id", unique=True, sparse=True)
        await core.db.followups.create_index(
            [("workspace_id", 1), ("followup_key", 1)], unique=True, sparse=True
        )
        await core.db.followups.create_index([("status", 1), ("due_at", 1)])
        await core.db.campaigns.create_index([("status", 1), ("schedule_at", 1)])
        await core.db.api_rate_limits.create_index("expires_at", expireAfterSeconds=0)
        await core.db.api_usage.create_index([("workspace_id", 1), ("at", -1)])
        await core.db.webhook_events.create_index([("workspace_id", 1), ("created_at", -1)])
        await core.db.coin_ledger.create_index([("workspace_id", 1), ("created_at", -1)])
        await core.db.billing_intents.create_index([("workspace_id", 1), ("created_at", -1)])
        await core.db.deletion_requests.create_index([("workspace_id", 1), ("user_id", 1), ("requested_at", -1)])
        await core.db.deletion_requests.create_index([("status", 1), ("requested_at", 1)])
    except Exception as exc:
        print(f"production startup hardening error: {type(exc).__name__}")


@app.get("/api/health", include_in_schema=False)
async def health():
    try:
        await server.db.command("ping")
        return {
            "status": "ok",
            "service": os.environ.get("K_SERVICE", "marketingapi"),
            "revision": os.environ.get("K_REVISION", "local"),
            "database": "ok",
        }
    except Exception:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "service": os.environ.get("K_SERVICE", "marketingapi"),
                "database": "unavailable",
            },
        )


@app.get("/api/version", include_in_schema=False)
async def version():
    return {
        "service": os.environ.get("K_SERVICE", "marketingapi"),
        "revision": os.environ.get("K_REVISION", "local"),
        "environment": os.environ.get("APP_ENV", "production"),
    }

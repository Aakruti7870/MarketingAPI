"""Cloud Run production entrypoint for the MarketingAPI backend.

Firebase Hosting serves the React build and rewrites /api/** requests here.
"""
import base64
import hashlib
import os

from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

os.environ.setdefault("DB_NAME", "marketingapi")

jwt_secret = os.environ.get("JWT_SECRET", "").strip()
if not jwt_secret:
    raise RuntimeError("JWT_SECRET is required")

if not os.environ.get("VAULT_KEY"):
    digest = hashlib.sha256(("marketingapi-vault:" + jwt_secret).encode()).digest()
    os.environ["VAULT_KEY"] = base64.urlsafe_b64encode(digest).decode()

import core
import saas
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
_remove_route("/api/vault", {"GET", "POST"})
_remove_route("/api/vault/{cid}", {"DELETE"})
_remove_route("/api/dashboard", {"GET"})
_remove_route("/api/campaigns", {"POST"})

app.include_router(secure_vault.router)
app.include_router(saas.router)


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


# Route legacy AI endpoints through the production provider.
server.llm_text = core.llm_text

if not _env_bool("SEED_DEMO_DATA", False):
    async def _skip_demo_seed():
        return None

    server.seed = _skip_demo_seed

# Firebase Hosting makes browser API calls same-origin. CORS is disabled unless
# explicitly needed by a trusted external web client.
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


@app.get("/api/dashboard")
async def production_dashboard(user: dict = Depends(server.get_current_user)):
    """Use the established dashboard calculations but remove fabricated AI/latency values."""
    payload = await server.dashboard(user)
    payload = dict(payload)
    kpis = dict(payload.get("kpis") or {})
    kpis.pop("ai_cost", None)
    kpis.pop("ai_budget", None)
    kpis.pop("avg_response", None)
    payload["kpis"] = kpis
    return payload


@app.post("/api/campaigns")
async def production_campaign_create(
    body: server.CampaignIn,
    user: dict = Depends(server.get_current_user),
):
    """Keep the legacy create URL, but create a draft instead of fake-sending it."""
    studio_body = studio.CampaignIn(
        name=body.name,
        channel=body.channel,
        segment=body.segment,
        template_id=body.template_id,
        message=body.message or "",
        schedule_at=body.scheduled_at,
    )
    return await studio.create(studio_body, user)


@app.on_event("startup")
async def production_indexes():
    """Indexes and one-way safety migration needed by the production service."""
    try:
        await secure_vault.migrate_legacy_plaintext_metadata()
        await core.db.whatsapp_connections.create_index("phone_number_id", unique=True, sparse=True)
        await core.db.followups.create_index(
            [("workspace_id", 1), ("followup_key", 1)], unique=True, sparse=True
        )
        await core.db.followups.create_index([("status", 1), ("due_at", 1)])
        await core.db.campaigns.create_index([("status", 1), ("schedule_at", 1)])
        await core.db.api_rate_limits.create_index("expires_at", expireAfterSeconds=0)
        await core.db.api_usage.create_index([("workspace_id", 1), ("at", -1)])
        await core.db.webhook_events.create_index([("workspace_id", 1), ("created_at", -1)])
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

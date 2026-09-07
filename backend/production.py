"""Cloud Run production entrypoint for the MarketingAPI backend.

Firebase Hosting serves the React build and rewrites /api/** requests here.
"""
import base64
import hashlib
import os

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
import server

app = server.app
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


@app.on_event("startup")
async def production_indexes():
    """Indexes needed for tenant isolation, idempotency and multi-instance limits."""
    try:
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
        print(f"production index error: {type(exc).__name__}")


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

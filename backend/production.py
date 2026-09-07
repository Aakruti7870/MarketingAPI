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

# server.py and core.py read VAULT_KEY at import time. Keep this deterministic
# unless a dedicated Fernet key is explicitly configured.
if not os.environ.get("VAULT_KEY"):
    digest = hashlib.sha256(("marketingapi-vault:" + jwt_secret).encode()).digest()
    os.environ["VAULT_KEY"] = base64.urlsafe_b64encode(digest).decode()

import core
import server

app = server.app


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


# Replace the legacy server-local AI function with the production provider.
# This keeps old endpoint code functional while removing the runtime dependency
# on the original prototyping environment.
server.llm_text = core.llm_text

# Never create demo users/data in production unless explicitly enabled for a
# disposable test environment.
if not _env_bool("SEED_DEMO_DATA", False):
    async def _skip_demo_seed():
        return None

    server.seed = _skip_demo_seed

# Firebase Hosting makes browser API calls same-origin. CORS is therefore
# disabled by default. Optional explicit origins can be supplied for trusted
# external web clients.
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


@app.get("/api/health", include_in_schema=False)
async def health():
    """Cloud Run/Firebase readiness endpoint with a real database ping."""
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

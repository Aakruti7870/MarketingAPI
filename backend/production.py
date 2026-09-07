import base64
import hashlib
import os
from pathlib import Path

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Production defaults must exist before importing server.py because it reads
# required environment variables at import time.
os.environ.setdefault("DB_NAME", "marketingapi")

jwt_secret = os.environ.get("JWT_SECRET", "").strip()
if not jwt_secret:
    raise RuntimeError("JWT_SECRET is required")

# server.py expects a Fernet-formatted key. If a dedicated VAULT_KEY is not
# supplied, derive a deterministic key from JWT_SECRET so deployments do not
# need a second special-format secret. Keep JWT_SECRET stable across deploys.
if not os.environ.get("VAULT_KEY"):
    digest = hashlib.sha256(("marketingapi-vault:" + jwt_secret).encode()).digest()
    os.environ["VAULT_KEY"] = base64.urlsafe_b64encode(digest).decode()

import server

app = server.app


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


# Production must not silently create demo users/data.
if not _env_bool("SEED_DEMO_DATA", False):
    async def _skip_demo_seed():
        return None

    server.seed = _skip_demo_seed


# Restrict CORS when explicit production origins are supplied.
allowed_origins = [
    origin.strip().rstrip("/")
    for origin in os.environ.get("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
if allowed_origins:
    for middleware in app.user_middleware:
        if middleware.cls is CORSMiddleware:
            middleware.kwargs["allow_origins"] = allowed_origins
            middleware.kwargs["allow_credentials"] = False
    app.middleware_stack = None


@app.get("/api/health", include_in_schema=False)
async def health():
    try:
        await server.db.command("ping")
        return {"status": "ok", "service": "MarketingAPI", "database": "ok"}
    except Exception:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "service": "MarketingAPI", "database": "unavailable"},
        )


# React production build is copied here by the root Dockerfile.
project_root = Path(__file__).resolve().parent.parent
frontend_build = project_root / "frontend" / "build"
static_dir = frontend_build / "static"

if static_dir.is_dir():
    app.mount("/static", StaticFiles(directory=static_dir), name="frontend-static")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    # API misses should remain API 404s instead of returning index.html.
    if full_path == "api" or full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    if frontend_build.is_dir():
        build_root = frontend_build.resolve()
        candidate = (frontend_build / full_path).resolve()
        try:
            candidate.relative_to(build_root)
        except ValueError:
            return JSONResponse(status_code=404, content={"detail": "Not Found"})

        if full_path and candidate.is_file():
            return FileResponse(candidate)

        index_file = frontend_build / "index.html"
        if index_file.is_file():
            return FileResponse(index_file)

    return JSONResponse(
        status_code=503,
        content={"detail": "Frontend production build is not available"},
    )

"""Cloud Run production entrypoint for the MarketingAPI backend and frontend."""
import base64
import hashlib
import os
import re
import secrets as pysecrets
from pathlib import Path

from fastapi import Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

os.environ.setdefault("DB_NAME", "marketingapi")

jwt_secret = os.environ.get("JWT_SECRET", "").strip()
if not jwt_secret:
    raise RuntimeError("JWT_SECRET is required")

if not os.environ.get("VAULT_KEY"):
    digest = hashlib.sha256(("marketingapi-vault:" + jwt_secret).encode()).digest()
    os.environ["VAULT_KEY"] = base64.urlsafe_b64encode(digest).decode()

import billing
import channels
import contacts
import core
import flows
import privacy
import secure_vault
import server
import studio
import multichannel

app = server.app

# Cloud Run serves the complete GOLD-e AI application. The React build is
# copied into /app/frontend/build by the production Docker image.
FRONTEND_DIR = Path("/app/frontend/build")
if FRONTEND_DIR.exists():
    static_dir = FRONTEND_DIR / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=static_dir), name="frontend-static")

# Keep all API routes above this point. This final route provides SPA fallback
# for client-side routes such as /login, /app and /pricing.
@app.get("/{path:path}", include_in_schema=False)
async def serve_frontend(path: str):
    if path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    if not FRONTEND_DIR.exists():
        raise HTTPException(status_code=404, detail="Frontend not built")
    requested = FRONTEND_DIR / path
    if path and requested.is_file():
        return FileResponse(requested)
    index = FRONTEND_DIR / "index.html"
    if not index.is_file():
        raise HTTPException(status_code=404, detail="Frontend index not found")
    return FileResponse(index)


# Production CORS and all existing production routes/middleware follow the
# application setup already maintained in this module.

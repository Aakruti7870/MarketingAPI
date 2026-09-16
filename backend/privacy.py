"""Privacy and data-deletion request endpoints.

Deletion is intentionally request-based rather than an unauthenticated destructive action.
Requests are idempotent per user while pending/reviewing and are auditable.
"""
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from core import audit, clean, db, get_current_user, now_iso, oid

router = APIRouter(prefix="/api/privacy", tags=["privacy"])

ACTIVE_STATUSES = ["pending", "reviewing"]


class DeletionRequestIn(BaseModel):
    reason: Optional[str] = Field(default="", max_length=1000)


def _public_request(doc: dict | None) -> dict:
    if not doc:
        return {"requested": False, "status": None}
    row = clean(doc)
    return {
        "requested": True,
        "id": row.get("id"),
        "status": row.get("status", "pending"),
        "scope": row.get("scope"),
        "requested_at": row.get("requested_at"),
        "updated_at": row.get("updated_at"),
    }


@router.get("/deletion-request")
async def deletion_request_status(user: dict = Depends(get_current_user)):
    doc = await db.deletion_requests.find_one(
        {
            "workspace_id": user["workspace_id"],
            "user_id": user["id"],
        },
        sort=[("requested_at", -1)],
    )
    return _public_request(doc)


@router.post("/deletion-request", status_code=202)
async def request_deletion(
    body: DeletionRequestIn,
    user: dict = Depends(get_current_user),
):
    workspace_id = user["workspace_id"]
    user_id = user["id"]

    existing = await db.deletion_requests.find_one(
        {
            "workspace_id": workspace_id,
            "user_id": user_id,
            "status": {"$in": ACTIVE_STATUSES},
        }
    )
    if existing:
        return _public_request(existing)

    # Workspace owners control the tenant, so their request includes the workspace.
    # Other roles request removal of their own account/profile only.
    scope = "workspace_and_account" if user.get("role") == "owner" else "account"
    now = now_iso()
    doc = {
        "id": oid(),
        "workspace_id": workspace_id,
        "user_id": user_id,
        "requester_email": user.get("email", ""),
        "requester_role": user.get("role", ""),
        "scope": scope,
        "reason": (body.reason or "").strip(),
        "status": "pending",
        "requested_at": now,
        "updated_at": now,
    }
    await db.deletion_requests.insert_one(doc)
    await audit(
        workspace_id,
        user.get("name") or user.get("email") or user_id,
        "privacy.deletion_requested",
        "deletion_request",
        {"request_id": doc["id"], "scope": scope},
    )
    return _public_request(doc)

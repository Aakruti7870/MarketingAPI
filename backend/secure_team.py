"""Workspace team administration with explicit privilege boundaries."""
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from core import audit, db, get_current_user, now_iso, oid, require_role

router = APIRouter(prefix="/api/team")


class TeamInviteIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=10, max_length=72)
    role: str = "agent"


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


@router.get("")
async def list_team(user: dict = Depends(get_current_user)):
    rows = await db.users.find({"workspace_id": user["workspace_id"]}).sort("created_at", 1).to_list(200)
    return [
        {
            "id": row["id"],
            "name": row.get("name", ""),
            "email": row.get("email", ""),
            "role": row.get("role", "agent"),
            "created_at": row.get("created_at"),
        }
        for row in rows
    ]


@router.post("")
async def invite_member(body: TeamInviteIn, user: dict = Depends(require_role("owner", "admin"))):
    requested_role = body.role.strip().lower()
    if requested_role == "owner":
        raise HTTPException(status_code=403, detail="Owner role cannot be granted through team invites")
    if user.get("role") == "admin" and requested_role != "agent":
        raise HTTPException(status_code=403, detail="Admins can invite agents only")
    if requested_role not in {"admin", "agent"}:
        raise HTTPException(status_code=400, detail="Role must be admin or agent")

    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    user_id = oid()
    await db.users.insert_one({
        "id": user_id,
        "workspace_id": user["workspace_id"],
        "email": email,
        "password_hash": _hash_password(body.password),
        "name": body.name.strip(),
        "role": requested_role,
        "created_at": now_iso(),
    })
    await audit(
        user["workspace_id"],
        user["name"],
        "team.invited",
        "user",
        {"email": email, "role": requested_role},
    )
    return {"id": user_id, "name": body.name.strip(), "email": email, "role": requested_role}


@router.delete("/{member_id}")
async def remove_member(member_id: str, user: dict = Depends(require_role("owner", "admin"))):
    if member_id == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    target = await db.users.find_one({"id": member_id, "workspace_id": user["workspace_id"]})
    if not target:
        raise HTTPException(status_code=404, detail="Team member not found")
    if target.get("role") == "owner":
        raise HTTPException(status_code=403, detail="Workspace owner cannot be removed")
    if user.get("role") == "admin" and target.get("role") != "agent":
        raise HTTPException(status_code=403, detail="Admins can remove agents only")

    await db.users.delete_one({"id": member_id, "workspace_id": user["workspace_id"]})
    await audit(
        user["workspace_id"],
        user["name"],
        "team.removed",
        "user",
        {"id": member_id, "role": target.get("role")},
    )
    return {"ok": True}

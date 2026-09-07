"""Encrypted-only per-workspace credential vault.

No credential value is stored in plaintext metadata. Values can only be returned
as masked representations and are never decrypted into API responses.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core import audit, db, decrypt_str, encrypt_str, get_current_user, now_iso, oid, require_role

router = APIRouter(prefix="/api/vault")


class CredentialIn(BaseModel):
    provider: str = Field(min_length=2, max_length=100)
    label: str = Field(min_length=1, max_length=120)
    fields: dict[str, str]


def _mask(value: str) -> str:
    value = value or ""
    if not value:
        return "••••••••"
    tail = value[-4:] if len(value) > 4 else ""
    return "••••••••" + tail


@router.get("")
async def list_credentials(user: dict = Depends(get_current_user)):
    rows = await db.credentials.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(100)
    output = []
    for row in rows:
        masked = {}
        for key, encrypted in (row.get("fields_enc") or {}).items():
            masked[key] = _mask(decrypt_str(encrypted))
        output.append({
            "id": row["id"],
            "provider": row.get("provider", "Unknown"),
            "label": row.get("label", "Credential"),
            "status": row.get("status", "Active"),
            "fields": masked,
            "created_at": row.get("created_at"),
        })
    return output


@router.post("")
async def add_credential(body: CredentialIn, user: dict = Depends(require_role("owner", "admin"))):
    cleaned = {str(key).strip(): str(value).strip() for key, value in body.fields.items() if str(key).strip() and str(value).strip()}
    if not cleaned:
        raise HTTPException(status_code=400, detail="At least one credential field is required")
    credential_id = oid()
    await db.credentials.insert_one({
        "id": credential_id,
        "workspace_id": user["workspace_id"],
        "provider": body.provider.strip(),
        "label": body.label.strip(),
        "fields_enc": {key: encrypt_str(value) for key, value in cleaned.items()},
        "status": "Active",
        "created_at": now_iso(),
    })
    await audit(
        user["workspace_id"],
        user["name"],
        "vault.added",
        "credential",
        {"provider": body.provider, "field_names": list(cleaned.keys())},
    )
    return {"id": credential_id, "provider": body.provider, "label": body.label, "status": "Active"}


@router.delete("/{credential_id}")
async def remove_credential(credential_id: str, user: dict = Depends(require_role("owner", "admin"))):
    result = await db.credentials.delete_one({"id": credential_id, "workspace_id": user["workspace_id"]})
    if result.deleted_count != 1:
        raise HTTPException(status_code=404, detail="Credential not found")
    await audit(user["workspace_id"], user["name"], "vault.removed", "credential", {"id": credential_id})
    return {"ok": True}


async def migrate_legacy_plaintext_metadata():
    """Encrypt old fields_meta values, then remove plaintext metadata permanently."""
    cursor = db.credentials.find({"fields_meta": {"$exists": True}})
    async for row in cursor:
        encrypted = dict(row.get("fields_enc") or {})
        for key, value in (row.get("fields_meta") or {}).items():
            if key not in encrypted and value not in (None, ""):
                encrypted[key] = encrypt_str(str(value))
        await db.credentials.update_one(
            {"_id": row["_id"]},
            {"$set": {"fields_enc": encrypted}, "$unset": {"fields_meta": ""}},
        )

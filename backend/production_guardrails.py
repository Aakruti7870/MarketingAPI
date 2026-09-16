"""Production guardrails for consent approval and contact-import commits.

The import compatibility routes live in contacts.py. This module installs a
hardened commit implementation at startup so every production import path uses
an atomic, recoverable claim without duplicating the public route surface.
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from pymongo import ReturnDocument

import consent
import contacts
from core import audit, db, get_current_user, now, now_iso, oid

router = APIRouter(prefix="/api", tags=["production-guardrails"])

IMPORT_CLAIM_TIMEOUT_MINUTES = 10


def _can_approve_consent(user: dict) -> bool:
    return user.get("role") in {"owner", "admin"}


@router.post("/consent/leads/{lead_id}")
async def set_consent_production(
    lead_id: str,
    body: consent.ConsentIn,
    user: dict = Depends(get_current_user),
):
    """Allow agents to honor opt-outs, but reserve opt-in approval to owner/admin."""
    if body.status not in {"opted_in", "opted_out", "pending"}:
        raise HTTPException(status_code=400, detail="Consent status must be opted_in, opted_out or pending")
    if body.status == "opted_in" and not _can_approve_consent(user):
        raise HTTPException(status_code=403, detail="Owner or admin approval is required to mark a contact opted in")

    lead = await db.leads.find_one({"id": lead_id, "workspace_id": user["workspace_id"]})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update = {
        "consent_status": body.status,
        "consent_source": body.source,
        "consent_date": now_iso(),
        "consent_channels": body.channels,
    }
    if body.status == "opted_in":
        update["opted_out"] = False
    elif body.status == "opted_out":
        update["opted_out"] = True

    await db.leads.update_one(
        {"id": lead_id, "workspace_id": user["workspace_id"]},
        {"$set": update},
    )

    if body.status == "opted_in":
        # Explicit re-consent can clear prior suppression for this lead, but only
        # after owner/admin approval above.
        await db.opt_out_registry.delete_many({"workspace_id": user["workspace_id"], "lead_id": lead_id})
        await db.suppression_list.delete_many({"workspace_id": user["workspace_id"], "lead_id": lead_id})

    await audit(
        user["workspace_id"],
        user.get("name", "user"),
        "consent.recorded",
        "lead",
        {
            "lead_id": lead_id,
            "status": body.status,
            "source": body.source,
            "approved_by_role": user.get("role"),
        },
    )
    return {"ok": True, **update}


async def _atomic_commit_preview(doc: dict, body: contacts.ImportCommitIn, user: dict) -> dict:
    """Commit one preview exactly once, with a recoverable database claim."""
    if body.consent_status not in {"pending", "opted_in"}:
        raise HTTPException(status_code=400, detail="Imported contacts can start as pending or opted_in only")
    if body.consent_status == "opted_in":
        if not _can_approve_consent(user):
            raise HTTPException(status_code=403, detail="Owner or admin approval is required for opted-in imports")
        if not body.confirm_opt_in:
            raise HTTPException(
                status_code=400,
                detail="Confirm that these contacts explicitly opted in to receive messages before marking them opted_in",
            )
        if not body.consent_source.strip():
            raise HTTPException(status_code=400, detail="A documented consent source is required for opted-in imports")

    ws = user["workspace_id"]
    claim_id = oid()
    stale_before = (now() - timedelta(minutes=IMPORT_CLAIM_TIMEOUT_MINUTES)).isoformat()
    claimed = await db.contact_imports.find_one_and_update(
        {
            "id": doc.get("id"),
            "workspace_id": ws,
            "$or": [
                {"status": "preview"},
                {"status": "committing", "commit_started_at": {"$lt": stale_before}},
            ],
        },
        {"$set": {
            "status": "committing",
            "commit_claim_id": claim_id,
            "commit_started_at": now_iso(),
            "commit_started_by": user.get("id"),
        }},
        return_document=ReturnDocument.AFTER,
    )
    if not claimed:
        raise HTTPException(status_code=409, detail="This import is already committing or has been committed")

    imported_ids: list[str] = []
    skipped_existing = 0
    try:
        for row in claimed.get("rows") or []:
            exists = await db.leads.find_one(
                {"workspace_id": ws, "phone_hash": row["phone_hash"]},
                {"id": 1},
            )
            if exists:
                skipped_existing += 1
                continue

            score, temperature = contacts._heuristic_score(row)
            lead_id = oid()
            lead = {
                "id": lead_id,
                "workspace_id": ws,
                "name": row.get("name") or "Imported Contact",
                "company": row.get("company", ""),
                "email": row.get("email", ""),
                "phone_enc": row.get("phone_enc", ""),
                "phone_hash": row["phone_hash"],
                "phone_masked": row.get("phone_masked", ""),
                "channel": row.get("channel") or "WhatsApp",
                "source": row.get("source") or "CSV / Excel",
                "budget": row.get("budget", ""),
                "notes": row.get("notes", ""),
                "tags": row.get("tags", []),
                "district": row.get("district", ""),
                "taluka": row.get("taluka", ""),
                "state": row.get("state", ""),
                "owner": user.get("name", ""),
                "score": score,
                "temperature": temperature,
                "score_reason": "Imported contact scored from profile completeness.",
                "stage": "NEW",
                "value": 0,
                "consent": body.consent_status == "opted_in",
                "consent_status": body.consent_status,
                "consent_source": body.consent_source.strip() or "bulk_import",
                "consent_date": now_iso() if body.consent_status == "opted_in" else None,
                "opted_out": False,
                "import_id": claimed["id"],
                "last_activity": now_iso(),
                "created_at": now_iso(),
            }
            await db.leads.insert_one(lead)
            imported_ids.append(lead_id)

        audience = None
        if body.audience_name and imported_ids:
            audience = await contacts._create_static_audience(
                ws,
                body.audience_name.strip(),
                imported_ids,
                user.get("name", "user"),
                description=f"Created from import {claimed.get('filename', '')}",
            )

        result = await db.contact_imports.update_one(
            {
                "id": claimed["id"],
                "workspace_id": ws,
                "status": "committing",
                "commit_claim_id": claim_id,
            },
            {
                "$set": {
                    "status": "committed",
                    "committed_at": now_iso(),
                    "committed_by": user.get("id"),
                    "imported": len(imported_ids),
                    "skipped_existing_at_commit": skipped_existing,
                    "consent_status": body.consent_status,
                    "audience_id": audience.get("id") if audience else None,
                },
                "$unset": {
                    "rows": "",
                    "commit_claim_id": "",
                    "commit_started_at": "",
                    "commit_started_by": "",
                },
            },
        )
        if result.modified_count != 1:
            raise HTTPException(status_code=409, detail="Import claim changed before commit completed")

        await audit(
            ws,
            user.get("name", "user"),
            "contacts.import_committed",
            "contact_import",
            {
                "preview_id": claimed["id"],
                "imported": len(imported_ids),
                "skipped": skipped_existing,
                "consent_status": body.consent_status,
                "audience_id": audience.get("id") if audience else None,
            },
        )
        return {
            "ok": True,
            "import_id": claimed["id"],
            "imported": len(imported_ids),
            "skipped": skipped_existing,
            "consent_status": body.consent_status,
            "audience": contacts._audience_public(audience) if audience else None,
        }
    except Exception:
        # Immediate failures release only this worker's claim. A process crash is
        # recoverable after IMPORT_CLAIM_TIMEOUT_MINUTES via the stale-claim rule.
        await db.contact_imports.update_one(
            {
                "id": claimed["id"],
                "workspace_id": ws,
                "status": "committing",
                "commit_claim_id": claim_id,
            },
            {
                "$set": {"status": "preview"},
                "$unset": {
                    "commit_claim_id": "",
                    "commit_started_at": "",
                    "commit_started_by": "",
                },
            },
        )
        raise


def install() -> None:
    """Route both contact import endpoints through the hardened commit path."""
    contacts._commit_preview = _atomic_commit_preview

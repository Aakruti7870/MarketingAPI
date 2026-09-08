"""Smart contact imports and privacy-preserving Broadcast audiences.

Bulk imports never imply WhatsApp consent. Contacts default to `pending` unless an
owner/admin explicitly confirms a documented opt-in source during commit.
"""
import csv
import io
import re
from datetime import timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from openpyxl import load_workbook
from pydantic import BaseModel, Field

from core import (
    audit, clean, db, encrypt_str, get_current_user, mask_phone, now, now_iso,
    oid, phone_hash, require_role,
)

router = APIRouter(prefix="/api", tags=["contacts"])

MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_IMPORT_ROWS = 20000
IMPORT_TTL_HOURS = 24


class ImportCommitIn(BaseModel):
    consent_status: str = "pending"
    consent_source: str = "bulk_import"
    confirm_opt_in: bool = False
    audience_name: Optional[str] = Field(default=None, max_length=100)


class AudienceIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=500)
    kind: str = "static"  # static | dynamic
    lead_ids: list[str] = Field(default_factory=list)
    rules: dict[str, Any] = Field(default_factory=dict)


class AudienceUpdateIn(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    lead_ids: Optional[list[str]] = None
    rules: Optional[dict[str, Any]] = None


def _header_key(value: Any) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _canonical_field(header: Any) -> Optional[str]:
    key = _header_key(header)
    if not key:
        return None
    exact = {
        "name": "name", "full name": "name", "contact name": "name", "person name": "name",
        "plant name": "name", "customer name": "name", "lead name": "name",
        "company": "company", "company name": "company", "business": "company", "business name": "company",
        "email": "email", "email address": "email", "mail": "email",
        "district": "district", "dist": "district",
        "taluka": "taluka", "taluk": "taluka", "tehsil": "taluka",
        "state": "state", "province": "state",
        "source": "source", "channel": "channel", "notes": "notes", "note": "notes",
        "budget": "budget", "tags": "tags", "tag": "tags",
        "consent": "consent", "opt in": "consent", "whatsapp consent": "consent",
    }
    if key in exact:
        return exact[key]
    phone_terms = ("phone", "mobile", "whatsapp", "contact number", "contact no", "telephone")
    if any(term in key for term in phone_terms):
        return "phone"
    if key == "number" or key.endswith(" number"):
        return "phone"
    if "plant" in key and "name" in key:
        return "name"
    return None


def _cell_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def _normalize_phone(value: Any, default_country_code: str) -> Optional[str]:
    raw = _cell_text(value)
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("00"):
        digits = digits[2:]
    country = re.sub(r"\D", "", default_country_code or "")

    # India-friendly defaults while still supporting already-complete E.164 values.
    if country == "91":
        if len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        if len(digits) == 10:
            digits = "91" + digits
    elif country and len(digits) <= 10 and not digits.startswith(country):
        digits = country + digits

    if len(digits) < 7 or len(digits) > 15:
        return None
    return "+" + digits


def _parse_csv(content: bytes) -> tuple[list[str], list[list[Any]]]:
    text = content.decode("utf-8-sig", errors="replace")
    sample = text[:8192]
    delimiter = ","
    try:
        delimiter = csv.Sniffer().sniff(sample, delimiters=",;\t|").delimiter
    except csv.Error:
        pass
    rows = list(csv.reader(io.StringIO(text), delimiter=delimiter))
    if not rows:
        raise HTTPException(422, detail="The CSV file is empty")
    return [_cell_text(v) for v in rows[0]], rows[1:]


def _parse_xlsx(content: bytes) -> tuple[list[str], list[list[Any]]]:
    try:
        book = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    except Exception as exc:
        raise HTTPException(422, detail="The XLSX file could not be read") from exc
    sheet = book.active
    iterator = sheet.iter_rows(values_only=True)
    try:
        headers = [_cell_text(v) for v in next(iterator)]
    except StopIteration as exc:
        raise HTTPException(422, detail="The XLSX file is empty") from exc
    rows = [list(row) for row in iterator]
    book.close()
    return headers, rows


def _parse_upload(filename: str, content: bytes) -> tuple[list[str], list[list[Any]]]:
    if not content:
        raise HTTPException(422, detail="The uploaded file is empty")
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(413, detail="Import file exceeds the 10 MB limit")
    name = (filename or "").lower()
    if name.endswith(".xlsx"):
        headers, rows = _parse_xlsx(content)
    elif name.endswith(".csv") or name.endswith(".txt"):
        headers, rows = _parse_csv(content)
    else:
        raise HTTPException(415, detail="Upload a .csv or .xlsx file")
    if len(rows) > MAX_IMPORT_ROWS:
        raise HTTPException(413, detail=f"Import is limited to {MAX_IMPORT_ROWS:,} rows per file")
    return headers, rows


def _mapping(headers: list[str]) -> tuple[dict[int, str], dict[str, str]]:
    by_index = {}
    public = {}
    used = set()
    for index, header in enumerate(headers):
        canonical = _canonical_field(header)
        if canonical and canonical not in used:
            by_index[index] = canonical
            public[header or f"Column {index + 1}"] = canonical
            used.add(canonical)
    if "phone" not in used:
        raise HTTPException(
            422,
            detail={
                "code": "phone_column_not_found",
                "message": "No phone column was detected. Map a column such as Contact Number (+91), Mobile, Phone or WhatsApp Number.",
                "headers": headers[:50],
            },
        )
    return by_index, public


def _heuristic_score(row: dict) -> tuple[int, str]:
    score = 35
    if row.get("email"):
        score += 12
    if row.get("phone_enc"):
        score += 12
    if row.get("company"):
        score += 10
    if row.get("district") or row.get("state"):
        score += 6
    score = max(1, min(99, score))
    return score, "HOT" if score >= 75 else "WARM" if score >= 50 else "COLD"


async def _build_preview(
    *, workspace_id: str, actor: str, filename: str, content: bytes, country_code: str
) -> dict:
    headers, raw_rows = _parse_upload(filename, content)
    mapping, public_mapping = _mapping(headers)

    valid_rows = []
    rejected = []
    seen_hashes = set()
    duplicate_rows = 0
    empty_rows = 0

    for row_number, values in enumerate(raw_rows, start=2):
        if not any(_cell_text(value) for value in values):
            empty_rows += 1
            continue
        mapped = {}
        for index, canonical in mapping.items():
            mapped[canonical] = _cell_text(values[index]) if index < len(values) else ""

        normalized = _normalize_phone(mapped.get("phone"), country_code)
        if not normalized:
            rejected.append({"row": row_number, "reason": "invalid_phone"})
            continue
        phash = phone_hash(normalized)
        if phash in seen_hashes:
            duplicate_rows += 1
            continue
        seen_hashes.add(phash)

        name = mapped.get("name") or mapped.get("company") or f"Contact {row_number}"
        company = mapped.get("company") or (mapped.get("name") if "plant" in _header_key(next((h for h, c in public_mapping.items() if c == "name"), "")) else "")
        tags = [part.strip() for part in re.split(r"[,;|]", mapped.get("tags", "")) if part.strip()]
        valid_rows.append({
            "row": row_number,
            "name": name[:160],
            "company": company[:160],
            "email": mapped.get("email", "").lower()[:254],
            "phone_enc": encrypt_str(normalized),
            "phone_hash": phash,
            "phone_masked": mask_phone(normalized),
            "district": mapped.get("district", "")[:120],
            "taluka": mapped.get("taluka", "")[:120],
            "state": mapped.get("state", "")[:120],
            "channel": mapped.get("channel") or "WhatsApp",
            "source": mapped.get("source") or "CSV / Excel",
            "budget": mapped.get("budget", "")[:120],
            "notes": mapped.get("notes", "")[:1000],
            "tags": tags[:20],
        })

    hashes = [row["phone_hash"] for row in valid_rows]
    existing_hashes = set()
    if hashes:
        existing = await db.leads.find(
            {"workspace_id": workspace_id, "phone_hash": {"$in": hashes}}, {"phone_hash": 1}
        ).to_list(len(hashes))
        existing_hashes = {item.get("phone_hash") for item in existing if item.get("phone_hash")}

    new_rows = [row for row in valid_rows if row["phone_hash"] not in existing_hashes]
    existing_count = len(valid_rows) - len(new_rows)
    preview_id = oid()
    expires_at = now() + timedelta(hours=IMPORT_TTL_HOURS)
    doc = {
        "id": preview_id,
        "workspace_id": workspace_id,
        "filename": filename,
        "country_code": country_code,
        "headers": headers,
        "mapping": public_mapping,
        "rows": new_rows,
        "status": "preview",
        "stats": {
            "source_rows": len(raw_rows),
            "valid_unique": len(valid_rows),
            "ready_to_import": len(new_rows),
            "duplicates_in_file": duplicate_rows,
            "already_in_workspace": existing_count,
            "invalid": len(rejected),
            "empty": empty_rows,
        },
        "rejected": rejected[:1000],
        "created_by": actor,
        "created_at": now_iso(),
        "expires_at": expires_at,
    }
    await db.contact_imports.insert_one(doc)
    await audit(workspace_id, actor, "contacts.import_previewed", "contact_import", {
        "preview_id": preview_id,
        "filename": filename,
        "ready": len(new_rows),
        "invalid": len(rejected),
        "duplicates": duplicate_rows + existing_count,
    })
    return _preview_public(doc)


def _preview_public(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "filename": doc.get("filename"),
        "country_code": doc.get("country_code"),
        "mapping": doc.get("mapping", {}),
        "stats": doc.get("stats", {}),
        "status": doc.get("status"),
        "sample": [
            {
                "row": row.get("row"), "name": row.get("name"), "company": row.get("company"),
                "phone_masked": row.get("phone_masked"), "district": row.get("district"),
                "taluka": row.get("taluka"), "state": row.get("state"),
            }
            for row in (doc.get("rows") or [])[:10]
        ],
        "rejected_sample": (doc.get("rejected") or [])[:10],
        "created_at": doc.get("created_at"),
    }


async def _commit_preview(doc: dict, body: ImportCommitIn, user: dict) -> dict:
    if doc.get("status") != "preview":
        raise HTTPException(409, detail="This import preview has already been committed")
    if body.consent_status not in {"pending", "opted_in"}:
        raise HTTPException(400, detail="Imported contacts can start as pending or opted_in only")
    if body.consent_status == "opted_in" and not body.confirm_opt_in:
        raise HTTPException(
            400,
            detail="Confirm that these contacts explicitly opted in to receive messages before marking them opted_in",
        )
    if body.consent_status == "opted_in" and not body.consent_source.strip():
        raise HTTPException(400, detail="A documented consent source is required for opted-in imports")

    ws = user["workspace_id"]
    imported_ids = []
    skipped_existing = 0
    for row in doc.get("rows") or []:
        exists = await db.leads.find_one({"workspace_id": ws, "phone_hash": row["phone_hash"]}, {"id": 1})
        if exists:
            skipped_existing += 1
            continue
        score, temperature = _heuristic_score(row)
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
            "import_id": doc["id"],
            "last_activity": now_iso(),
            "created_at": now_iso(),
        }
        await db.leads.insert_one(lead)
        imported_ids.append(lead_id)

    audience = None
    if body.audience_name and imported_ids:
        audience = await _create_static_audience(
            ws, body.audience_name.strip(), imported_ids, user.get("name", "user"),
            description=f"Created from import {doc.get('filename', '')}",
        )

    result = await db.contact_imports.update_one(
        {"id": doc["id"], "workspace_id": ws, "status": "preview"},
        {"$set": {
            "status": "committed", "committed_at": now_iso(), "committed_by": user.get("id"),
            "imported": len(imported_ids), "skipped_existing_at_commit": skipped_existing,
            "consent_status": body.consent_status, "audience_id": audience.get("id") if audience else None,
        }, "$unset": {"rows": ""}},
    )
    if result.modified_count != 1:
        raise HTTPException(409, detail="Import state changed; reload before committing again")
    await audit(ws, user.get("name", "user"), "contacts.import_committed", "contact_import", {
        "preview_id": doc["id"], "imported": len(imported_ids), "skipped": skipped_existing,
        "consent_status": body.consent_status, "audience_id": audience.get("id") if audience else None,
    })
    return {
        "ok": True, "import_id": doc["id"], "imported": len(imported_ids),
        "skipped": skipped_existing, "consent_status": body.consent_status,
        "audience": _audience_public(audience) if audience else None,
    }


def _lead_public(lead: dict) -> dict:
    return {
        "id": lead["id"], "name": lead.get("name", ""), "company": lead.get("company", ""),
        "phone_masked": lead.get("phone_masked", ""), "email": lead.get("email", ""),
        "district": lead.get("district", ""), "taluka": lead.get("taluka", ""),
        "state": lead.get("state", ""), "temperature": lead.get("temperature"),
        "stage": lead.get("stage"), "consent_status": lead.get("consent_status", "pending"),
        "source": lead.get("source"), "tags": lead.get("tags", []),
    }


def _audience_public(doc: Optional[dict], count: Optional[int] = None) -> Optional[dict]:
    if not doc:
        return None
    return {
        "id": doc["id"], "name": doc["name"], "description": doc.get("description", ""),
        "kind": doc.get("kind", "static"), "rules": doc.get("rules", {}),
        "member_count": count if count is not None else len(doc.get("lead_ids", [])),
        "created_at": doc.get("created_at"), "updated_at": doc.get("updated_at"),
    }


def _exact_ci(value: Any) -> dict:
    return {"$regex": f"^{re.escape(str(value).strip())}$", "$options": "i"}


def _dynamic_query(workspace_id: str, rules: dict[str, Any]) -> dict:
    query: dict[str, Any] = {"workspace_id": workspace_id}
    allowed = {"state", "district", "taluka", "temperature", "stage", "consent_status", "source"}
    for key in allowed:
        value = rules.get(key)
        if value not in (None, ""):
            query[key] = _exact_ci(value)
    tag = rules.get("tag")
    if tag:
        query["tags"] = _exact_ci(tag)
    return query


async def _resolve_one_audience(workspace_id: str, audience: dict) -> list[dict]:
    if audience.get("kind") == "dynamic":
        return await db.leads.find(_dynamic_query(workspace_id, audience.get("rules") or {})).to_list(10000)
    ids = list(dict.fromkeys(audience.get("lead_ids") or []))
    if not ids:
        return []
    return await db.leads.find({"workspace_id": workspace_id, "id": {"$in": ids}}).to_list(10000)


async def resolve_audience_leads(workspace_id: str, audience_ids: list[str]) -> list[dict]:
    ids = list(dict.fromkeys(audience_ids or []))
    if not ids:
        return []
    audiences = await db.broadcast_audiences.find(
        {"workspace_id": workspace_id, "id": {"$in": ids}}
    ).to_list(len(ids))
    found = {audience["id"] for audience in audiences}
    missing = [item for item in ids if item not in found]
    if missing:
        raise HTTPException(400, detail=f"Unknown Broadcast audience: {missing[0]}")

    deduped = {}
    for audience in audiences:
        for lead in await _resolve_one_audience(workspace_id, audience):
            key = lead.get("phone_hash") or lead.get("id")
            deduped[key] = lead
    return list(deduped.values())


async def _create_static_audience(
    workspace_id: str, name: str, lead_ids: list[str], actor: str, description: str = ""
) -> dict:
    doc = {
        "id": oid(), "workspace_id": workspace_id, "name": name, "description": description,
        "kind": "static", "lead_ids": list(dict.fromkeys(lead_ids)), "rules": {},
        "created_by": actor, "created_at": now_iso(), "updated_at": now_iso(),
    }
    await db.broadcast_audiences.insert_one(dict(doc))
    return doc


@router.post("/contact-imports/preview")
async def preview_import(
    file: UploadFile = File(...),
    country_code: str = Form("+91"),
    user: dict = Depends(get_current_user),
):
    content = await file.read()
    return await _build_preview(
        workspace_id=user["workspace_id"], actor=user.get("name", "user"),
        filename=file.filename or "contacts.csv", content=content, country_code=country_code,
    )


@router.post("/contact-imports/{preview_id}/commit")
async def commit_import(preview_id: str, body: ImportCommitIn, user: dict = Depends(get_current_user)):
    doc = await db.contact_imports.find_one({"id": preview_id, "workspace_id": user["workspace_id"]})
    if not doc:
        raise HTTPException(404, detail="Import preview not found or expired")
    return await _commit_preview(doc, body, user)


@router.get("/contact-imports")
async def list_imports(user: dict = Depends(get_current_user)):
    rows = await db.contact_imports.find(
        {"workspace_id": user["workspace_id"]}, {"rows": 0, "rejected": 0}
    ).sort("created_at", -1).to_list(100)
    return [clean(row) for row in rows]


@router.post("/leads/import")
async def compatibility_import(
    file: UploadFile = File(...),
    country_code: str = Form("+91"),
    user: dict = Depends(get_current_user),
):
    """Safe compatibility route for the legacy Lead Engine import button.

    Unlike the prototype route, imported contacts are not treated as opted in.
    """
    content = await file.read()
    preview = await _build_preview(
        workspace_id=user["workspace_id"], actor=user.get("name", "user"),
        filename=file.filename or "contacts.csv", content=content, country_code=country_code,
    )
    doc = await db.contact_imports.find_one({"id": preview["id"], "workspace_id": user["workspace_id"]})
    committed = await _commit_preview(doc, ImportCommitIn(), user)
    return {
        "imported": committed["imported"],
        "skipped": committed["skipped"] + preview["stats"].get("duplicates_in_file", 0)
                   + preview["stats"].get("already_in_workspace", 0) + preview["stats"].get("invalid", 0),
        "consent_status": "pending",
        "report": preview["stats"],
    }


@router.get("/audiences")
async def list_audiences(user: dict = Depends(get_current_user)):
    rows = await db.broadcast_audiences.find({"workspace_id": user["workspace_id"]}).sort("updated_at", -1).to_list(200)
    out = []
    for row in rows:
        count = len(await _resolve_one_audience(user["workspace_id"], row))
        out.append(_audience_public(row, count))
    return out


@router.post("/audiences")
async def create_audience(body: AudienceIn, user: dict = Depends(get_current_user)):
    kind = body.kind.strip().lower()
    if kind not in {"static", "dynamic"}:
        raise HTTPException(400, detail="Audience kind must be static or dynamic")
    lead_ids = list(dict.fromkeys(body.lead_ids))
    if kind == "static" and lead_ids:
        owned = await db.leads.count_documents({"workspace_id": user["workspace_id"], "id": {"$in": lead_ids}})
        if owned != len(lead_ids):
            raise HTTPException(400, detail="One or more contacts do not belong to this workspace")
    doc = {
        "id": oid(), "workspace_id": user["workspace_id"], "name": body.name.strip(),
        "description": body.description.strip(), "kind": kind,
        "lead_ids": lead_ids if kind == "static" else [], "rules": body.rules if kind == "dynamic" else {},
        "created_by": user.get("id"), "created_at": now_iso(), "updated_at": now_iso(),
    }
    await db.broadcast_audiences.insert_one(dict(doc))
    count = len(await _resolve_one_audience(user["workspace_id"], doc))
    await audit(user["workspace_id"], user.get("name", "user"), "audience.created", "broadcast_audience", {
        "audience_id": doc["id"], "kind": kind, "count": count,
    })
    return _audience_public(doc, count)


@router.get("/audiences/{audience_id}")
async def get_audience(audience_id: str, user: dict = Depends(get_current_user)):
    audience = await db.broadcast_audiences.find_one({"id": audience_id, "workspace_id": user["workspace_id"]})
    if not audience:
        raise HTTPException(404, detail="Broadcast audience not found")
    leads = await _resolve_one_audience(user["workspace_id"], audience)
    result = _audience_public(audience, len(leads))
    result["contacts"] = [_lead_public(lead) for lead in leads[:500]]
    return result


@router.patch("/audiences/{audience_id}")
async def update_audience(audience_id: str, body: AudienceUpdateIn, user: dict = Depends(get_current_user)):
    audience = await db.broadcast_audiences.find_one({"id": audience_id, "workspace_id": user["workspace_id"]})
    if not audience:
        raise HTTPException(404, detail="Broadcast audience not found")
    updates: dict[str, Any] = {"updated_at": now_iso()}
    if body.name is not None:
        updates["name"] = body.name.strip()
    if body.description is not None:
        updates["description"] = body.description.strip()
    if audience.get("kind") == "static" and body.lead_ids is not None:
        ids = list(dict.fromkeys(body.lead_ids))
        owned = await db.leads.count_documents({"workspace_id": user["workspace_id"], "id": {"$in": ids}}) if ids else 0
        if owned != len(ids):
            raise HTTPException(400, detail="One or more contacts do not belong to this workspace")
        updates["lead_ids"] = ids
    if audience.get("kind") == "dynamic" and body.rules is not None:
        updates["rules"] = body.rules
    await db.broadcast_audiences.update_one({"id": audience_id, "workspace_id": user["workspace_id"]}, {"$set": updates})
    fresh = await db.broadcast_audiences.find_one({"id": audience_id, "workspace_id": user["workspace_id"]})
    count = len(await _resolve_one_audience(user["workspace_id"], fresh))
    return _audience_public(fresh, count)


@router.delete("/audiences/{audience_id}")
async def delete_audience(audience_id: str, user: dict = Depends(require_role("owner", "admin"))):
    in_use = await db.campaigns.count_documents({
        "workspace_id": user["workspace_id"], "audience_ids": audience_id,
        "status": {"$in": ["approved", "scheduled", "sending"]},
    })
    if in_use:
        raise HTTPException(409, detail="Audience is used by an active campaign")
    result = await db.broadcast_audiences.delete_one({"id": audience_id, "workspace_id": user["workspace_id"]})
    if not result.deleted_count:
        raise HTTPException(404, detail="Broadcast audience not found")
    await audit(user["workspace_id"], user.get("name", "user"), "audience.deleted", "broadcast_audience", {"audience_id": audience_id})
    return {"ok": True}

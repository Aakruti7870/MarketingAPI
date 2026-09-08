"""GOLD-e Flow Engine.

The internal flow definition is channel-neutral. Web/support-widget renderers use it
now; a WhatsApp Flow adapter can compile compatible published versions later without
making Meta's JSON format the source of truth.
"""
import re
from copy import deepcopy
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from core import audit, clean, db, get_current_user, now_iso, oid, require_role

router = APIRouter(prefix="/api/flows", tags=["flows"])

SUPPORTED_CHANNELS = {"web", "support_widget", "whatsapp"}
SUPPORTED_FIELD_TYPES = {
    "text", "textarea", "select", "radio", "checkbox", "number", "email", "phone", "date"
}
FORBIDDEN_FIELD_RE = re.compile(r"password|passcode|otp|token|secret|api[_ -]?key|access[_ -]?key", re.I)
ID_RE = re.compile(r"^[a-z][a-z0-9_-]{0,63}$")


class FlowCreateIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    category: str = Field(default="CUSTOMER_SUPPORT", max_length=60)
    description: str = Field(default="", max_length=500)
    channels: list[str] = Field(default_factory=lambda: ["web", "support_widget"])
    definition: dict[str, Any]


class FlowUpdateIn(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    category: Optional[str] = Field(default=None, max_length=60)
    description: Optional[str] = Field(default=None, max_length=500)
    channels: Optional[list[str]] = None
    definition: Optional[dict[str, Any]] = None


class SessionStartIn(BaseModel):
    channel: str = "web"
    mode: str = "live"  # live | preview


class SessionSubmitIn(BaseModel):
    answers: dict[str, Any] = Field(default_factory=dict)


SUPPORT_DEFINITION = {
    "entry_screen": "issue",
    "screens": [
        {
            "id": "issue",
            "title": "How can GOLD-e AI help?",
            "body": "Choose the area that best matches your issue.",
            "fields": [{
                "name": "issue",
                "type": "select",
                "label": "Support area",
                "required": True,
                "options": [
                    {"label": "CSV / XLSX Import", "value": "csv_import"},
                    {"label": "WhatsApp Connection", "value": "whatsapp"},
                    {"label": "Campaign Problem", "value": "campaign"},
                    {"label": "Billing / Coins", "value": "billing"},
                    {"label": "Report a Bug", "value": "bug"},
                    {"label": "Talk to Support", "value": "human"},
                ],
            }],
            "branches": [
                {"field": "issue", "equals": "csv_import", "next_screen": "csv_import"},
                {"field": "issue", "equals": "whatsapp", "next_screen": "whatsapp"},
                {"field": "issue", "equals": "campaign", "next_screen": "campaign"},
                {"field": "issue", "equals": "billing", "next_screen": "billing"},
                {"field": "issue", "equals": "bug", "next_screen": "bug"},
                {"field": "issue", "equals": "human", "next_screen": "human"},
            ],
        },
        {
            "id": "csv_import",
            "title": "Import diagnostic",
            "body": "Tell us what happened. Never include passwords, OTPs or API secrets.",
            "fields": [
                {"name": "import_problem", "type": "select", "label": "Problem", "required": True,
                 "options": [
                     {"label": "Numbers not detected", "value": "numbers_not_detected"},
                     {"label": "Wrong columns", "value": "wrong_columns"},
                     {"label": "Duplicates", "value": "duplicates"},
                     {"label": "XLSX not importing", "value": "xlsx"},
                     {"label": "Invalid country code", "value": "country_code"},
                     {"label": "Other", "value": "other"},
                 ]},
                {"name": "country", "type": "text", "label": "Country / calling code", "required": False},
                {"name": "details", "type": "textarea", "label": "What did you expect?", "required": False},
            ],
            "terminal": True,
        },
        {
            "id": "whatsapp",
            "title": "WhatsApp diagnostic",
            "body": "Choose the stage that is blocked. Do not paste Meta tokens or App Secrets.",
            "fields": [{"name": "whatsapp_stage", "type": "select", "label": "Blocked stage", "required": True,
                        "options": [
                            {"label": "Phone verification", "value": "phone_verification"},
                            {"label": "Webhook", "value": "webhook"},
                            {"label": "Message sending", "value": "sending"},
                            {"label": "Template approval", "value": "template"},
                            {"label": "Other", "value": "other"},
                        ]}],
            "terminal": True,
        },
        {
            "id": "campaign",
            "title": "Campaign diagnostic",
            "body": "Describe the campaign problem so GOLD-e can route it correctly.",
            "fields": [
                {"name": "campaign_problem", "type": "select", "label": "Problem", "required": True,
                 "options": [
                     {"label": "0 eligible recipients", "value": "zero_recipients"},
                     {"label": "Approval blocked", "value": "approval"},
                     {"label": "Scheduled campaign did not run", "value": "schedule"},
                     {"label": "Messages failed", "value": "failed"},
                 ]},
                {"name": "details", "type": "textarea", "label": "Additional details", "required": False},
            ],
            "terminal": True,
        },
        {
            "id": "billing",
            "title": "Billing and coins",
            "body": "Choose the billing issue. GOLD-e support never needs your card details.",
            "fields": [{"name": "billing_problem", "type": "select", "label": "Issue", "required": True,
                        "options": [
                            {"label": "Coin balance", "value": "coins"},
                            {"label": "Plan / upgrade", "value": "plan"},
                            {"label": "Payment status", "value": "payment"},
                        ]}],
            "terminal": True,
        },
        {
            "id": "bug",
            "title": "Report a bug",
            "body": "Give us reproducible details without including credentials or personal secrets.",
            "fields": [
                {"name": "module", "type": "text", "label": "Module / page", "required": True},
                {"name": "steps", "type": "textarea", "label": "Steps to reproduce", "required": True},
                {"name": "impact", "type": "select", "label": "Impact", "required": True,
                 "options": [
                     {"label": "Low", "value": "low"},
                     {"label": "Medium", "value": "medium"},
                     {"label": "High", "value": "high"},
                     {"label": "Critical", "value": "critical"},
                 ]},
            ],
            "terminal": True,
        },
        {
            "id": "human",
            "title": "Human support handoff",
            "body": "Add a short summary. GOLD-e will keep the flow context with the support request.",
            "fields": [{"name": "summary", "type": "textarea", "label": "Summary", "required": True}],
            "terminal": True,
        },
    ],
}

LEAD_DEFINITION = {
    "entry_screen": "need",
    "screens": [
        {"id": "need", "title": "Tell us what you need", "body": "A short qualification flow.",
         "fields": [
             {"name": "requirement", "type": "textarea", "label": "Requirement", "required": True},
             {"name": "budget", "type": "text", "label": "Budget", "required": False},
         ], "next_screen": "contact"},
        {"id": "contact", "title": "Contact details", "body": "Where should the team follow up?",
         "fields": [
             {"name": "name", "type": "text", "label": "Name", "required": True},
             {"name": "phone", "type": "phone", "label": "Phone", "required": True},
             {"name": "email", "type": "email", "label": "Email", "required": False},
         ], "terminal": True},
    ],
}

SURVEY_DEFINITION = {
    "entry_screen": "survey",
    "screens": [{
        "id": "survey", "title": "Quick feedback", "body": "Help us improve the experience.",
        "fields": [
            {"name": "rating", "type": "radio", "label": "Rating", "required": True,
             "options": [{"label": str(value), "value": str(value)} for value in range(1, 6)]},
            {"name": "feedback", "type": "textarea", "label": "Comments", "required": False},
        ], "terminal": True,
    }],
}

BUILTIN_TEMPLATES = {
    "golde-support": {
        "key": "golde-support", "name": "GOLD-e AI Support", "category": "CUSTOMER_SUPPORT",
        "description": "Structured support triage for imports, WhatsApp, campaigns, billing and bugs.",
        "channels": ["web", "support_widget", "whatsapp"], "definition": SUPPORT_DEFINITION,
    },
    "lead-qualification": {
        "key": "lead-qualification", "name": "Lead Qualification", "category": "LEAD_GENERATION",
        "description": "Collect a requirement and follow-up details in two steps.",
        "channels": ["web", "support_widget", "whatsapp"], "definition": LEAD_DEFINITION,
    },
    "feedback-survey": {
        "key": "feedback-survey", "name": "Feedback Survey", "category": "SURVEY",
        "description": "A compact customer feedback flow.",
        "channels": ["web", "support_widget", "whatsapp"], "definition": SURVEY_DEFINITION,
    },
}


def _validate_channels(channels: list[str]) -> list[str]:
    normalized = []
    for channel in channels or []:
        value = str(channel).strip().lower()
        if value not in SUPPORTED_CHANNELS:
            raise HTTPException(422, detail=f"Unsupported flow channel: {channel}")
        if value not in normalized:
            normalized.append(value)
    if not normalized:
        raise HTTPException(422, detail="Choose at least one flow channel")
    return normalized


def _normalize_definition(definition: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(definition, dict):
        raise HTTPException(422, detail="Flow definition must be an object")
    raw_screens = definition.get("screens")
    if not isinstance(raw_screens, list) or not raw_screens:
        raise HTTPException(422, detail="Flow requires at least one screen")
    if len(raw_screens) > 50:
        raise HTTPException(422, detail="Flow cannot exceed 50 screens")

    screens = []
    ids = set()
    for raw in raw_screens:
        if not isinstance(raw, dict):
            raise HTTPException(422, detail="Every flow screen must be an object")
        screen_id = str(raw.get("id", "")).strip().lower()
        if not ID_RE.match(screen_id):
            raise HTTPException(422, detail=f"Invalid screen id: {screen_id or '(empty)'}")
        if screen_id in ids:
            raise HTTPException(422, detail=f"Duplicate screen id: {screen_id}")
        ids.add(screen_id)

        fields = []
        raw_fields = raw.get("fields") or []
        if not isinstance(raw_fields, list) or len(raw_fields) > 30:
            raise HTTPException(422, detail=f"Screen {screen_id} has invalid fields")
        field_names = set()
        for item in raw_fields:
            if not isinstance(item, dict):
                raise HTTPException(422, detail=f"Screen {screen_id} contains an invalid field")
            name = str(item.get("name", "")).strip().lower()
            field_type = str(item.get("type", "text")).strip().lower()
            if not ID_RE.match(name) or FORBIDDEN_FIELD_RE.search(name):
                raise HTTPException(422, detail=f"Unsafe or invalid field name: {name or '(empty)'}")
            if name in field_names:
                raise HTTPException(422, detail=f"Duplicate field {name} on screen {screen_id}")
            if field_type not in SUPPORTED_FIELD_TYPES:
                raise HTTPException(422, detail=f"Unsupported field type: {field_type}")
            field_names.add(name)
            options = []
            for option in item.get("options") or []:
                if isinstance(option, dict):
                    label = str(option.get("label", "")).strip()[:120]
                    value = str(option.get("value", "")).strip()[:120]
                else:
                    label = value = str(option).strip()[:120]
                if value:
                    options.append({"label": label or value, "value": value})
            fields.append({
                "name": name,
                "type": field_type,
                "label": str(item.get("label", name.replace("_", " ").title()))[:160],
                "required": bool(item.get("required", False)),
                "placeholder": str(item.get("placeholder", ""))[:200],
                "options": options,
            })

        branches = []
        for branch in raw.get("branches") or []:
            if not isinstance(branch, dict):
                continue
            branches.append({
                "field": str(branch.get("field", "")).strip().lower(),
                "equals": branch.get("equals"),
                "next_screen": str(branch.get("next_screen", "")).strip().lower(),
            })

        screens.append({
            "id": screen_id,
            "title": str(raw.get("title", screen_id.replace("_", " ").title()))[:160],
            "body": str(raw.get("body", ""))[:1200],
            "fields": fields,
            "branches": branches,
            "next_screen": str(raw.get("next_screen", "")).strip().lower() or None,
            "terminal": bool(raw.get("terminal", False)),
        })

    entry = str(definition.get("entry_screen", screens[0]["id"])).strip().lower()
    if entry not in ids:
        raise HTTPException(422, detail="Entry screen does not exist")

    for screen in screens:
        target = screen.get("next_screen")
        if target and target not in ids:
            raise HTTPException(422, detail=f"Screen {screen['id']} points to missing screen {target}")
        for branch in screen.get("branches", []):
            if branch["field"] not in {field["name"] for field in screen["fields"]}:
                raise HTTPException(422, detail=f"Branch on {screen['id']} references a missing field")
            if branch["next_screen"] not in ids:
                raise HTTPException(422, detail=f"Branch on {screen['id']} points to a missing screen")

    return {"entry_screen": entry, "screens": screens}


def _public_flow(flow: dict, include_definition: bool = False) -> dict:
    result = {
        "id": flow["id"],
        "name": flow["name"],
        "category": flow.get("category", "CUSTOMER_SUPPORT"),
        "description": flow.get("description", ""),
        "channels": flow.get("channels", []),
        "status": flow.get("status", "draft"),
        "published_version": flow.get("published_version"),
        "created_at": flow.get("created_at"),
        "updated_at": flow.get("updated_at"),
    }
    if include_definition:
        result["definition"] = flow.get("draft_definition") or {}
    return result


def _screen(definition: dict, screen_id: str) -> dict:
    for screen in definition.get("screens", []):
        if screen.get("id") == screen_id:
            return screen
    raise HTTPException(500, detail="Flow version is missing its current screen")


def _validate_answers(screen: dict, answers: dict[str, Any]) -> dict[str, Any]:
    cleaned = {}
    errors = {}
    answers = answers or {}
    for field in screen.get("fields", []):
        name = field["name"]
        value = answers.get(name)
        if isinstance(value, str):
            value = value.strip()[:5000]
        if field.get("required") and (value is None or value == "" or value == []):
            errors[name] = "This field is required"
            continue
        if value is None or value == "":
            continue
        field_type = field["type"]
        if field_type in {"select", "radio"}:
            allowed = {str(option["value"]) for option in field.get("options", [])}
            if str(value) not in allowed:
                errors[name] = "Choose a valid option"
                continue
        elif field_type == "checkbox":
            value = bool(value)
        elif field_type == "number":
            try:
                value = float(value)
            except (TypeError, ValueError):
                errors[name] = "Enter a valid number"
                continue
        elif field_type == "email":
            if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", str(value)):
                errors[name] = "Enter a valid email address"
                continue
        elif field_type == "phone":
            digits = re.sub(r"\D", "", str(value))
            if len(digits) < 7 or len(digits) > 15:
                errors[name] = "Enter a valid phone number"
                continue
        cleaned[name] = value
    if errors:
        raise HTTPException(status_code=422, detail={"code": "flow_validation", "fields": errors})
    return cleaned


def _next_screen(screen: dict, answers: dict[str, Any]) -> Optional[str]:
    for branch in screen.get("branches", []):
        if answers.get(branch.get("field")) == branch.get("equals"):
            return branch.get("next_screen")
    if screen.get("terminal"):
        return None
    return screen.get("next_screen")


@router.get("/templates")
async def templates(user: dict = Depends(get_current_user)):
    return [{key: value for key, value in template.items() if key != "definition"} for template in BUILTIN_TEMPLATES.values()]


@router.post("/from-template/{template_key}")
async def create_from_template(template_key: str, user: dict = Depends(get_current_user)):
    template = BUILTIN_TEMPLATES.get(template_key)
    if not template:
        raise HTTPException(404, detail="Flow template not found")
    body = FlowCreateIn(
        name=template["name"],
        category=template["category"],
        description=template["description"],
        channels=template["channels"],
        definition=deepcopy(template["definition"]),
    )
    return await create_flow(body, user)


@router.get("")
async def list_flows(user: dict = Depends(get_current_user)):
    rows = await db.flows.find({"workspace_id": user["workspace_id"]}).sort("updated_at", -1).to_list(200)
    return [_public_flow(row) for row in rows]


@router.post("")
async def create_flow(body: FlowCreateIn, user: dict = Depends(get_current_user)):
    flow_id = oid()
    definition = _normalize_definition(body.definition)
    channels = _validate_channels(body.channels)
    doc = {
        "id": flow_id,
        "workspace_id": user["workspace_id"],
        "name": body.name.strip(),
        "category": body.category.strip().upper(),
        "description": body.description.strip(),
        "channels": channels,
        "draft_definition": definition,
        "status": "draft",
        "published_version": None,
        "created_by": user.get("id"),
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.flows.insert_one(dict(doc))
    await audit(user["workspace_id"], user.get("name", "user"), "flow.created", "flow", {"flow_id": flow_id})
    return _public_flow(doc, include_definition=True)


@router.get("/{flow_id}")
async def get_flow(flow_id: str, user: dict = Depends(get_current_user)):
    flow = await db.flows.find_one({"id": flow_id, "workspace_id": user["workspace_id"]})
    if not flow:
        raise HTTPException(404, detail="Flow not found")
    result = _public_flow(flow, include_definition=True)
    versions = await db.flow_versions.find({"flow_id": flow_id, "workspace_id": user["workspace_id"]}).sort("version", -1).to_list(50)
    result["versions"] = [{"version": row["version"], "published_at": row.get("published_at"), "published_by": row.get("published_by")} for row in versions]
    return result


@router.patch("/{flow_id}")
async def update_flow(flow_id: str, body: FlowUpdateIn, user: dict = Depends(get_current_user)):
    flow = await db.flows.find_one({"id": flow_id, "workspace_id": user["workspace_id"]})
    if not flow:
        raise HTTPException(404, detail="Flow not found")
    updates: dict[str, Any] = {"updated_at": now_iso()}
    if body.name is not None:
        updates["name"] = body.name.strip()
    if body.category is not None:
        updates["category"] = body.category.strip().upper()
    if body.description is not None:
        updates["description"] = body.description.strip()
    if body.channels is not None:
        updates["channels"] = _validate_channels(body.channels)
    if body.definition is not None:
        updates["draft_definition"] = _normalize_definition(body.definition)
    if flow.get("published_version"):
        updates["status"] = "published_with_draft"
    await db.flows.update_one({"id": flow_id, "workspace_id": user["workspace_id"]}, {"$set": updates})
    await audit(user["workspace_id"], user.get("name", "user"), "flow.updated", "flow", {"flow_id": flow_id})
    fresh = await db.flows.find_one({"id": flow_id, "workspace_id": user["workspace_id"]})
    return _public_flow(fresh, include_definition=True)


@router.post("/{flow_id}/publish")
async def publish_flow(flow_id: str, user: dict = Depends(require_role("owner", "admin"))):
    flow = await db.flows.find_one({"id": flow_id, "workspace_id": user["workspace_id"]})
    if not flow:
        raise HTTPException(404, detail="Flow not found")
    definition = _normalize_definition(flow.get("draft_definition") or {})
    version = int(flow.get("published_version") or 0) + 1
    version_doc = {
        "id": oid(), "workspace_id": user["workspace_id"], "flow_id": flow_id,
        "version": version, "definition": definition,
        "published_by": user.get("name", "user"), "published_at": now_iso(),
    }
    await db.flow_versions.insert_one(version_doc)
    await db.flows.update_one(
        {"id": flow_id, "workspace_id": user["workspace_id"]},
        {"$set": {"published_version": version, "status": "published", "published_at": now_iso(), "updated_at": now_iso()}},
    )
    await audit(user["workspace_id"], user.get("name", "user"), "flow.published", "flow", {"flow_id": flow_id, "version": version})
    return {"ok": True, "flow_id": flow_id, "version": version, "status": "published"}


@router.delete("/{flow_id}")
async def delete_flow(flow_id: str, user: dict = Depends(require_role("owner", "admin"))):
    flow = await db.flows.find_one({"id": flow_id, "workspace_id": user["workspace_id"]})
    if not flow:
        raise HTTPException(404, detail="Flow not found")
    active = await db.flow_sessions.count_documents({"flow_id": flow_id, "workspace_id": user["workspace_id"], "status": "active"})
    if active:
        raise HTTPException(409, detail="Flow has active sessions and cannot be deleted")
    await db.flows.delete_one({"id": flow_id, "workspace_id": user["workspace_id"]})
    await db.flow_versions.delete_many({"flow_id": flow_id, "workspace_id": user["workspace_id"]})
    await audit(user["workspace_id"], user.get("name", "user"), "flow.deleted", "flow", {"flow_id": flow_id})
    return {"ok": True}


@router.post("/{flow_id}/sessions")
async def start_session(flow_id: str, body: SessionStartIn, user: dict = Depends(get_current_user)):
    flow = await db.flows.find_one({"id": flow_id, "workspace_id": user["workspace_id"]})
    if not flow:
        raise HTTPException(404, detail="Flow not found")
    channel = body.channel.strip().lower()
    if channel not in flow.get("channels", []):
        raise HTTPException(400, detail="Flow is not enabled for this channel")
    if body.mode not in {"live", "preview"}:
        raise HTTPException(400, detail="Session mode must be live or preview")

    version = 0
    if body.mode == "preview":
        definition = _normalize_definition(flow.get("draft_definition") or {})
    else:
        version = int(flow.get("published_version") or 0)
        if not version:
            raise HTTPException(400, detail="Publish this flow before starting a live session")
        version_doc = await db.flow_versions.find_one({
            "flow_id": flow_id, "workspace_id": user["workspace_id"], "version": version,
        })
        if not version_doc:
            raise HTTPException(500, detail="Published flow version is unavailable")
        definition = version_doc["definition"]

    session_id = oid()
    entry = definition["entry_screen"]
    session = {
        "id": session_id, "workspace_id": user["workspace_id"], "flow_id": flow_id,
        "flow_name": flow.get("name"), "version": version, "mode": body.mode, "channel": channel,
        "user_id": user.get("id"), "status": "active", "current_screen": entry,
        "data": {}, "started_at": now_iso(), "updated_at": now_iso(),
    }
    await db.flow_sessions.insert_one(dict(session))
    await db.flow_events.insert_one({
        "id": oid(), "workspace_id": user["workspace_id"], "flow_id": flow_id,
        "session_id": session_id, "event": "started", "screen_id": entry, "created_at": now_iso(),
    })
    return {"session": clean(session), "screen": _screen(definition, entry)}


async def _session_definition(session: dict) -> dict:
    if session.get("mode") == "preview":
        flow = await db.flows.find_one({"id": session["flow_id"], "workspace_id": session["workspace_id"]})
        if not flow:
            raise HTTPException(404, detail="Flow not found")
        return _normalize_definition(flow.get("draft_definition") or {})
    version_doc = await db.flow_versions.find_one({
        "flow_id": session["flow_id"], "workspace_id": session["workspace_id"], "version": session["version"],
    })
    if not version_doc:
        raise HTTPException(500, detail="Flow version is unavailable")
    return version_doc["definition"]


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user: dict = Depends(get_current_user)):
    session = await db.flow_sessions.find_one({"id": session_id, "workspace_id": user["workspace_id"], "user_id": user.get("id")})
    if not session:
        raise HTTPException(404, detail="Flow session not found")
    definition = await _session_definition(session)
    screen = _screen(definition, session["current_screen"]) if session.get("status") == "active" else None
    return {"session": clean(session), "screen": screen}


@router.post("/sessions/{session_id}/submit")
async def submit_session(session_id: str, body: SessionSubmitIn, user: dict = Depends(get_current_user)):
    session = await db.flow_sessions.find_one({"id": session_id, "workspace_id": user["workspace_id"], "user_id": user.get("id")})
    if not session:
        raise HTTPException(404, detail="Flow session not found")
    if session.get("status") != "active":
        raise HTTPException(409, detail="Flow session is already closed")
    definition = await _session_definition(session)
    current = _screen(definition, session["current_screen"])
    answers = _validate_answers(current, body.answers)
    next_screen = _next_screen(current, answers)
    merged = dict(session.get("data") or {})
    merged.update(answers)

    if next_screen:
        update = {"data": merged, "current_screen": next_screen, "updated_at": now_iso()}
        status = "active"
    else:
        update = {"data": merged, "status": "completed", "completed_at": now_iso(), "updated_at": now_iso()}
        status = "completed"

    claim = await db.flow_sessions.update_one(
        {"id": session_id, "workspace_id": user["workspace_id"], "user_id": user.get("id"), "status": "active", "current_screen": current["id"]},
        {"$set": update},
    )
    if claim.modified_count != 1:
        raise HTTPException(409, detail="Flow session changed; reload before continuing")
    await db.flow_events.insert_one({
        "id": oid(), "workspace_id": user["workspace_id"], "flow_id": session["flow_id"],
        "session_id": session_id, "event": "completed" if status == "completed" else "advanced",
        "screen_id": current["id"], "next_screen": next_screen, "created_at": now_iso(),
    })
    fresh = await db.flow_sessions.find_one({"id": session_id, "workspace_id": user["workspace_id"]})
    return {"session": clean(fresh), "screen": _screen(definition, next_screen) if next_screen else None}


@router.post("/sessions/{session_id}/cancel")
async def cancel_session(session_id: str, user: dict = Depends(get_current_user)):
    result = await db.flow_sessions.update_one(
        {"id": session_id, "workspace_id": user["workspace_id"], "user_id": user.get("id"), "status": "active"},
        {"$set": {"status": "cancelled", "cancelled_at": now_iso(), "updated_at": now_iso()}},
    )
    if not result.modified_count:
        raise HTTPException(404, detail="Active flow session not found")
    return {"ok": True, "status": "cancelled"}


@router.get("/{flow_id}/analytics")
async def flow_analytics(flow_id: str, user: dict = Depends(get_current_user)):
    flow = await db.flows.find_one({"id": flow_id, "workspace_id": user["workspace_id"]})
    if not flow:
        raise HTTPException(404, detail="Flow not found")
    query = {"flow_id": flow_id, "workspace_id": user["workspace_id"], "mode": "live"}
    started = await db.flow_sessions.count_documents(query)
    completed = await db.flow_sessions.count_documents({**query, "status": "completed"})
    cancelled = await db.flow_sessions.count_documents({**query, "status": "cancelled"})
    active = await db.flow_sessions.count_documents({**query, "status": "active"})
    completion_rate = round(completed / started * 100, 1) if started else 0.0
    return {
        "flow_id": flow_id, "name": flow["name"],
        "started": started, "completed": completed, "cancelled": cancelled, "active": active,
        "completion_rate": completion_rate,
    }

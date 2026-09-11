"""Secure plugin marketplace, AI routing, domain brokerage and TLS lifecycle APIs.

The module stores configuration and commercial intents. It never pretends that a
registrar, certificate authority, or AI vendor accepted work until a live
adapter records a provider reference.
"""
from __future__ import annotations

import re
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from core import audit, clean, db, now_iso, oid, require_role

router = APIRouter(prefix="/api/platform")

SCOPES = {
    "leads.read", "leads.write", "campaigns.read", "campaigns.write",
    "messages.read", "messages.send", "analytics.read", "files.read",
    "files.write", "billing.read", "domains.manage", "tls.manage",
}

PLUGIN_CATALOG = [
    {"slug": "openai", "name": "OpenAI", "category": "AI", "trust": "verified", "scopes": ["files.read"], "capabilities": ["text", "image", "reasoning", "structured-output"]},
    {"slug": "anthropic", "name": "Anthropic", "category": "AI", "trust": "reviewed", "scopes": ["files.read"], "capabilities": ["text", "reasoning", "long-context"]},
    {"slug": "google-ai", "name": "Google AI", "category": "AI", "trust": "reviewed", "scopes": ["files.read"], "capabilities": ["text", "image", "multimodal"]},
    {"slug": "meta-business", "name": "Meta Business", "category": "Advertising", "trust": "verified", "scopes": ["campaigns.read", "campaigns.write", "analytics.read"], "capabilities": ["ads", "audiences", "insights"]},
    {"slug": "google-ads", "name": "Google Ads", "category": "Advertising", "trust": "verified", "scopes": ["campaigns.read", "campaigns.write", "analytics.read"], "capabilities": ["search-ads", "display", "conversion-tracking"]},
    {"slug": "linkedin", "name": "LinkedIn Marketing", "category": "Advertising", "trust": "verified", "scopes": ["campaigns.read", "campaigns.write", "analytics.read"], "capabilities": ["b2b-ads", "lead-gen"]},
    {"slug": "hubspot", "name": "HubSpot", "category": "CRM", "trust": "verified", "scopes": ["leads.read", "leads.write"], "capabilities": ["crm", "contacts", "automation"]},
    {"slug": "shopify", "name": "Shopify", "category": "Commerce", "trust": "verified", "scopes": ["analytics.read"], "capabilities": ["catalog", "orders", "conversion"]},
    {"slug": "wordpress", "name": "WordPress", "category": "Publishing", "trust": "reviewed", "scopes": ["files.read", "files.write"], "capabilities": ["publish", "seo", "content"]},
    {"slug": "cloudflare", "name": "Cloudflare", "category": "Infrastructure", "trust": "verified", "scopes": ["domains.manage", "tls.manage"], "capabilities": ["dns", "cdn", "tls", "security"]},
]

AI_PROVIDERS = [
    {"slug": "openai", "models": ["gpt-5", "gpt-5-mini"], "strengths": ["reasoning", "tools", "structured-output"]},
    {"slug": "anthropic", "models": ["claude-sonnet", "claude-haiku"], "strengths": ["long-context", "writing"]},
    {"slug": "google-ai", "models": ["gemini-pro", "gemini-flash"], "strengths": ["multimodal", "speed"]},
]


def _catalog(slug: str) -> dict:
    item = next((x for x in PLUGIN_CATALOG if x["slug"] == slug), None)
    if not item:
        raise HTTPException(status_code=404, detail="Plugin not found in verified catalog")
    return item


class InstallPluginIn(BaseModel):
    slug: str
    scopes: list[str] = []
    credential_id: Optional[str] = None

    @field_validator("scopes")
    @classmethod
    def known_scopes(cls, value):
        unknown = set(value) - SCOPES
        if unknown:
            raise ValueError(f"Unknown permission scopes: {', '.join(sorted(unknown))}")
        return sorted(set(value))


class PluginStateIn(BaseModel):
    enabled: bool


class SubmitPluginIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    manifest_url: str = Field(pattern=r"^https://")
    publisher: str = Field(min_length=2, max_length=100)
    requested_scopes: list[str] = []


class AIRoutePolicyIn(BaseModel):
    strategy: Literal["balanced", "quality", "cost", "latency", "privacy"] = "balanced"
    allowed_providers: list[str] = []
    fallback_enabled: bool = True
    data_region: Literal["global", "india", "eu", "us"] = "global"
    max_cost_usd: float = Field(default=1.0, ge=0.001, le=100)
    pii_mode: Literal["block", "redact", "allow"] = "redact"


class DomainSearchIn(BaseModel):
    query: str = Field(min_length=2, max_length=63)
    tlds: list[str] = ["com", "in", "ai", "io"]

    @field_validator("query")
    @classmethod
    def valid_label(cls, value):
        label = value.lower().strip()
        if not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label):
            raise ValueError("Use letters, numbers and internal hyphens only")
        return label


class DomainOrderIn(BaseModel):
    domain: str = Field(pattern=r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9-]{2,24})+$")
    years: int = Field(default=1, ge=1, le=10)
    registrant_contact_id: str
    auto_renew: bool = True


class TLSOrderIn(BaseModel):
    domain: str
    product: Literal["managed-dv", "wildcard-dv", "business-ov"] = "managed-dv"
    auto_renew: bool = True


@router.get("/overview")
async def overview(user: dict = Depends(require_role("owner", "admin"))):
    ws = user["workspace_id"]
    installed = await db.plugin_installations.count_documents({"workspace_id": ws, "status": {"$ne": "removed"}})
    domains = await db.domain_orders.count_documents({"workspace_id": ws})
    certificates = await db.tls_orders.count_documents({"workspace_id": ws})
    revenue = await db.revenue_ledger.aggregate([
        {"$match": {"workspace_id": ws, "status": "settled"}},
        {"$group": {"_id": None, "gross": {"$sum": "$gross_minor"}, "margin": {"$sum": "$margin_minor"}}},
    ]).to_list(1)
    totals = revenue[0] if revenue else {"gross": 0, "margin": 0}
    return {"plugins": installed, "domains": domains, "certificates": certificates, "currency": "INR", "gross_minor": totals.get("gross", 0), "margin_minor": totals.get("margin", 0)}


@router.get("/plugins/catalog")
async def plugin_catalog(user: dict = Depends(require_role("owner", "admin"))):
    rows = await db.plugin_installations.find({"workspace_id": user["workspace_id"], "status": {"$ne": "removed"}}).to_list(200)
    states = {row["slug"]: clean(row) for row in rows}
    return [{**item, "installation": states.get(item["slug"])} for item in PLUGIN_CATALOG]


@router.post("/plugins/install", status_code=201)
async def install_plugin(body: InstallPluginIn, user: dict = Depends(require_role("owner", "admin"))):
    item = _catalog(body.slug)
    requested = body.scopes or item["scopes"]
    if not set(requested).issubset(set(item["scopes"])):
        raise HTTPException(status_code=400, detail="Requested permission exceeds catalog declaration")
    if body.credential_id and not await db.credentials.find_one({"id": body.credential_id, "workspace_id": user["workspace_id"]}):
        raise HTTPException(status_code=404, detail="Credential not found")
    doc = {"id": oid(), "workspace_id": user["workspace_id"], "slug": body.slug, "name": item["name"], "version": "1.0", "trust": item["trust"], "scopes": requested, "credential_id": body.credential_id, "enabled": False, "status": "installed_pending_verification", "installed_by": user["id"], "installed_at": now_iso(), "updated_at": now_iso()}
    await db.plugin_installations.update_one({"workspace_id": user["workspace_id"], "slug": body.slug}, {"$set": doc}, upsert=True)
    await audit(user["workspace_id"], user["name"], "plugin.installed", "plugin", {"slug": body.slug, "scopes": requested})
    return clean(doc)


@router.post("/plugins/{slug}/verify")
async def verify_plugin(slug: str, user: dict = Depends(require_role("owner", "admin"))):
    row = await db.plugin_installations.find_one({"workspace_id": user["workspace_id"], "slug": slug})
    if not row:
        raise HTTPException(status_code=404, detail="Plugin is not installed")
    # Static trust is not connection proof. A credential is required before a live adapter can be verified.
    status = "verified" if row.get("credential_id") else "configuration_required"
    await db.plugin_installations.update_one({"_id": row["_id"]}, {"$set": {"status": status, "enabled": status == "verified", "verified_at": now_iso() if status == "verified" else None, "updated_at": now_iso()}})
    await audit(user["workspace_id"], user["name"], "plugin.verification", "plugin", {"slug": slug, "status": status})
    return {"slug": slug, "status": status, "enabled": status == "verified"}


@router.put("/plugins/{slug}/state")
async def plugin_state(slug: str, body: PluginStateIn, user: dict = Depends(require_role("owner", "admin"))):
    query = {"workspace_id": user["workspace_id"], "slug": slug, "status": "verified"}
    result = await db.plugin_installations.update_one(query, {"$set": {"enabled": body.enabled, "updated_at": now_iso()}})
    if not result.matched_count:
        raise HTTPException(status_code=409, detail="Only verified plugins can be enabled")
    await audit(user["workspace_id"], user["name"], "plugin.state_changed", "plugin", {"slug": slug, "enabled": body.enabled})
    return {"slug": slug, "enabled": body.enabled}


@router.post("/plugins/submit", status_code=202)
async def submit_plugin(body: SubmitPluginIn, user: dict = Depends(require_role("owner", "admin"))):
    unknown = set(body.requested_scopes) - SCOPES
    if unknown:
        raise HTTPException(status_code=400, detail="Manifest requests unknown scopes")
    doc = {"id": oid(), "workspace_id": user["workspace_id"], **body.model_dump(), "status": "security_review", "submitted_at": now_iso()}
    await db.plugin_submissions.insert_one(doc)
    return clean(doc)


@router.get("/ai/providers")
async def ai_providers(user: dict = Depends(require_role("owner", "admin"))):
    installed = await db.plugin_installations.find({"workspace_id": user["workspace_id"], "slug": {"$in": [x["slug"] for x in AI_PROVIDERS]}}).to_list(20)
    states = {x["slug"]: clean(x) for x in installed}
    return [{**provider, "installation": states.get(provider["slug"])} for provider in AI_PROVIDERS]


@router.get("/ai/policy")
async def get_ai_policy(user: dict = Depends(require_role("owner", "admin"))):
    row = await db.ai_route_policies.find_one({"workspace_id": user["workspace_id"]})
    return clean(row) if row else AIRoutePolicyIn().model_dump()


@router.put("/ai/policy")
async def save_ai_policy(body: AIRoutePolicyIn, user: dict = Depends(require_role("owner", "admin"))):
    known = {x["slug"] for x in AI_PROVIDERS}
    if set(body.allowed_providers) - known:
        raise HTTPException(status_code=400, detail="Unknown AI provider")
    doc = {"workspace_id": user["workspace_id"], **body.model_dump(), "updated_by": user["id"], "updated_at": now_iso()}
    await db.ai_route_policies.update_one({"workspace_id": user["workspace_id"]}, {"$set": doc}, upsert=True)
    await audit(user["workspace_id"], user["name"], "ai.policy_updated", "ai_policy", body.model_dump())
    return clean(doc)


@router.post("/domains/search", status_code=202)
async def domain_search(body: DomainSearchIn, user: dict = Depends(require_role("owner", "admin"))):
    # Availability and prices must come from a connected registrar; these are search candidates only.
    candidates = [f"{body.query}.{tld.lower().lstrip('.')}" for tld in body.tlds[:12] if re.fullmatch(r"[a-z]{2,24}", tld.lower().lstrip('.'))]
    return {"status": "provider_connection_required", "candidates": candidates, "authoritative": False}


@router.post("/domains/orders", status_code=202)
async def domain_order(body: DomainOrderIn, user: dict = Depends(require_role("owner", "admin"))):
    doc = {"id": oid(), "workspace_id": user["workspace_id"], **body.model_dump(), "status": "pending_registrar_quote", "currency": "INR", "provider_reference": None, "created_at": now_iso()}
    await db.domain_orders.insert_one(doc)
    await audit(user["workspace_id"], user["name"], "domain.order_requested", "domain", {"domain": body.domain, "years": body.years})
    return clean(doc)


@router.get("/domains/orders")
async def domain_orders(user: dict = Depends(require_role("owner", "admin"))):
    return [clean(x) for x in await db.domain_orders.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(200)]


@router.post("/tls/orders", status_code=202)
async def tls_order(body: TLSOrderIn, user: dict = Depends(require_role("owner", "admin"))):
    doc = {"id": oid(), "workspace_id": user["workspace_id"], **body.model_dump(), "status": "pending_domain_validation", "issuer": None, "certificate_material_stored": False, "created_at": now_iso()}
    await db.tls_orders.insert_one(doc)
    await audit(user["workspace_id"], user["name"], "tls.order_requested", "certificate", {"domain": body.domain, "product": body.product})
    return clean(doc)


@router.get("/tls/orders")
async def tls_orders(user: dict = Depends(require_role("owner", "admin"))):
    return [clean(x) for x in await db.tls_orders.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(200)]


@router.get("/revenue/model")
async def revenue_model(user: dict = Depends(require_role("owner", "admin"))):
    return {
        "currency": "INR",
        "streams": [
            {"id": "subscriptions", "model": "recurring", "unit": "workspace/month"},
            {"id": "ai_usage", "model": "metered", "unit": "coins/action"},
            {"id": "plugin_addons", "model": "recurring", "unit": "plugin/workspace"},
            {"id": "domain_commission", "model": "reseller_margin", "unit": "registration/renewal"},
            {"id": "managed_tls", "model": "service_fee", "unit": "certificate/year"},
            {"id": "message_markup", "model": "usage_markup", "unit": "delivered provider event"},
            {"id": "agency_seats", "model": "recurring", "unit": "client workspace"},
        ],
        "controls": ["idempotent ledger", "provider-cost reconciliation", "tax invoice hooks", "refund entries", "multi-currency display", "no revenue before settlement"],
    }

"""Production-oriented HTTP E2E tests.

CI starts MongoDB and the Cloud Run production entrypoint before this suite.
Simulation is enabled only in CI so no external provider credentials are needed.
"""
import os
import uuid

import requests

BASE_URL = os.environ.get("TEST_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"


def headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def register_workspace(prefix: str = "e2e") -> dict:
    suffix = uuid.uuid4().hex[:10]
    response = requests.post(
        f"{API}/auth/register",
        json={
            "name": f"{prefix.upper()} Owner",
            "email": f"{prefix}-{suffix}@example.com",
            "password": "SecureTest123!",
            "workspace_name": f"{prefix.upper()} Workspace {suffix}",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_health_and_version():
    health = requests.get(f"{API}/health", timeout=10)
    assert health.status_code == 200, health.text
    assert health.json()["status"] == "ok"
    assert health.json()["database"] == "ok"

    version = requests.get(f"{API}/version", timeout=10)
    assert version.status_code == 200
    assert version.json()["service"]


def test_pricing_free_coins_and_exhaustion():
    pricing = requests.get(f"{API}/billing/pricing", timeout=10)
    assert pricing.status_code == 200, pricing.text
    catalog = pricing.json()
    assert catalog["free"]["coins"] == 100
    assert catalog["monthly"]["price"] == 1999
    assert catalog["annual"]["price"] == 19990
    assert catalog["annual"]["save"] == 3998

    owner = register_workspace("pricing")
    token = owner["token"]
    assert owner["user"]["plan"] == "Free"
    assert owner["user"]["coin_balance"] == 100

    wallet = requests.get(f"{API}/billing/wallet", headers=headers(token), timeout=10)
    assert wallet.status_code == 200, wallet.text
    assert wallet.json()["coin_balance"] == 100
    assert wallet.json()["coin_period"] == "lifetime"

    # AI posters cost 10 coins. CI has no OpenAI key, so the endpoint returns
    # metadata without an image but still exercises the premium AI workflow.
    for index in range(10):
        poster = requests.post(
            f"{API}/ai/poster",
            headers=headers(token),
            json={"brief": f"E2E pricing poster {index}", "tone": "Professional", "aspect": "1:1"},
            timeout=20,
        )
        assert poster.status_code == 200, poster.text

    wallet = requests.get(f"{API}/billing/wallet", headers=headers(token), timeout=10)
    assert wallet.json()["coin_balance"] == 0

    blocked = requests.post(
        f"{API}/ai/generate",
        headers=headers(token),
        json={"kind": "template", "prompt": "This must be blocked", "tone": "Persuasive", "channel": "WhatsApp"},
        timeout=10,
    )
    assert blocked.status_code == 402, blocked.text
    detail = blocked.json()["detail"]
    assert detail["code"] == "coins_exhausted"
    assert detail["pricing_url"] == "/pricing"

    intent = requests.post(
        f"{API}/billing/upgrade-intent",
        headers=headers(token),
        json={"interval": "year"},
        timeout=10,
    )
    assert intent.status_code == 202, intent.text
    assert intent.json()["status"] == "pending_checkout"
    assert intent.json()["checkout_ready"] is False


def test_workspace_lead_consent_campaign_and_isolation():
    owner = register_workspace("campaign")
    token = owner["token"]

    lead_response = requests.post(
        f"{API}/leads",
        headers=headers(token),
        json={
            "name": "E2E Buyer",
            "company": "Example Infra",
            "email": f"buyer-{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+919876543210",
            "channel": "WhatsApp",
            "source": "E2E",
            "notes": "Interested in a quotation",
        },
        timeout=20,
    )
    assert lead_response.status_code == 200, lead_response.text
    lead = lead_response.json()
    assert "phone_enc" not in lead
    assert "phone_hash" not in lead
    assert "•" in lead.get("phone_masked", "")

    consent = requests.post(
        f"{API}/consent/check",
        headers=headers(token),
        json={"lead_id": lead["id"], "channel": "WhatsApp"},
        timeout=20,
    )
    assert consent.status_code == 200, consent.text
    assert consent.json()["allow"] is True

    campaign = requests.post(
        f"{API}/studio/campaigns",
        headers=headers(token),
        json={
            "name": "E2E Campaign",
            "objective": "Qualification",
            "channel": "WhatsApp",
            "segment": "All Leads",
            "message": "Hi {{first_name}}, are you interested?",
            "followup": {"enabled": True, "time_unit": "days", "steps": [{"day": 2, "message": "Following up."}]},
        },
        timeout=20,
    )
    assert campaign.status_code == 200, campaign.text
    campaign_id = campaign.json()["id"]

    preview = requests.post(
        f"{API}/studio/campaigns/{campaign_id}/preview",
        headers=headers(token),
        timeout=20,
    )
    assert preview.status_code == 200, preview.text
    assert preview.json()["allowed"] >= 1

    approval = requests.post(
        f"{API}/studio/campaigns/{campaign_id}/approve",
        headers=headers(token),
        timeout=20,
    )
    assert approval.status_code == 200, approval.text
    assert approval.json()["status"] == "approved"

    send = requests.post(
        f"{API}/studio/campaigns/{campaign_id}/send",
        headers=headers(token),
        timeout=30,
    )
    assert send.status_code == 200, send.text
    payload = send.json()
    assert payload["status"] == "sent"
    assert payload["blocked"] == 0
    assert payload["failed"] == 0
    assert payload["delivered"] >= 1

    followups = requests.get(f"{API}/autopilot", headers=headers(token), timeout=20)
    assert followups.status_code == 200, followups.text
    assert len(followups.json()) >= 1

    second = register_workspace("isolation")
    forbidden = requests.get(
        f"{API}/leads/{lead['id']}",
        headers=headers(second["token"]),
        timeout=20,
    )
    assert forbidden.status_code == 404


def test_opt_out_stops_future_sends():
    owner = register_workspace("consent")
    token = owner["token"]
    lead_response = requests.post(
        f"{API}/leads",
        headers=headers(token),
        json={
            "name": "Consent Lead",
            "email": f"consent-{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+919811112222",
            "channel": "WhatsApp",
        },
        timeout=20,
    )
    assert lead_response.status_code == 200, lead_response.text
    lead_id = lead_response.json()["id"]

    opt_out = requests.post(
        f"{API}/consent/leads/{lead_id}/opt-out",
        headers=headers(token),
        json={"reason": "e2e-test", "channel": "WhatsApp"},
        timeout=20,
    )
    assert opt_out.status_code == 200, opt_out.text

    check = requests.post(
        f"{API}/consent/check",
        headers=headers(token),
        json={"lead_id": lead_id, "channel": "WhatsApp"},
        timeout=20,
    )
    assert check.status_code == 200
    assert check.json()["allow"] is False
    assert check.json()["code"] == "opted_out"


def test_developer_api_key_scope_and_usage():
    owner = register_workspace("developer")
    token = owner["token"]

    key_response = requests.post(
        f"{API}/dev/keys",
        headers=headers(token),
        json={"name": "CI integration", "scopes": ["leads:read", "leads:write"], "rate_limit": 30},
        timeout=20,
    )
    assert key_response.status_code == 200, key_response.text
    api_key = key_response.json()["key"]
    assert api_key.startswith("gde_live_")

    create = requests.post(
        f"{API}/v1/leads",
        headers={"X-API-Key": api_key},
        json={
            "name": "API Lead",
            "email": f"api-{uuid.uuid4().hex[:8]}@example.com",
            "phone": "+919899998888",
            "consent_status": "pending",
        },
        timeout=20,
    )
    assert create.status_code == 200, create.text

    listing = requests.get(f"{API}/v1/leads", headers={"X-API-Key": api_key}, timeout=20)
    assert listing.status_code == 200, listing.text
    assert any(item["id"] == create.json()["id"] for item in listing.json())

    missing_scope = requests.post(
        f"{API}/v1/campaigns",
        headers={"X-API-Key": api_key},
        json={"name": "Should fail", "message": "No scope"},
        timeout=20,
    )
    assert missing_scope.status_code == 403

    usage = requests.get(f"{API}/dev/usage", headers=headers(token), timeout=20)
    assert usage.status_code == 200
    assert len(usage.json()) >= 2


def test_scheduler_requires_credential():
    response = requests.post(f"{API}/autopilot/internal/run", timeout=20)
    assert response.status_code == 401

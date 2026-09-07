"""Security/RBAC HTTP checks against the production entrypoint."""
import os
import uuid

import requests

BASE_URL = os.environ.get("TEST_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def register(prefix="security"):
    suffix = uuid.uuid4().hex[:10]
    payload = {
        "name": "Security Owner",
        "email": f"{prefix}-{suffix}@example.com",
        "password": "SecureTest123!",
        "workspace_name": f"Security {suffix}",
    }
    response = requests.post(f"{API}/auth/register", json=payload, timeout=20)
    assert response.status_code == 200, response.text
    return response.json(), payload


def test_vault_never_returns_plaintext_and_saas_overview_is_real():
    owner, _ = register("vault")
    token = owner["token"]
    secret_value = "sk-test-never-return-this-value-1234"

    created = requests.post(
        f"{API}/vault",
        headers=auth(token),
        json={
            "provider": "OpenAI",
            "label": "Security test",
            "fields": {"API Key": secret_value, "Model": "test-model"},
        },
        timeout=20,
    )
    assert created.status_code == 200, created.text

    listing = requests.get(f"{API}/vault", headers=auth(token), timeout=20)
    assert listing.status_code == 200, listing.text
    raw_body = listing.text
    assert secret_value not in raw_body
    item = next(row for row in listing.json() if row["id"] == created.json()["id"])
    assert item["fields"]["API Key"].startswith("••••")
    assert item["fields"]["API Key"].endswith("1234")

    overview = requests.get(f"{API}/saas/overview", headers=auth(token), timeout=20)
    assert overview.status_code == 200, overview.text
    data = overview.json()
    assert data["workspace"]["plan"] in {"Free", "Pro"}
    assert data["workspace"]["plan"] == "Free"
    assert data["wallet"]["coin_balance"] == 100
    assert data["wallet"]["coin_period"] == "lifetime"
    assert isinstance(data["usage"]["team_members"], int)
    assert data["providers"]["scheduler"]["configured"] is True


def test_admin_cannot_escalate_roles():
    owner, _ = register("rbac")
    owner_token = owner["token"]
    admin_email = f"admin-{uuid.uuid4().hex[:8]}@example.com"
    admin_password = "AdminSecure123!"

    invite = requests.post(
        f"{API}/team",
        headers=auth(owner_token),
        json={
            "name": "Workspace Admin",
            "email": admin_email,
            "password": admin_password,
            "role": "admin",
        },
        timeout=20,
    )
    assert invite.status_code == 200, invite.text
    assert invite.json()["role"] == "admin"

    login = requests.post(
        f"{API}/auth/login",
        json={"email": admin_email, "password": admin_password},
        timeout=20,
    )
    assert login.status_code == 200, login.text
    admin_token = login.json()["token"]

    escalate_owner = requests.post(
        f"{API}/team",
        headers=auth(admin_token),
        json={
            "name": "Illegal Owner",
            "email": f"owner-{uuid.uuid4().hex[:8]}@example.com",
            "password": "AnotherSecure123!",
            "role": "owner",
        },
        timeout=20,
    )
    assert escalate_owner.status_code == 403

    escalate_admin = requests.post(
        f"{API}/team",
        headers=auth(admin_token),
        json={
            "name": "Illegal Admin",
            "email": f"admin2-{uuid.uuid4().hex[:8]}@example.com",
            "password": "AnotherSecure123!",
            "role": "admin",
        },
        timeout=20,
    )
    assert escalate_admin.status_code == 403

    agent = requests.post(
        f"{API}/team",
        headers=auth(admin_token),
        json={
            "name": "Allowed Agent",
            "email": f"agent-{uuid.uuid4().hex[:8]}@example.com",
            "password": "AgentSecure123!",
            "role": "agent",
        },
        timeout=20,
    )
    assert agent.status_code == 200, agent.text
    assert agent.json()["role"] == "agent"


def test_legacy_campaign_create_no_longer_fakes_a_send():
    owner, _ = register("legacy-campaign")
    response = requests.post(
        f"{API}/campaigns",
        headers=auth(owner["token"]),
        json={
            "name": "Legacy compatibility",
            "channel": "WhatsApp",
            "segment": "All Leads",
            "message": "Draft only",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["status"] == "draft"
    assert data["stats"]["sent"] == 0
    assert data["stats"]["delivered"] == 0

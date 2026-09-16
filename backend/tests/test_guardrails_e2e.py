import os
import uuid

import requests

BASE_URL = os.environ.get("TEST_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def register_owner(prefix: str) -> dict:
    suffix = uuid.uuid4().hex[:10]
    response = requests.post(
        f"{API}/auth/register",
        json={
            "name": "Guardrail Owner",
            "email": f"{prefix}-{suffix}@example.com",
            "password": "SecureTest123!",
            "workspace_name": f"Guardrail {suffix}",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_agent_cannot_approve_consent_or_opted_in_import():
    owner = register_owner("guardrail")
    owner_token = owner["token"]
    suffix = uuid.uuid4().hex[:10]
    agent_email = f"agent-{suffix}@example.com"
    agent_password = "AgentSecure123!"

    invited = requests.post(
        f"{API}/team",
        headers=auth(owner_token),
        json={"name": "Guardrail Agent", "email": agent_email, "password": agent_password, "role": "agent"},
        timeout=20,
    )
    assert invited.status_code == 200, invited.text

    login = requests.post(
        f"{API}/auth/login",
        json={"email": agent_email, "password": agent_password},
        timeout=20,
    )
    assert login.status_code == 200, login.text
    agent_token = login.json()["token"]

    lead = requests.post(
        f"{API}/leads",
        headers=auth(owner_token),
        json={
            "name": "Consent Approval Test",
            "email": f"lead-{suffix}@example.com",
            "phone": "+919700001234",
            "channel": "WhatsApp",
        },
        timeout=20,
    )
    assert lead.status_code == 200, lead.text

    forbidden = requests.post(
        f"{API}/consent/leads/{lead.json()['id']}",
        headers=auth(agent_token),
        json={"status": "opted_in", "source": "manual", "channels": ["WhatsApp"]},
        timeout=20,
    )
    assert forbidden.status_code == 403, forbidden.text

    # Agents can still honor a customer's opt-out immediately.
    opt_out = requests.post(
        f"{API}/consent/leads/{lead.json()['id']}",
        headers=auth(agent_token),
        json={"status": "opted_out", "source": "customer_request", "channels": ["WhatsApp"]},
        timeout=20,
    )
    assert opt_out.status_code == 200, opt_out.text

    csv_bytes = b"Name,Contact Number (+91)\nImported Buyer,9876543210\n"
    preview = requests.post(
        f"{API}/contact-imports/preview",
        headers=auth(agent_token),
        files={"file": ("guardrail.csv", csv_bytes, "text/csv")},
        data={"country_code": "+91"},
        timeout=20,
    )
    assert preview.status_code == 200, preview.text
    preview_id = preview.json()["id"]

    forbidden_commit = requests.post(
        f"{API}/contact-imports/{preview_id}/commit",
        headers=auth(agent_token),
        json={
            "consent_status": "opted_in",
            "consent_source": "documented_e2e_opt_in",
            "confirm_opt_in": True,
        },
        timeout=20,
    )
    assert forbidden_commit.status_code == 403, forbidden_commit.text

    owner_commit = requests.post(
        f"{API}/contact-imports/{preview_id}/commit",
        headers=auth(owner_token),
        json={
            "consent_status": "opted_in",
            "consent_source": "documented_e2e_opt_in",
            "confirm_opt_in": True,
        },
        timeout=20,
    )
    assert owner_commit.status_code == 200, owner_commit.text
    assert owner_commit.json()["imported"] == 1
    assert owner_commit.json()["consent_status"] == "opted_in"

    duplicate_commit = requests.post(
        f"{API}/contact-imports/{preview_id}/commit",
        headers=auth(owner_token),
        json={"consent_status": "pending"},
        timeout=20,
    )
    assert duplicate_commit.status_code == 409, duplicate_commit.text

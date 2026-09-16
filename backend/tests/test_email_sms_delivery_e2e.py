import os
import uuid

import requests

BASE_URL = os.environ.get("TEST_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def register_owner() -> dict:
    suffix = uuid.uuid4().hex[:10]
    response = requests.post(
        f"{API}/auth/register",
        json={
            "name": "Delivery Owner",
            "email": f"delivery-{suffix}@example.com",
            "password": "SecureTest123!",
            "workspace_name": f"Delivery {suffix}",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()


def create_lead(token: str) -> dict:
    suffix = uuid.uuid4().hex[:8]
    response = requests.post(
        f"{API}/leads",
        headers=auth(token),
        json={
            "name": "Provider Test Buyer",
            "company": "Provider Test Co",
            "email": f"buyer-{suffix}@example.com",
            "phone": "+919700099999",
            "channel": "Email",
            "source": "E2E",
            "notes": "Explicit test contact",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()


def consent(token: str, lead_id: str) -> None:
    response = requests.post(
        f"{API}/consent/leads/{lead_id}",
        headers=auth(token),
        json={
            "status": "opted_in",
            "source": "e2e_explicit_opt_in",
            "channels": ["Email", "SMS"],
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text


def create_and_send(token: str, channel: str) -> dict:
    created = requests.post(
        f"{API}/studio/campaigns",
        headers=auth(token),
        json={
            "name": f"{channel} Provider E2E",
            "objective": "Verify provider dispatcher",
            "channel": channel,
            "segment": "All Leads",
            "message": "Hello {{first_name}}, GOLD-e AI provider test.",
        },
        timeout=20,
    )
    assert created.status_code == 200, created.text
    campaign = created.json()
    assert campaign["stats"]["audience"] == 1

    approved = requests.post(
        f"{API}/studio/campaigns/{campaign['id']}/approve",
        headers=auth(token),
        timeout=20,
    )
    assert approved.status_code == 200, approved.text

    sent = requests.post(
        f"{API}/studio/campaigns/{campaign['id']}/send",
        headers=auth(token),
        timeout=30,
    )
    assert sent.status_code == 200, sent.text
    return sent.json()


def test_email_and_sms_use_multichannel_dispatcher_in_e2e_simulation():
    owner = register_owner()
    token = owner["token"]
    lead = create_lead(token)
    consent(token, lead["id"])

    email = create_and_send(token, "Email")
    assert email["audience"] == 1
    assert email["sent"] == 1
    assert email["delivered"] == 1
    assert email["failed"] == 0

    sms = create_and_send(token, "SMS")
    assert sms["audience"] == 1
    assert sms["sent"] == 1
    assert sms["delivered"] == 1
    assert sms["failed"] == 0

    logs = requests.get(f"{API}/whatsapp/messages?limit=20", headers=auth(token), timeout=20)
    assert logs.status_code == 200, logs.text
    channels = {row.get("channel") for row in logs.json() if row.get("direction") == "outbound"}
    assert "Email" in channels
    assert "SMS" in channels

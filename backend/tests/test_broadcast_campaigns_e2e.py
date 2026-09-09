import os
import uuid

import requests

BASE_URL = os.environ.get("TEST_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def register(prefix: str) -> dict:
    suffix = uuid.uuid4().hex[:10]
    response = requests.post(
        f"{API}/auth/register",
        json={
            "name": "Audience Owner",
            "email": f"{prefix}-{suffix}@example.com",
            "password": "SecureTest123!",
            "workspace_name": f"Audience {suffix}",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()


def add_lead(token: str, name: str, phone: str) -> dict:
    response = requests.post(
        f"{API}/leads",
        headers=auth(token),
        json={
            "name": name,
            "company": "Audience Test Co",
            "email": f"{uuid.uuid4().hex[:8]}@example.com",
            "phone": phone,
            "channel": "WhatsApp",
            "source": "E2E",
            "notes": "Qualified audience test lead",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_saved_audience_targets_exact_contacts_and_deduplicates():
    owner = register("audience-campaign")
    token = owner["token"]
    lead_a = add_lead(token, "Audience One", "+919700010001")
    add_lead(token, "Audience Two", "+919700010002")

    first = requests.post(
        f"{API}/audiences",
        headers=auth(token),
        json={"name": "Priority Buyers", "kind": "static", "lead_ids": [lead_a["id"]]},
        timeout=20,
    )
    assert first.status_code == 200, first.text
    first_audience = first.json()
    assert first_audience["member_count"] == 1

    overlapping = requests.post(
        f"{API}/audiences",
        headers=auth(token),
        json={"name": "Overlapping Buyers", "kind": "static", "lead_ids": [lead_a["id"]]},
        timeout=20,
    )
    assert overlapping.status_code == 200, overlapping.text

    campaign = requests.post(
        f"{API}/studio/campaigns",
        headers=auth(token),
        json={
            "name": "Saved Audience Campaign",
            "objective": "Audience targeting",
            "channel": "WhatsApp",
            "segment": "All Leads",
            "audience_ids": [first_audience["id"], overlapping.json()["id"], first_audience["id"]],
            "message": "Hi {{first_name}}, saved audience test.",
        },
        timeout=20,
    )
    assert campaign.status_code == 200, campaign.text
    body = campaign.json()
    assert body["stats"]["audience"] == 1
    assert len(body["audience_ids"]) == 2

    preview = requests.post(
        f"{API}/studio/campaigns/{body['id']}/preview",
        headers=auth(token),
        timeout=20,
    )
    assert preview.status_code == 200, preview.text
    assert preview.json()["audience"] == 1
    assert preview.json()["allowed"] == 1

    approval = requests.post(
        f"{API}/studio/campaigns/{body['id']}/approve",
        headers=auth(token),
        timeout=20,
    )
    assert approval.status_code == 200, approval.text
    assert approval.json()["status"] == "approved"

    sent = requests.post(
        f"{API}/studio/campaigns/{body['id']}/send",
        headers=auth(token),
        timeout=30,
    )
    assert sent.status_code == 200, sent.text
    assert sent.json()["audience"] == 1
    assert sent.json()["sent"] == 1


def test_campaign_rejects_foreign_or_unknown_audience():
    owner = register("audience-owner")
    other = register("audience-other")
    owner_token = owner["token"]
    other_token = other["token"]
    lead = add_lead(owner_token, "Private Audience Lead", "+919700010003")

    audience = requests.post(
        f"{API}/audiences",
        headers=auth(owner_token),
        json={"name": "Private Audience", "kind": "static", "lead_ids": [lead["id"]]},
        timeout=20,
    )
    assert audience.status_code == 200, audience.text

    forbidden = requests.post(
        f"{API}/studio/campaigns",
        headers=auth(other_token),
        json={
            "name": "Cross Workspace Attempt",
            "channel": "WhatsApp",
            "audience_ids": [audience.json()["id"]],
            "message": "Must fail",
        },
        timeout=20,
    )
    assert forbidden.status_code == 400, forbidden.text

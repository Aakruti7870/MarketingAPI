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
            "name": "Social Owner",
            "email": f"{prefix}-{suffix}@example.com",
            "password": "SecureTest123!",
            "workspace_name": f"Social {suffix}",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()


def simulate_inbound(token: str, channel: str) -> str:
    response = requests.post(
        f"{API}/webhooks/meta/social/simulate",
        headers=auth(token),
        json={
            "channel": channel,
            "sender_id": f"{channel}-sender-{uuid.uuid4().hex[:10]}",
            "text": f"Hello from {channel}",
            "name": f"{channel.title()} Buyer",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()["lead_id"]


def approve_consent(token: str, lead_id: str, channel: str) -> None:
    response = requests.post(
        f"{API}/consent/leads/{lead_id}",
        headers=auth(token),
        json={
            "status": "opted_in",
            "source": "e2e_explicit_social_opt_in",
            "channels": [channel.title()],
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text


def run_channel(channel: str) -> None:
    owner = register_owner(f"social-{channel}")
    token = owner["token"]
    lead_id = simulate_inbound(token, channel)

    leads = requests.get(f"{API}/leads", headers=auth(token), timeout=20)
    assert leads.status_code == 200, leads.text
    lead = next(row for row in leads.json() if row["id"] == lead_id)
    assert lead["channel"].lower() == channel

    approve_consent(token, lead_id, channel)

    conversations = requests.get(f"{API}/conversations", headers=auth(token), timeout=20)
    assert conversations.status_code == 200, conversations.text
    conversation = next(row for row in conversations.json() if row["lead_id"] == lead_id)

    reply = requests.post(
        f"{API}/conversations/{conversation['id']}/reply",
        headers=auth(token),
        json={"body": f"Thanks for messaging us on {channel}."},
        timeout=20,
    )
    assert reply.status_code == 200, reply.text
    assert "Thanks for messaging us" in reply.json()["body"]

    campaign = requests.post(
        f"{API}/studio/campaigns",
        headers=auth(token),
        json={
            "name": f"{channel.title()} E2E",
            "objective": "Social provider test",
            "channel": channel.title(),
            "segment": "All Leads",
            "message": "Hi {{first_name}}, social campaign test.",
        },
        timeout=20,
    )
    assert campaign.status_code == 200, campaign.text
    body = campaign.json()
    assert body["stats"]["audience"] == 1

    approved = requests.post(
        f"{API}/studio/campaigns/{body['id']}/approve",
        headers=auth(token),
        timeout=20,
    )
    assert approved.status_code == 200, approved.text

    sent = requests.post(
        f"{API}/studio/campaigns/{body['id']}/send",
        headers=auth(token),
        timeout=20,
    )
    assert sent.status_code == 200, sent.text
    assert sent.json()["sent"] == 1
    assert sent.json()["delivered"] == 1
    assert sent.json()["failed"] == 0


def test_instagram_inbound_reply_and_campaign_delivery():
    run_channel("instagram")


def test_facebook_inbound_reply_and_campaign_delivery():
    run_channel("facebook")


def test_social_webhook_verification_uses_meta_verify_token():
    response = requests.get(
        f"{API}/webhooks/meta/social",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "e2e-meta-verify",
            "hub.challenge": "social-challenge-123",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    assert response.text == "social-challenge-123"

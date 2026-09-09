import base64
import hashlib
import hmac
import json
import os
import time
import uuid

import requests

BASE_URL = os.environ.get("TEST_BACKEND_URL", "http://127.0.0.1:8000").rstrip("/")
API = f"{BASE_URL}/api"
CASHFREE_SECRET = "e2e-cashfree-secret"


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def register_owner(prefix: str = "cashfree") -> dict:
    suffix = uuid.uuid4().hex[:10]
    response = requests.post(
        f"{API}/auth/register",
        json={
            "name": "Billing Owner",
            "email": f"{prefix}-{suffix}@example.com",
            "password": "SecureTest123!",
            "workspace_name": f"Billing {suffix}",
        },
        timeout=20,
    )
    assert response.status_code == 200, response.text
    return response.json()


def sign(raw: bytes, timestamp: str) -> str:
    digest = hmac.new(CASHFREE_SECRET.encode(), timestamp.encode() + raw, hashlib.sha256).digest()
    return base64.b64encode(digest).decode()


def test_cashfree_success_webhook_activates_pro_exactly_once():
    owner = register_owner()
    token = owner["token"]

    checkout = requests.post(
        f"{API}/billing/cashfree/checkout",
        headers=auth(token),
        json={"interval": "month", "customer_phone": "+919876543210"},
        timeout=20,
    )
    assert checkout.status_code == 200, checkout.text
    order = checkout.json()
    assert order["checkout_ready"] is True
    assert order["amount"] == 1999
    assert order["mode"] == "sandbox"
    assert order["payment_session_id"].startswith("session_sim_")

    payload = {
        "data": {
            "order": {
                "order_id": order["cashfree_order_id"],
                "order_amount": 1999,
                "order_currency": "INR",
            },
            "payment": {
                "cf_payment_id": "cfpay-e2e-1",
                "payment_status": "SUCCESS",
                "payment_amount": 1999,
                "payment_currency": "INR",
            },
        },
        "event_time": "2026-09-09T02:00:00+00:00",
        "type": "PAYMENT_SUCCESS_WEBHOOK",
    }
    raw = json.dumps(payload, separators=(",", ":")).encode()
    timestamp = str(int(time.time() * 1000))
    headers = {
        "Content-Type": "application/json",
        "x-webhook-timestamp": timestamp,
        "x-webhook-signature": sign(raw, timestamp),
        "x-idempotency-key": "cashfree-e2e-success-1",
    }
    first = requests.post(f"{API}/billing/cashfree/webhook", headers=headers, data=raw, timeout=20)
    assert first.status_code == 200, first.text
    second = requests.post(f"{API}/billing/cashfree/webhook", headers=headers, data=raw, timeout=20)
    assert second.status_code == 200, second.text

    wallet = requests.get(f"{API}/billing/wallet", headers=auth(token), timeout=20)
    assert wallet.status_code == 200, wallet.text
    body = wallet.json()
    assert body["plan"] == "Pro"
    assert body["subscription_status"] == "active"
    assert body["billing_interval"] == "month"
    assert body["coin_balance"] == 2000

    orders = requests.get(f"{API}/billing/cashfree/orders", headers=auth(token), timeout=20)
    assert orders.status_code == 200, orders.text
    matching = next(row for row in orders.json() if row["id"] == order["id"])
    assert matching["status"] == "paid"

    ledger = requests.get(f"{API}/billing/ledger", headers=auth(token), timeout=20)
    assert ledger.status_code == 200, ledger.text
    grants = [row for row in ledger.json() if row.get("action") == "pro_activation"]
    assert len(grants) == 1


def test_cashfree_rejects_bad_signature_and_wrong_amount():
    owner = register_owner("cashfree-safety")
    token = owner["token"]
    checkout = requests.post(
        f"{API}/billing/cashfree/checkout",
        headers=auth(token),
        json={"interval": "year", "customer_phone": "919876543211"},
        timeout=20,
    )
    assert checkout.status_code == 200, checkout.text
    order = checkout.json()

    payload = {
        "data": {
            "order": {
                "order_id": order["cashfree_order_id"],
                "order_amount": 1,
                "order_currency": "INR",
            },
            "payment": {
                "cf_payment_id": "cfpay-e2e-wrong",
                "payment_status": "SUCCESS",
                "payment_amount": 1,
                "payment_currency": "INR",
            },
        },
        "type": "PAYMENT_SUCCESS_WEBHOOK",
    }
    raw = json.dumps(payload, separators=(",", ":")).encode()
    timestamp = str(int(time.time() * 1000))

    bad_signature = requests.post(
        f"{API}/billing/cashfree/webhook",
        headers={
            "Content-Type": "application/json",
            "x-webhook-timestamp": timestamp,
            "x-webhook-signature": "invalid",
        },
        data=raw,
        timeout=20,
    )
    assert bad_signature.status_code == 401, bad_signature.text

    wrong_amount = requests.post(
        f"{API}/billing/cashfree/webhook",
        headers={
            "Content-Type": "application/json",
            "x-webhook-timestamp": timestamp,
            "x-webhook-signature": sign(raw, timestamp),
            "x-idempotency-key": "cashfree-e2e-wrong-amount",
        },
        data=raw,
        timeout=20,
    )
    assert wrong_amount.status_code == 400, wrong_amount.text

    wallet = requests.get(f"{API}/billing/wallet", headers=auth(token), timeout=20)
    assert wallet.status_code == 200, wallet.text
    assert wallet.json()["plan"] == "Free"


def test_server_side_order_verification_can_activate_simulated_paid_order():
    owner = register_owner("cashfree-verify")
    token = owner["token"]
    checkout = requests.post(
        f"{API}/billing/cashfree/checkout",
        headers=auth(token),
        json={"interval": "year", "customer_phone": "919876543212"},
        timeout=20,
    )
    assert checkout.status_code == 200, checkout.text
    order = checkout.json()

    verified = requests.post(
        f"{API}/billing/cashfree/orders/{order['id']}/verify",
        headers=auth(token),
        timeout=20,
    )
    assert verified.status_code == 200, verified.text
    assert verified.json()["status"] == "paid"

    wallet = requests.get(f"{API}/billing/wallet", headers=auth(token), timeout=20)
    assert wallet.status_code == 200, wallet.text
    assert wallet.json()["plan"] == "Pro"
    assert wallet.json()["billing_interval"] == "year"

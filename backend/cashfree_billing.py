"""Cashfree Payment Gateway billing for GOLD-e AI Pro plans.

Secrets are read only from the runtime environment / Secret Manager. Browser
returns never activate a subscription: activation requires either a verified
Cashfree webhook or a server-to-server Get Order verification.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field

from core import audit, db, get_current_user, now_iso, oid, require_role

router = APIRouter(prefix="/cashfree", tags=["cashfree-billing"])

API_VERSION = os.environ.get("CASHFREE_API_VERSION", "2025-01-01")
PUBLIC_ORIGIN = os.environ.get("PUBLIC_ORIGIN", "https://gold-etechapp.com").rstrip("/")


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


SIMULATION_ENABLED = _env_bool("ENABLE_SIMULATION", False)


def _environment() -> str:
    configured = os.environ.get("CASHFREE_ENV", "").strip().lower()
    if configured in {"sandbox", "production"}:
        return configured
    return "production" if os.environ.get("APP_ENV", "production") == "production" else "sandbox"


def _base_url() -> str:
    return "https://api.cashfree.com/pg" if _environment() == "production" else "https://sandbox.cashfree.com/pg"


def _credentials() -> tuple[str, str]:
    return (
        os.environ.get("CASHFREE_CLIENT_ID", "").strip(),
        os.environ.get("CASHFREE_CLIENT_SECRET", "").strip(),
    )


def _headers(idempotency_key: str | None = None) -> dict[str, str]:
    client_id, secret = _credentials()
    if not client_id or not secret:
        raise HTTPException(status_code=503, detail={
            "code": "cashfree_not_configured",
            "message": "Cashfree production credentials are not configured",
        })
    headers = {
        "Content-Type": "application/json",
        "x-client-id": client_id,
        "x-client-secret": secret,
        "x-api-version": API_VERSION,
        "x-request-id": str(uuid.uuid4()),
    }
    if idempotency_key:
        headers["x-idempotency-key"] = idempotency_key
    return headers


def _price(interval: str) -> int:
    if interval == "month":
        return 1999
    if interval == "year":
        return 19990
    raise HTTPException(status_code=400, detail="Choose monthly or annual billing")


def _period_key() -> str:
    current = datetime.now(timezone.utc)
    return f"{current.year:04d}-{current.month:02d}"


def _period_end(interval: str) -> str:
    current = datetime.now(timezone.utc)
    if interval == "year":
        try:
            end = current.replace(year=current.year + 1)
        except ValueError:
            end = current.replace(year=current.year + 1, day=28)
    else:
        year = current.year + (1 if current.month == 12 else 0)
        month = 1 if current.month == 12 else current.month + 1
        days = [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        end = current.replace(year=year, month=month, day=min(current.day, days[month - 1]))
    return end.isoformat()


def _public_order(row: dict) -> dict:
    return {
        "id": row.get("id"),
        "cashfree_order_id": row.get("cashfree_order_id"),
        "interval": row.get("interval"),
        "amount": row.get("amount"),
        "currency": row.get("currency", "INR"),
        "status": row.get("status"),
        "provider_status": row.get("provider_status"),
        "payment_session_id": row.get("payment_session_id"),
        "mode": row.get("mode"),
        "created_at": row.get("created_at"),
        "paid_at": row.get("paid_at"),
    }


class CheckoutIn(BaseModel):
    interval: str
    customer_phone: str = Field(min_length=8, max_length=20)


async def _create_provider_order(local: dict, user: dict, customer_phone: str) -> dict:
    if SIMULATION_ENABLED:
        return {
            "order_id": local["cashfree_order_id"],
            "cf_order_id": f"cf_sim_{local['id']}",
            "payment_session_id": f"session_sim_{local['id']}",
            "order_status": "ACTIVE",
        }

    payload = {
        "order_id": local["cashfree_order_id"],
        "order_amount": local["amount"],
        "order_currency": "INR",
        "customer_details": {
            "customer_id": f"golde_{user['workspace_id']}_{user['id']}"[:50],
            "customer_name": user.get("name", ""),
            "customer_email": user.get("email", ""),
            "customer_phone": customer_phone,
        },
        "order_meta": {
            "return_url": f"{PUBLIC_ORIGIN}/pricing?cashfree_order_id={local['cashfree_order_id']}",
            "notify_url": f"{PUBLIC_ORIGIN}/api/billing/cashfree/webhook",
        },
        "order_note": f"GOLD-e AI Pro {local['interval']}",
        "order_tags": {
            "workspace_id": user["workspace_id"],
            "billing_order_id": local["id"],
            "plan": "Pro",
            "interval": local["interval"],
        },
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{_base_url()}/orders",
            headers=_headers(local["idempotency_key"]),
            json=payload,
        )
        if response.status_code >= 400:
            print(f"Cashfree create order failed: HTTP {response.status_code}")
            raise HTTPException(status_code=502, detail={
                "code": "cashfree_create_order_failed",
                "message": "Cashfree did not create the payment order",
            })
        return response.json()


@router.post("/checkout")
async def create_checkout(body: CheckoutIn, user: dict = Depends(require_role("owner", "admin"))):
    amount = _price(body.interval)
    local_id = oid()
    cashfree_order_id = f"golde_{local_id}"
    doc = {
        "id": local_id,
        "workspace_id": user["workspace_id"],
        "requested_by": user.get("id"),
        "plan": "Pro",
        "interval": body.interval,
        "amount": amount,
        "currency": "INR",
        "cashfree_order_id": cashfree_order_id,
        "idempotency_key": str(uuid.uuid4()),
        "status": "creating",
        "mode": "simulation" if SIMULATION_ENABLED else _environment(),
        "created_at": now_iso(),
    }
    await db.billing_orders.insert_one(dict(doc))
    try:
        provider = await _create_provider_order(doc, user, body.customer_phone.strip())
    except Exception:
        await db.billing_orders.update_one(
            {"id": local_id, "workspace_id": user["workspace_id"]},
            {"$set": {"status": "provider_failed", "updated_at": now_iso()}},
        )
        raise

    session_id = provider.get("payment_session_id")
    if not session_id:
        await db.billing_orders.update_one(
            {"id": local_id},
            {"$set": {"status": "provider_failed", "provider_status": provider.get("order_status"), "updated_at": now_iso()}},
        )
        raise HTTPException(status_code=502, detail={
            "code": "cashfree_missing_payment_session",
            "message": "Cashfree order did not return a payment session",
        })

    await db.billing_orders.update_one(
        {"id": local_id},
        {"$set": {
            "status": "pending_payment",
            "provider_status": provider.get("order_status", "ACTIVE"),
            "cf_order_id": str(provider.get("cf_order_id") or ""),
            "payment_session_id": session_id,
            "updated_at": now_iso(),
        }},
    )
    await audit(user["workspace_id"], user.get("name", "user"), "billing.checkout_created", "billing_order", {
        "billing_order_id": local_id,
        "cashfree_order_id": cashfree_order_id,
        "interval": body.interval,
        "amount": amount,
    })
    return {
        "id": local_id,
        "cashfree_order_id": cashfree_order_id,
        "payment_session_id": session_id,
        "amount": amount,
        "currency": "INR",
        "interval": body.interval,
        "mode": "sandbox" if SIMULATION_ENABLED else _environment(),
        "checkout_ready": True,
    }


async def _activate_paid_order(order: dict, payment: dict, provider_status: str = "PAID") -> bool:
    payment_id = str(payment.get("cf_payment_id") or payment.get("payment_id") or "")
    result = await db.billing_orders.update_one(
        {
            "id": order["id"],
            "workspace_id": order["workspace_id"],
            "status": {"$ne": "paid"},
        },
        {"$set": {
            "status": "paid",
            "provider_status": provider_status,
            "cf_payment_id": payment_id,
            "paid_at": now_iso(),
            "updated_at": now_iso(),
        }},
    )
    if result.modified_count != 1:
        return False

    await db.workspaces.update_one(
        {"id": order["workspace_id"]},
        {"$set": {
            "plan": "Pro",
            "billing_interval": order["interval"],
            "subscription_status": "active",
            "subscription_started_at": now_iso(),
            "subscription_current_period_end": _period_end(order["interval"]),
            "coin_balance": 2000,
            "coin_period": _period_key(),
            "coins_refreshed_at": now_iso(),
            "last_payment_id": payment_id,
            "last_billing_order_id": order["id"],
        }},
    )
    await db.coin_ledger.insert_one({
        "id": oid(),
        "workspace_id": order["workspace_id"],
        "direction": "credit",
        "coins": 2000,
        "action": "pro_activation",
        "actor": "cashfree",
        "balance_after": 2000,
        "created_at": now_iso(),
    })
    await audit(order["workspace_id"], "cashfree", "billing.pro_activated", "billing_order", {
        "billing_order_id": order["id"],
        "cashfree_order_id": order["cashfree_order_id"],
        "payment_id": payment_id,
        "interval": order["interval"],
    })
    return True


def _verify_signature(raw: bytes, timestamp: str, signature: str) -> bool:
    _, secret = _credentials()
    if not secret or not timestamp or not signature:
        return False
    signed = timestamp.encode() + raw
    generated = base64.b64encode(hmac.new(secret.encode(), signed, hashlib.sha256).digest()).decode()
    return hmac.compare_digest(generated, signature)


def _fresh_timestamp(timestamp: str) -> bool:
    try:
        ts = int(timestamp)
    except (TypeError, ValueError):
        return False
    if ts > 10_000_000_000:
        ts = ts / 1000
    return abs(time.time() - ts) <= 300


@router.post("/webhook")
async def cashfree_webhook(request: Request):
    raw = await request.body()
    timestamp = request.headers.get("x-webhook-timestamp", "")
    signature = request.headers.get("x-webhook-signature", "")
    if not _fresh_timestamp(timestamp) or not _verify_signature(raw, timestamp, signature):
        raise HTTPException(status_code=401, detail="Invalid Cashfree webhook signature")
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid Cashfree webhook payload")

    data = payload.get("data") or {}
    provider_order = data.get("order") or {}
    payment = data.get("payment") or {}
    order_id = str(provider_order.get("order_id") or "")
    event_type = str(payload.get("type") or "")
    payment_id = str(payment.get("cf_payment_id") or "")
    if not order_id:
        return Response("ignored", status_code=200)

    local = await db.billing_orders.find_one({"cashfree_order_id": order_id})
    if not local:
        return Response("ignored", status_code=200)

    event_key = request.headers.get("x-idempotency-key") or f"{event_type}:{order_id}:{payment_id}"
    try:
        await db.billing_webhook_events.insert_one({
            "id": oid(),
            "event_key": event_key,
            "workspace_id": local["workspace_id"],
            "billing_order_id": local["id"],
            "event_type": event_type,
            "created_at": now_iso(),
        })
    except Exception as exc:
        if "duplicate" in str(exc).lower() or "E11000" in str(exc):
            return Response("ok", status_code=200)
        raise

    amount = float(provider_order.get("order_amount") or 0)
    currency = str(provider_order.get("order_currency") or "")
    if round(amount, 2) != round(float(local["amount"]), 2) or currency != "INR":
        await db.billing_orders.update_one({"id": local["id"]}, {"$set": {"status": "amount_mismatch", "updated_at": now_iso()}})
        raise HTTPException(status_code=400, detail="Cashfree order amount/currency mismatch")

    status = str(payment.get("payment_status") or "").upper()
    if event_type == "PAYMENT_SUCCESS_WEBHOOK" and status == "SUCCESS":
        await _activate_paid_order(local, payment)
    elif status in {"FAILED", "USER_DROPPED"}:
        await db.billing_orders.update_one(
            {"id": local["id"], "status": {"$ne": "paid"}},
            {"$set": {"status": status.lower(), "provider_status": status, "updated_at": now_iso()}},
        )
    return Response("ok", status_code=200)


async def _get_provider_order(order_id: str) -> dict:
    if SIMULATION_ENABLED:
        return {"order_id": order_id, "order_status": "PAID"}
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{_base_url()}/orders/{order_id}", headers=_headers())
        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail={
                "code": "cashfree_order_verification_failed",
                "message": "Could not verify Cashfree order status",
            })
        return response.json()


@router.post("/orders/{billing_order_id}/verify")
async def verify_order(billing_order_id: str, user: dict = Depends(require_role("owner", "admin"))):
    order = await db.billing_orders.find_one({"id": billing_order_id, "workspace_id": user["workspace_id"]})
    if not order:
        raise HTTPException(status_code=404, detail="Billing order not found")
    provider = await _get_provider_order(order["cashfree_order_id"])
    provider_status = str(provider.get("order_status") or "").upper()
    if provider_status == "PAID":
        await _activate_paid_order(order, {"cf_payment_id": provider.get("cf_order_id") or "verified-order"}, provider_status="PAID")
    else:
        await db.billing_orders.update_one(
            {"id": order["id"], "status": {"$ne": "paid"}},
            {"$set": {"provider_status": provider_status, "updated_at": now_iso()}},
        )
    fresh = await db.billing_orders.find_one({"id": order["id"], "workspace_id": user["workspace_id"]})
    return _public_order(fresh)


@router.get("/orders")
async def list_orders(user: dict = Depends(get_current_user)):
    rows = await db.billing_orders.find({"workspace_id": user["workspace_id"]}).sort("created_at", -1).to_list(100)
    return [_public_order(row) for row in rows]


@router.get("/readiness")
async def readiness(user: dict = Depends(get_current_user)):
    client_id, secret = _credentials()
    return {
        "provider": "Cashfree",
        "configured": bool(client_id and secret),
        "environment": "simulation" if SIMULATION_ENABLED else _environment(),
        "api_version": API_VERSION,
    }

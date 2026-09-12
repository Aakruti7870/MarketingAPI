import pytest
from fastapi.testclient import TestClient
from backend.production import app

client = TestClient(app)

def test_full_revenue_engine_e2e():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

    bal_res = client.get("/api/billing/balance/user_default")
    assert bal_res.status_code == 200

    scrape = client.post("/api/leads-discovery/scrape?query=Contractors&location=Navi+Mumbai")
    assert scrape.status_code == 200
    assert len(scrape.json()["leads"]) > 0

    neg_accept = client.post("/api/negotiation/process-offer", json={
        "session": {"customer_phone": "+919820011223", "product_id": "RMC", "quantity": 50, "offered_price": 180000},
        "rule": {"base_price": 3800, "min_floor_price": 3300, "max_discount_percent": 12.0}
    })
    assert neg_accept.status_code == 200
    assert neg_accept.json()["accepted"] is True

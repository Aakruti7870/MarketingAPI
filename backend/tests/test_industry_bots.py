import requests

API = "http://localhost:8000/api"


def test_industry_bots_catalog():
    response = requests.get(f"{API}/industry-bots", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 5
    ids = {bot["id"] for bot in data["bots"]}
    assert {"healthcare", "infrastructure", "b2b", "small-business", "social-growth"} <= ids


def test_industry_bot_actions_are_validated():
    for bot_id, action in [
        ("healthcare", "book_appointment"),
        ("infrastructure", "generate_quotation"),
        ("b2b", "create_enquiry"),
        ("small-business", "create_order"),
        ("social-growth", "create_campaign"),
    ]:
        response = requests.post(
            f"{API}/industry-bots/{bot_id}/action",
            json={"action": action, "payload": {"e2e": True}},
            timeout=10,
        )
        assert response.status_code == 200, response.text
        assert response.json()["status"] == "ready"

    response = requests.post(
        f"{API}/industry-bots/healthcare/action",
        json={"action": "create_ad"},
        timeout=10,
    )
    assert response.status_code == 422

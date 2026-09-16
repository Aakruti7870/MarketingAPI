import requests

API = "http://localhost:8000/api"


def test_agentic_platform_catalog():
    response = requests.get(f"{API}/agentic-platform/catalog", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert data["model"] == "one_platform_multi_business"
    assert data["paid_access"]["required_plan"] == "Pro"
    assert {item["id"] for item in data["industries"]} >= {
        "healthcare",
        "infrastructure",
        "b2b",
        "small-business",
        "social-growth",
    }


def test_agentic_platform_requires_authentication():
    response = requests.get(f"{API}/agentic-platform/workspace", timeout=10)
    assert response.status_code == 401

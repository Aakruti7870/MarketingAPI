"""GOLD-e backend end-to-end API tests.

Covers: auth (register/login/me), tenant isolation, phone masking privacy,
leads CRUD + AI score + rescore + CSV import + dedup, pipeline stage move,
templates, campaigns (stats), inbox (list/get/reply/suggest/summarize),
automations (list/toggle/create), quotations (create + ai-draft + lead stage),
team RBAC (agent forbidden), API vault (encrypted + masked), AI command,
AI marketing studio, dashboard KPIs.
"""
import io
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://56fce744-0cbe-4b00-99eb-b483f4dc2ea2.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

DEMO = {"email": "demo@gold-e.ai", "password": "demo1234"}
AGENT = {"email": "priya@gold-e.ai", "password": "agent1234"}


# ---------------------------------------------------------------- fixtures
@pytest.fixture(scope="session")
def demo_token():
    r = requests.post(f"{API}/auth/login", json=DEMO, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def agent_token():
    r = requests.post(f"{API}/auth/login", json=AGENT, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def new_ws():
    """Register a brand new workspace for tenant-isolation checks."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "TEST Owner", "email": email, "password": "pw123456",
        "workspace_name": "TEST Workspace " + uuid.uuid4().hex[:6],
    }, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    return {"token": d["token"], "user": d["user"], "email": email}


def H(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------------------------------------------------------------- auth
class TestAuth:
    def test_health(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_login_demo(self, demo_token):
        assert isinstance(demo_token, str) and len(demo_token) > 20

    def test_login_bad(self):
        r = requests.post(f"{API}/auth/login", json={"email": "demo@gold-e.ai", "password": "wrong"})
        assert r.status_code == 401

    def test_me(self, demo_token):
        r = requests.get(f"{API}/auth/me", headers=H(demo_token))
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == "demo@gold-e.ai"
        assert d["role"] == "owner"
        assert d.get("workspace_name")

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_register_creates_isolated_ws(self, new_ws):
        assert new_ws["user"]["role"] == "owner"
        # dashboard for new ws must be empty
        r = requests.get(f"{API}/dashboard", headers=H(new_ws["token"]))
        assert r.status_code == 200
        assert r.json()["kpis"]["total_leads"] == 0

    def test_register_duplicate_email(self, new_ws):
        r = requests.post(f"{API}/auth/register", json={
            "name": "x", "email": new_ws["email"], "password": "pw123456", "workspace_name": "y"})
        assert r.status_code == 400


# ---------------------------------------------------------------- dashboard
class TestDashboard:
    def test_dashboard_seeded(self, demo_token):
        r = requests.get(f"{API}/dashboard", headers=H(demo_token))
        assert r.status_code == 200
        d = r.json()
        assert d["kpis"]["total_leads"] >= 8
        assert isinstance(d["funnel"], list) and len(d["funnel"]) == 7
        assert len(d["trend"]) == 7
        assert len(d["temperature_split"]) == 3


# ---------------------------------------------------------------- leads + privacy
class TestLeads:
    def test_list_seeded(self, demo_token):
        r = requests.get(f"{API}/leads", headers=H(demo_token))
        assert r.status_code == 200
        leads = r.json()
        assert len(leads) >= 8
        for l in leads:
            # raw phone MUST NOT be present
            assert "phone" not in l or l.get("phone") in (None, "")
            assert "phone_enc" not in l
            assert "phone_hash" not in l
            if l.get("phone_masked"):
                # masked value should contain bullets
                assert "•" in l["phone_masked"]
            assert l["temperature"] in ("HOT", "WARM", "COLD")
            assert 1 <= l["score"] <= 99

    def test_filter_hot(self, demo_token):
        r = requests.get(f"{API}/leads?temperature=HOT", headers=H(demo_token))
        assert r.status_code == 200
        for l in r.json():
            assert l["temperature"] == "HOT"

    def test_search(self, demo_token):
        r = requests.get(f"{API}/leads?q=Vikram", headers=H(demo_token))
        assert r.status_code == 200
        assert any("Vikram" in l["name"] or "Vikram" in l.get("company", "") for l in r.json())

    def test_create_lead_and_get(self, demo_token):
        payload = {"name": "TEST Lead A", "company": "TEST Co",
                   "email": f"testa_{uuid.uuid4().hex[:6]}@example.com",
                   "phone": "+919999888877", "source": "Website Form",
                   "notes": "urgent buy asap"}
        r = requests.post(f"{API}/leads", headers=H(demo_token), json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["score"] >= 1 and d["temperature"] in ("HOT", "WARM", "COLD")
        assert "phone" not in d
        assert "•" in d["phone_masked"]
        lid = d["id"]
        g = requests.get(f"{API}/leads/{lid}", headers=H(demo_token))
        assert g.status_code == 200
        assert g.json()["name"] == "TEST Lead A"

    def test_create_lead_duplicate_email(self, demo_token):
        email = f"dup_{uuid.uuid4().hex[:6]}@example.com"
        p = {"name": "T1", "email": email}
        r1 = requests.post(f"{API}/leads", headers=H(demo_token), json=p)
        assert r1.status_code == 200
        r2 = requests.post(f"{API}/leads", headers=H(demo_token), json=p)
        assert r2.status_code == 400

    def test_rescore(self, demo_token):
        leads = requests.get(f"{API}/leads", headers=H(demo_token)).json()
        lid = leads[0]["id"]
        r = requests.post(f"{API}/leads/{lid}/rescore", headers=H(demo_token))
        assert r.status_code == 200
        d = r.json()
        assert 1 <= d["score"] <= 99
        assert d["temperature"] in ("HOT", "WARM", "COLD")

    def test_csv_import_and_dedup(self, demo_token):
        uniq = uuid.uuid4().hex[:6]
        csv_bytes = (
            f"name,email,phone,company,source,notes\n"
            f"TEST CSV One,csv1_{uniq}@ex.com,+911111100001,CsvCo,Website Form,urgent\n"
            f"TEST CSV Two,csv2_{uniq}@ex.com,+911111100002,CsvCo,Manual,\n"
            f"TEST CSV One Dup,csv1_{uniq}@ex.com,+911111100003,CsvCo,Manual,\n"
        ).encode()
        files = {"file": ("leads.csv", io.BytesIO(csv_bytes), "text/csv")}
        r = requests.post(f"{API}/leads/import", headers=H(demo_token), files=files)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["imported"] == 2
        assert d["skipped"] == 1


# ---------------------------------------------------------------- pipeline
class TestPipeline:
    def test_pipeline_board(self, demo_token):
        r = requests.get(f"{API}/pipeline", headers=H(demo_token))
        assert r.status_code == 200
        d = r.json()
        assert "board" in d and "stages" in d
        assert "NEW" in d["board"]

    def test_move_stage(self, demo_token):
        leads = requests.get(f"{API}/leads", headers=H(demo_token)).json()
        lid = leads[0]["id"]
        r = requests.patch(f"{API}/leads/{lid}/stage", headers=H(demo_token), json={"stage": "QUALIFIED"})
        assert r.status_code == 200
        assert r.json()["stage"] == "QUALIFIED"

    def test_move_stage_invalid(self, demo_token):
        leads = requests.get(f"{API}/leads", headers=H(demo_token)).json()
        lid = leads[0]["id"]
        r = requests.patch(f"{API}/leads/{lid}/stage", headers=H(demo_token), json={"stage": "BOGUS"})
        assert r.status_code == 400


# ---------------------------------------------------------------- inbox
class TestInbox:
    def test_conversations(self, demo_token):
        r = requests.get(f"{API}/conversations", headers=H(demo_token))
        assert r.status_code == 200
        convs = r.json()
        assert len(convs) >= 1
        cid = convs[0]["id"]

        g = requests.get(f"{API}/conversations/{cid}", headers=H(demo_token))
        assert g.status_code == 200
        assert isinstance(g.json().get("messages"), list)

        rep = requests.post(f"{API}/conversations/{cid}/reply", headers=H(demo_token), json={"body": "Test reply"})
        assert rep.status_code == 200
        assert rep.json()["body"] == "Test reply"

        sug = requests.post(f"{API}/conversations/{cid}/suggest", headers=H(demo_token))
        assert sug.status_code == 200
        assert sug.json().get("suggestion")

        summ = requests.post(f"{API}/conversations/{cid}/summarize", headers=H(demo_token))
        assert summ.status_code == 200
        assert summ.json().get("summary")


# ---------------------------------------------------------------- templates
class TestTemplates:
    def test_list_and_create(self, demo_token):
        r = requests.get(f"{API}/templates", headers=H(demo_token))
        assert r.status_code == 200
        assert len(r.json()) >= 4
        c = requests.post(f"{API}/templates", headers=H(demo_token), json={
            "name": "TEST tmpl", "channel": "WhatsApp", "body": "Hi {{name}}"})
        assert c.status_code == 200
        assert c.json()["name"] == "TEST tmpl"

    def test_ai_generate(self, demo_token):
        r = requests.post(f"{API}/ai/generate", headers=H(demo_token),
                          json={"kind": "template", "prompt": "Diwali offer", "tone": "Festive"})
        assert r.status_code == 200
        assert len(r.json().get("text", "")) > 5


# ---------------------------------------------------------------- campaigns
class TestCampaigns:
    def test_list(self, demo_token):
        r = requests.get(f"{API}/campaigns", headers=H(demo_token))
        assert r.status_code == 200
        assert len(r.json()) >= 2

    def test_create_computes_stats(self, demo_token):
        r = requests.post(f"{API}/campaigns", headers=H(demo_token),
                          json={"name": "TEST camp", "channel": "WhatsApp", "segment": "HOT"})
        assert r.status_code == 200
        d = r.json()
        assert "stats" in d and "audience" in d["stats"]
        assert d["stats"]["audience"] >= 0


# ---------------------------------------------------------------- automations
class TestAutomations:
    def test_list_toggle_create(self, demo_token):
        r = requests.get(f"{API}/automations", headers=H(demo_token))
        assert r.status_code == 200
        autos = r.json()
        assert len(autos) >= 3
        aid = autos[0]["id"]
        before = autos[0].get("enabled", True)
        t = requests.patch(f"{API}/automations/{aid}/toggle", headers=H(demo_token))
        assert t.status_code == 200
        assert t.json()["enabled"] != before

        c = requests.post(f"{API}/automations", headers=H(demo_token),
                          json={"name": "TEST auto", "trigger": "Lead Created", "action": "Send template"})
        assert c.status_code == 200


# ---------------------------------------------------------------- AI marketing/command
class TestAIStudio:
    def test_marketing(self, demo_token):
        r = requests.post(f"{API}/ai/marketing", headers=H(demo_token),
                          json={"prompt": "Premium concrete", "tone": "Luxury"})
        assert r.status_code == 200
        d = r.json()
        for k in ("headline", "caption", "cta", "hashtags", "image"):
            assert k in d, f"missing {k}"

    def test_command_hot_pune(self, demo_token):
        r = requests.post(f"{API}/ai/command", headers=H(demo_token),
                          json={"command": "Show Pune hot leads"})
        assert r.status_code == 200
        d = r.json()
        assert d["action"] == "navigate:/leads?temperature=HOT"
        assert isinstance(d.get("data"), list)

    def test_command_other(self, demo_token):
        r = requests.post(f"{API}/ai/command", headers=H(demo_token),
                          json={"command": "Open campaigns"})
        assert r.status_code == 200
        assert (r.json().get("action") or "").startswith("navigate:")


# ---------------------------------------------------------------- quotations
class TestQuotations:
    def test_ai_draft_and_create(self, demo_token):
        # draft
        r = requests.post(f"{API}/quotations/ai-draft", headers=H(demo_token),
                          json={"prompt": "50 m3 M25 concrete"})
        assert r.status_code == 200
        assert isinstance(r.json().get("items"), list) and len(r.json()["items"]) >= 1

        # pick a lead
        leads = requests.get(f"{API}/leads", headers=H(demo_token)).json()
        lid = leads[-1]["id"]
        c = requests.post(f"{API}/quotations", headers=H(demo_token), json={
            "lead_id": lid,
            "items": [{"name": "M25", "qty": 10, "price": 2500}, {"name": "Setup", "qty": 1, "price": 500}],
        })
        assert c.status_code == 200
        d = c.json()
        assert d["total"] == 10 * 2500 + 500

        # lead stage should be QUOTATION
        g = requests.get(f"{API}/leads/{lid}", headers=H(demo_token))
        assert g.json()["stage"] == "QUOTATION"


# ---------------------------------------------------------------- team RBAC
class TestTeam:
    def test_list(self, demo_token):
        r = requests.get(f"{API}/team", headers=H(demo_token))
        assert r.status_code == 200
        assert len(r.json()) >= 2

    def test_owner_can_add(self, demo_token):
        email = f"tm_{uuid.uuid4().hex[:6]}@example.com"
        r = requests.post(f"{API}/team", headers=H(demo_token), json={
            "name": "TEST Member", "email": email, "password": "pw123456", "role": "agent"})
        assert r.status_code == 200

    def test_agent_cannot_add(self, agent_token):
        r = requests.post(f"{API}/team", headers=H(agent_token), json={
            "name": "Nope", "email": f"nope_{uuid.uuid4().hex[:6]}@example.com",
            "password": "pw123456", "role": "agent"})
        assert r.status_code == 403


# ---------------------------------------------------------------- vault
class TestVault:
    def test_add_list_delete_masked(self, demo_token):
        add = requests.post(f"{API}/vault", headers=H(demo_token), json={
            "provider": "TEST Prov", "label": "TEST Cred",
            "fields": {"API Key": "sk-supersecret-1234567890", "Model": "gpt-x"}})
        assert add.status_code == 200
        cid = add.json()["id"]
        lst = requests.get(f"{API}/vault", headers=H(demo_token))
        assert lst.status_code == 200
        entry = next((c for c in lst.json() if c["id"] == cid), None)
        assert entry
        for v in entry["fields"].values():
            assert "•" in v  # masked
            assert "supersecret" not in v
        d = requests.delete(f"{API}/vault/{cid}", headers=H(demo_token))
        assert d.status_code == 200

    def test_agent_cannot_add_vault(self, agent_token):
        r = requests.post(f"{API}/vault", headers=H(agent_token), json={
            "provider": "x", "label": "y", "fields": {"k": "v"}})
        assert r.status_code == 403


# ---------------------------------------------------------------- tenant isolation
class TestTenantIsolation:
    def test_new_ws_sees_no_demo_data(self, new_ws):
        r = requests.get(f"{API}/leads", headers=H(new_ws["token"]))
        assert r.status_code == 200
        assert r.json() == []
        r2 = requests.get(f"{API}/conversations", headers=H(new_ws["token"]))
        assert r2.status_code == 200
        assert r2.json() == []
        r3 = requests.get(f"{API}/campaigns", headers=H(new_ws["token"]))
        assert r3.json() == []

    def test_new_ws_cannot_read_demo_lead(self, demo_token, new_ws):
        leads = requests.get(f"{API}/leads", headers=H(demo_token)).json()
        lid = leads[0]["id"]
        r = requests.get(f"{API}/leads/{lid}", headers=H(new_ws["token"]))
        assert r.status_code == 404

# MarketingAPI / GOLD-e

Multi-tenant marketing, lead-management, messaging, automation and AI SaaS platform.

## Production architecture

```text
Custom domain -> Firebase Hosting -> /api/** -> Google Cloud Run -> MongoDB / providers
```

- **Frontend:** React 18, React Router, Tailwind CSS, Recharts
- **Backend:** FastAPI, Uvicorn, Motor/PyMongo, JWT, bcrypt, Fernet
- **Hosting:** Firebase Hosting
- **Backend compute:** Google Cloud Run (`asia-south1`)
- **Automation:** Google Cloud Scheduler + idempotent database claims
- **Secrets:** Google Secret Manager + encrypted per-workspace credential vault
- **AI:** OpenAI Responses API + Images API
- **Messaging:** Meta WhatsApp Cloud API with signed webhook verification

## Core SaaS capabilities

- Multi-tenant workspaces and role-based access
- Lead engine and sales pipeline
- Unified inbox
- Campaign Studio with approval workflow
- Consent Guard and opt-out enforcement
- WhatsApp Cloud API connection and webhook processing
- Follow-up Autopilot
- AI message/campaign generation
- AI marketing poster generation
- Quotations
- Analytics
- Developer API with scoped keys
- Distributed API rate limiting
- Secure credential vault
- Workspace plan, usage and provider-readiness dashboard
- Audit logging

## Production safety

The production entrypoint deliberately disables prototype behavior:

- no demo-user/data seeding;
- no fake provider success;
- no WhatsApp simulation;
- no in-process production scheduler;
- no plaintext credential metadata;
- no fabricated AI spend/system-health UI values.

Campaign and follow-up execution uses atomic database state transitions so repeated scheduler calls or multiple Cloud Run instances do not intentionally send the same claimed job twice.

## Repository layout

```text
MarketingAPI/
├── frontend/                 React application deployed to Firebase Hosting
├── backend/                  FastAPI application deployed to Cloud Run
│   ├── production.py         Cloud Run production entrypoint
│   ├── server.py             Core/legacy application routes
│   ├── core.py               Shared auth, DB, encryption and OpenAI client
│   ├── consent.py            Consent Guard
│   ├── whatsapp.py           WhatsApp send/webhook pipeline
│   ├── studio.py             Campaign execution
│   ├── autopilot.py          Scheduled campaign/follow-up worker
│   ├── devapi.py             Developer API
│   ├── secure_vault.py       Encrypted-only credential storage
│   ├── saas.py               Plan/usage/provider status
│   └── tests/test_e2e.py     Production-oriented HTTP E2E suite
├── firebase.json             Firebase -> Cloud Run rewrite config
├── cloudbuild.yaml           End-to-end Google Cloud deployment pipeline
├── Dockerfile                Backend-only Cloud Run image
├── docker-compose.yml        Local frontend/backend/Mongo stack
└── DEPLOYMENT.md             Launch checklist
```

## Local development

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Health: `http://localhost:8000/api/health`

Local Docker Compose enables simulation so external provider credentials are not required for development. Production simulation is disabled.

## Production deployment

Prerequisites:

1. Google Cloud project with Firebase Hosting enabled.
2. MongoDB deployment reachable from Cloud Run.
3. Required values stored in Google Secret Manager.
4. Cloud Build IAM permissions.

Deploy:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

Then add the final custom domain in Firebase Hosting and apply the DNS records Firebase provides.

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the complete setup and secret names.

## Required production secrets

- `MARKETINGAPI_MONGO_URL`
- `MARKETINGAPI_JWT_SECRET`
- `MARKETINGAPI_OPENAI_API_KEY`
- `MARKETINGAPI_META_WEBHOOK_VERIFY_TOKEN`
- `MARKETINGAPI_CRON_SECRET`

Never commit their values.

## CI

Pull requests must pass:

- frontend production build;
- backend compile/import;
- MongoDB-backed HTTP E2E suite;
- Docker image build;
- deployment configuration validation.

## Status

The repository is intended to be deployment-ready code, not a claim that external infrastructure is already provisioned. A successful CI run verifies the repository path; final production readiness also requires valid Google Cloud/Firebase IAM, Secret Manager values, MongoDB connectivity, provider credentials and domain DNS.

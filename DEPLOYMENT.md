# MarketingAPI Production Deployment

MarketingAPI is configured to deploy as a **single web service**. The React frontend is built inside the Docker image and served by FastAPI, while all backend routes remain under `/api`.

This avoids maintaining separate frontend and backend domains.

## Production architecture

```text
Custom domain
   |
   v
MarketingAPI Docker service
   |-- React SPA                  /
   |-- FastAPI                    /api/*
   |-- Health check               /api/health
   |
   +--> MongoDB                   MONGO_URL
```

## Required production input

Only one external runtime value is required by the Render Blueprint:

- `MONGO_URL` — a MongoDB connection string for a persistent MongoDB deployment.

The Blueprint automatically creates a stable `JWT_SECRET`. The production entrypoint derives a Fernet-compatible vault encryption key from that secret if `VAULT_KEY` is not explicitly provided.

**Do not rotate `JWT_SECRET` after storing encrypted credentials unless you have planned a vault-key migration.** Existing login tokens will also become invalid after a JWT secret rotation.

## Deploy on Render

1. Merge the production-readiness PR into `main`.
2. In Render, create a new **Blueprint** from `Aakruti7870/MarketingAPI`.
3. Render reads `render.yaml` and builds the root `Dockerfile`.
4. When prompted, enter `MONGO_URL`.
5. Start the deployment.
6. Confirm the health check returns HTTP 200 at `/api/health`.
7. Open the generated Render URL. The React frontend and FastAPI backend are served from the same origin.
8. Register the first real workspace/owner from the application. Production demo seeding is disabled.
9. Add the custom domain in Render and apply the DNS records Render provides.

No frontend API URL change is required when the frontend and backend use the same domain.

## Optional production environment variables

- `DB_NAME` — defaults to `marketingapi` in the Render Blueprint.
- `VAULT_KEY` — optional dedicated Fernet key. If omitted, production derives one from `JWT_SECRET`.
- `ALLOWED_ORIGINS` — optional comma-separated CORS origins for split-domain or external browser clients.
- `EMERGENT_LLM_KEY` — optional AI-provider key used by the existing AI integration.
- `SEED_DEMO_DATA` — must remain `false` in production unless a temporary demo environment is intentionally required.

Provider-specific credentials such as WhatsApp/Meta, email, AI, and webhook secrets should be added through the platform's credential workflow or secure deployment environment variables. Never commit them to Git.

## Local full-stack run

The repository also includes Docker Compose for local testing.

Create `.env` from `.env.example` and set a random `JWT_SECRET`, then run:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

MongoDB runs locally in the `mongo` container and persists data in the `marketingapi_mongo` Docker volume.

## Split local development

Backend:

```bash
cd backend
cp .env.example .env
# Fill MONGO_URL, JWT_SECRET and a valid VAULT_KEY.
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

Frontend:

```bash
cd frontend
cp .env.example .env
# For split local development set REACT_APP_BACKEND_URL=http://localhost:8000
npm install
npm start
```

## Production validation

GitHub Actions runs three readiness checks:

- React production build
- Python compile + production app import
- Full Docker image build

Do not merge deployment changes while any of these checks are failing.

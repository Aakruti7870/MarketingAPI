# MarketingAPI

**Independent marketing, messaging, lead-management and automation platform.**

MarketingAPI is a full-stack workspace for managing campaigns, leads, WhatsApp messaging, templates, automation, analytics, quotations, consent, team access, developer integrations and AI-assisted marketing workflows.

> Status: Active development. Review security, provider credentials, webhooks and deployment configuration before production use.

## Core Modules

- Dashboard and workspace overview
- Campaign management
- Lead management and sales pipeline
- WhatsApp messaging and inbox workflows
- Smart message templates
- Marketing poster/content generation
- AI Studio
- Automations / autopilot workflows
- Analytics and reporting
- Quotations
- Consent and privacy controls
- Team and role management
- Secure credential vault
- Developer/API tools

## Architecture

```text
MarketingAPI
├── frontend/                 React web application
│   ├── src/pages/            Dashboard, campaigns, leads, inbox, AI Studio, etc.
│   ├── src/components/       Shared UI components
│   ├── src/context/          Frontend state/context
│   └── src/api.js            Backend API client
│
├── backend/                  FastAPI application
│   ├── server.py             Main API application
│   ├── whatsapp.py           WhatsApp-related services
│   ├── analytics.py          Analytics services
│   ├── autopilot.py          Automation/autopilot logic
│   ├── consent.py            Consent/privacy workflows
│   ├── poster.py             Marketing creative/poster logic
│   ├── studio.py             AI Studio services
│   ├── devapi.py             Developer/API functionality
│   └── tests/                Backend tests
│
├── design_guidelines.json    Product UI/design guidance
├── memory/                   Project working context
└── test_reports/             Test/report artifacts
```

## Tech Stack

### Frontend

- React 18
- React Router
- Axios
- Tailwind CSS
- Recharts
- Lucide React
- Sonner

### Backend

- FastAPI
- Uvicorn
- MongoDB / Motor / PyMongo
- Pydantic
- JWT authentication
- bcrypt password hashing
- Fernet encryption
- HTTPX

## Local Development

### 1. Clone

```bash
git clone https://github.com/Aakruti7870/MarketingAPI.git
cd MarketingAPI
```

### 2. Backend

Create `backend/.env` locally. Do **not** commit secrets.

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=marketingapi
JWT_SECRET=replace-with-a-strong-secret
VAULT_KEY=replace-with-a-valid-fernet-key
EMERGENT_LLM_KEY=
```

Install and start:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload
```

On Windows PowerShell, activate the environment with:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Frontend

Create `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Install and start:

```bash
cd frontend
npm install
npm start
```

## Build & Test

Frontend production build:

```bash
cd frontend
npm run build
```

Frontend tests:

```bash
npm test
```

Backend tests should be run from the backend environment using the test suite in `backend/tests/`.

## API Convention

The backend exposes application routes under:

```text
/api
```

The React client reads the backend origin from `REACT_APP_BACKEND_URL` and attaches the stored bearer token to authenticated requests.

## Security Rules

- Never commit API keys, access tokens, webhook secrets or provider credentials.
- Keep `JWT_SECRET` strong and environment-specific.
- Keep `VAULT_KEY` private; changing it can affect encrypted stored credentials.
- Use HTTPS in production.
- Restrict CORS for production deployments instead of relying on permissive development configuration.
- Validate WhatsApp/Meta webhook signatures and provider callbacks before trusting inbound events.
- Keep consent, opt-in/opt-out and privacy controls enforced for all marketing messaging.
- Keep customer phone numbers and channel-member identities private unless explicit permission allows disclosure.

## Product Direction

The platform is designed to evolve into an independent multi-tenant marketing API/service where authorized users can connect their own communication-provider credentials and operate campaigns without exposing credentials or recipient identities to other users.

Planned/extendable channels include:

- WhatsApp Business / Meta APIs
- Instagram and social messaging
- Email
- SMS
- Additional approved messaging providers
- AI content and creative generation providers

## Repository

**Owner:** `Aakruti7870`  
**Repository:** `Aakruti7870/MarketingAPI`  
**Default branch:** `main`

---

Built as an independent marketing automation and communication platform.

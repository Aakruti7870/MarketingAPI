# MarketingAPI Production Deployment

## Target architecture

```text
Custom Domain
      |
      v
Firebase Hosting
  |         |
  | /*      | /api/**
  v         v
React SPA   Cloud Run: marketingapi
                |
                +--> MongoDB
                +--> OpenAI API
                +--> Meta WhatsApp Cloud API
                +--> Cloud Scheduler
                +--> Secret Manager
```

The custom domain terminates at Firebase Hosting. The browser uses relative `/api/...` URLs, and Firebase rewrites those requests to the `marketingapi` Cloud Run service in `asia-south1`.

Production simulation and demo seeding are disabled.

## 1. Google Cloud / Firebase project

Use one Google Cloud project that also has Firebase enabled. Do not commit `.firebaserc`; deployments explicitly use the active Google Cloud project ID.

Enable the required services:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  firebasehosting.googleapis.com
```

Initialize Firebase Hosting for the project if Hosting has not been enabled before.

## 2. Required Secret Manager secrets

The Cloud Build pipeline expects these secrets to exist:

- `MARKETINGAPI_MONGO_URL`
- `MARKETINGAPI_JWT_SECRET`
- `MARKETINGAPI_OPENAI_API_KEY`
- `MARKETINGAPI_META_WEBHOOK_VERIFY_TOKEN`
- `MARKETINGAPI_CRON_SECRET`

Create them without putting values in shell history where possible. Example pattern:

```bash
printf '%s' 'YOUR_VALUE' | gcloud secrets create MARKETINGAPI_JWT_SECRET --data-file=-
```

For an existing secret, add a new version instead:

```bash
printf '%s' 'NEW_VALUE' | gcloud secrets versions add MARKETINGAPI_JWT_SECRET --data-file=-
```

`JWT_SECRET` must remain stable after launch because it signs sessions and is also used to derive the vault encryption key when a dedicated `VAULT_KEY` is not configured.

## 3. IAM prerequisites

The Cloud Build service account needs only the permissions required to:

- build/push container images;
- deploy Cloud Run;
- deploy Firebase Hosting;
- create/update the Cloud Scheduler job;
- access `MARKETINGAPI_CRON_SECRET` during the scheduler configuration step;
- act as the Cloud Run runtime service account.

The Cloud Run runtime service account needs Secret Manager access to the five runtime secrets above.

Grant these roles in Google Cloud IAM according to your organization policy rather than committing service-account keys to this repository.

## 4. Deploy end to end

From the repository root:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

The build performs this sequence:

1. Build the backend Docker image.
2. Push the image.
3. Deploy `marketingapi` to Cloud Run in `asia-south1`.
4. Configure/update the Cloud Scheduler job (every 5 minutes).
5. Build the React production bundle with same-origin API calls.
6. Deploy Firebase Hosting.

The deploy is successful only after Cloud Run and Firebase steps complete.

## 5. Verify before adding the domain

Open the Firebase Hosting generated URL and verify:

```text
/api/health
/api/version
```

`/api/health` must return HTTP 200 and report `database: ok`.

Then register the first real workspace and verify:

- login / session persistence;
- lead creation;
- Consent Guard;
- Campaign Studio draft -> approval -> send;
- WhatsApp connection (when Meta credentials are available);
- AI generation;
- Workspace & Usage page;
- Developer API key creation;
- scheduled follow-ups.

## 6. Add the custom domain

In Firebase Console:

```text
Hosting -> Add custom domain
```

Enter the final domain and apply the DNS records Firebase provides. HTTPS is managed by Firebase Hosting.

Do **not** point the public custom domain directly to Cloud Run. The intended flow is:

```text
Domain -> Firebase Hosting -> Cloud Run
```

## 7. Meta WhatsApp webhook

Once the custom domain is active, use:

```text
https://YOUR_DOMAIN/api/webhooks/meta/whatsapp
```

as the Meta callback URL and use the value stored in `MARKETINGAPI_META_WEBHOOK_VERIFY_TOKEN` as the verification token.

Workspace access tokens/app secrets are stored encrypted through the application and are never returned in plaintext.

## 8. Local end-to-end development

Copy the environment template:

```bash
cp .env.example .env
```

Then:

```bash
docker compose up --build
```

Local URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
MongoDB:  mongodb://localhost:27017
```

Only local Docker Compose enables provider simulation and the in-process automation loop. Production does not.

## 9. CI gates

Every PR runs:

- React production build;
- Python compile + Cloud Run production import;
- real MongoDB + FastAPI HTTP E2E tests;
- backend Docker build;
- Firebase JSON and Cloud Build YAML validation.

Do not deploy a revision with a failed gate.

## Security notes

- Never commit API keys, service-account JSON, MongoDB URLs, JWT secrets, webhook tokens or `.env` files.
- Do not rotate `JWT_SECRET` without a vault migration plan.
- Simulation must remain disabled in production.
- Demo seeding must remain disabled in production.
- Cloud Run is public because Firebase Hosting needs to proxy `/api/**`; application authentication/authorization protects private API routes.
- The scheduler endpoint is additionally protected with `CRON_SECRET` and atomic database claims prevent duplicate campaign/follow-up execution across Cloud Run instances.

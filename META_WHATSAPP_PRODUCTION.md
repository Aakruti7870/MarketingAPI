# GOLD-e AI Meta / WhatsApp Production Cutover

This document is intentionally identifier-only. **Never commit access tokens, App Secrets or webhook verification tokens.**

## Public Meta app URLs

Use these exact public URLs in Meta App Settings:

- App domain: `gold-etechapp.com`
- Privacy Policy: `https://gold-etechapp.com/privacy`
- Terms of Service: `https://gold-etechapp.com/terms`
- Data Deletion: `https://gold-etechapp.com/data-deletion`
- WhatsApp webhook callback: `https://gold-etechapp.com/api/webhooks/meta/whatsapp`

The Cloud Run service URL may be used for troubleshooting, but production Meta configuration should use the public GOLD-e AI domain after Firebase Hosting/DNS is confirmed.

## Required connection values

MarketingAPI stores one WhatsApp connection per workspace and expects:

```text
phone_number_id=<GOLD-e AI phone number id>
waba_id=<GOLD-e AI WhatsApp Business Account id>
app_id=<GOLD-e AI Meta app id>
access_token=<private permanent/system-user token>
app_secret=<private Meta app secret>
```

`access_token` and `app_secret` are encrypted before storage.

The application-level webhook verification token is supplied to Cloud Run from Secret Manager as `META_WEBHOOK_VERIFY_TOKEN` and must not be stored in the workspace connection document.

## Meta permissions

Keep the minimum WhatsApp permissions required for the production integration:

```text
whatsapp_business_management
whatsapp_business_messaging
```

Add broader Business permissions only if Meta requires them for the exact asset-management workflow being used.

## Webhook

1. Callback URL: `https://gold-etechapp.com/api/webhooks/meta/whatsapp`
2. Verification token: the current value of `MARKETINGAPI_META_WEBHOOK_VERIFY_TOKEN` in Secret Manager.
3. Client certificate / mTLS: OFF unless the backend is deliberately changed to support it.
4. Subscribe to the `messages` webhook field after the GOLD-e AI phone/WABA is active.
5. Incoming POST requests are accepted only when their `X-Hub-Signature-256` matches the stored Meta App Secret for the phone-number connection.

## Safe replacement of the temporary TrackMyRMC connection

Do **not** delete the current working connection first.

Use this order:

1. Complete GOLD-e AI phone/WABA verification in Meta.
2. Confirm the permanent/system-user access token is valid for the GOLD-e AI WABA and phone number.
3. Confirm the Meta webhook subscription is active.
4. Save the GOLD-e AI connection through `POST /api/whatsapp/connection` as an owner/admin.
5. Read `GET /api/whatsapp/connection` and confirm it returns the GOLD-e AI `phone_number_id` and `waba_id` with `mode: live`.
6. Send one consent-safe controlled test using `POST /api/whatsapp/test-send`.
7. Confirm Meta returns a real `wamid` and the webhook updates the message to delivered/read when those events occur.
8. Only then consider removing obsolete TrackMyRMC access/partner relationships in Meta if TrackMyRMC no longer requires them. Do not delete TrackMyRMC's own WABA/phone if that product still uses them.

Saving the new connection is an upsert by workspace, so it replaces the temporary workspace connection atomically; a delete-first cutover is unnecessary.

## Pre-WABA production checklist

The repository can be completed and deployed before final WABA activation. Before declaring the rest of the platform ready, confirm:

- `/api/health` returns 200 and `database: ok`.
- `/privacy`, `/terms`, and `/data-deletion` render GOLD-e AI content publicly without login.
- Settings can submit an authenticated data-deletion request.
- AI coin debits/refunds pass E2E tests.
- Consent/opt-out checks pass E2E tests.
- Campaign approval/scheduling safeguards pass E2E tests.
- Sensitive owner/admin routes remain blocked for agents.
- Cloud Scheduler is enabled and can invoke the protected autopilot endpoint.
- Meta provider simulation remains disabled in production.
- No Meta token, App Secret, JWT secret, Mongo URI or vault key is committed to Git.

After these checks pass, the final WhatsApp-specific blocker is the verified GOLD-e AI WABA/phone connection and its production credentials.

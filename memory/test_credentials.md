# GOLD-e Test Credentials

## Demo Owner (seeded)
- Email: demo@gold-e.ai
- Password: demo1234
- Role: owner
- Workspace: Acme Ready-Mix Concrete (Enterprise)

## Demo Agent (seeded, same workspace)
- Email: priya@gold-e.ai
- Password: agent1234
- Role: agent

## Auth
- JWT Bearer tokens (Authorization: Bearer <token>), stored in localStorage key 'golde_token'.
- POST /api/auth/register {name,email,password,workspace_name} -> isolated workspace + owner
- POST /api/auth/login {email,password} -> {token, user}
- GET /api/auth/me

## Upgrade modules (all under /api)
- Consent Guard: /api/consent/{summary,policy,check,opt-outs}, POST /api/consent/leads/{id}, POST /api/consent/leads/{id}/opt-out
- WhatsApp (simulation mode by default): GET/POST/DELETE /api/whatsapp/connection, GET /api/whatsapp/messages, POST /api/whatsapp/test-send, POST /api/webhooks/simulate {lead_id/wamid,event}
- Campaign Studio: POST /api/studio/campaigns, GET /api/studio/campaigns/{id}, POST .../preview, .../approve (owner/admin), .../send (requires approved), .../pause
- AI Poster (real GPT Image 1): POST /api/ai/poster (up to 60s), GET /api/assets/{id} (image), GET /api/assets, GET/PUT /api/brand
- Autopilot: GET /api/autopilot, GET /api/autopilot/summary (in-process scheduler runs every 15s)
- Developer API: /api/dev/keys (create returns key once, rotate, revoke), /api/dev/usage. Public: /api/v1/leads, /api/v1/campaigns, /api/v1/campaigns/{id}/send, /api/v1/campaigns/{id}/status (auth via X-API-Key or Bearer gde_live_..., scope + rate-limit enforced)
- Analytics: GET /api/analytics

## Developer API key format
gde_live_<40 hex chars>. Only the sha256 hash is stored; prefix shown in listings.

## Notes
- Consent-first: every outbound message routes through can_send(); STOP keyword / opt-out immediately blocks and stops autopilot.
- Secrets (Meta tokens, app secret) encrypted (Fernet), never returned or logged. Phone numbers encrypted + masked.
- Strict tenant isolation: every query scoped by workspace_id.

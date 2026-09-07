# GOLD-e — AI Revenue Engine (PRD)

## Stack
React (CRA) + Tailwind + recharts + lucide + sonner · FastAPI + Motor/MongoDB · JWT Bearer auth
AI: OpenAI gpt-5.4 (text) + gpt-image-1 (posters) via emergentintegrations (EMERGENT_LLM_KEY)
Security: Fernet encryption for vault secrets, Meta creds & phone numbers; phone masking + lookup hash

## Personas: Owner (full), Admin (all except billing), Agent (leads/inbox/campaigns)

## Implemented — Release 1 (2026-06-07)
Multi-tenant workspaces + strict isolation, JWT auth + RBAC, encrypted API Vault, Lead Engine
(CSV import/dedupe, AI HOT/WARM/COLD scoring), drag-drop Pipeline, Unified Inbox (AI reply/summary),
Templates (AI writer), Campaigns, AI Marketing Studio, Automations, Quotations (AI draft),
Dashboard analytics, Ctrl+K AI Command Center. Seeded demo workspace. Tested 35/35 + 12 pages.

## Implemented — Secure Platform Upgrade (2026-06-07)
Extended safely via new backend modules (core, consent, whatsapp, studio, poster, autopilot, devapi, analytics):
- **Consent Guard (hard gate)** `can_send()` — 10 checks (ownership, consent+channel+expiry, opt-out registry,
  suppression, block list, frequency, campaign/template status, workspace switch). No integration can bypass it.
  Routes: /api/consent/{summary,policy,check,opt-outs}, set consent, opt-out. Re-consent clears opt-out registry.
- **WhatsApp Cloud API (simulation, live-ready)** — encrypted per-workspace credential vault, single outbound
  path `send_via_channel()` (always consent-gated), message log, HMAC-verified webhook hub + /webhooks/simulate.
  Real Meta send/webhook code present, activates when live creds stored. Secrets never returned/logged.
- **Campaign Studio** — objective/audience/dynamic-variable message/CTA & reply buttons; draft → owner
  approval → consent-safe send (per-recipient can_send) → pause. Send blocked (400) before approval.
- **AI Poster (real GPT Image 1)** — /api/ai/poster generates original image + copy/CTA/hashtags; stored
  (base64) & served at /api/assets/{id}; brand profile /api/brand.
- **Follow-up Autopilot** — per-campaign steps, configurable timing (days/min/sec), in-process scheduler
  (15s tick); STOPS on reply / opt-out / convert / campaign pause / consent revoke.
- **Developer GOLD-e API** — /api/dev/keys (sha256 hash-only, shown once, scopes, rate limit, rotate, revoke,
  expiry, IP allowlist, usage log); public /api/v1/{leads,campaigns,campaigns/{id}/send,status} with
  X-API-Key auth + scope + rate-limit enforcement; API sends still require owner approval.
- **Analytics** — full message funnel, delivery/read/reply/block/opt-out/conversion rates, per-channel,
  per-campaign, autopilot counts.
- Frontend: new pages Consent Guard, Campaign Studio (rewritten), AI Studio (real posters + brand kit),
  Autopilot/Automations, Analytics, WhatsApp, Developer API; nav + routes updated.

## Testing
Release 1: 35/35 backend + 12 pages. Upgrade: 26/26 backend + smoke on all new pages, no blocking issues.
Verified: consent enforcement, STOP-on-opt-out/reply, approval gate, dev-API scopes/rate-limit, tenant
isolation, no-secret-leakage, real image generation. Suites: /app/backend/tests/test_backend.py,
/app/backend/tests/test_upgrade.py.

## Notes / portability
No separate production deployment created. WhatsApp uses a mock adapter until live Meta creds are added.
No production API keys requested/stored. Push changes via the chat "Save to GitHub" feature.

## Backlog (P1/P2)
- Live Meta send + Embedded Signup onboarding; distributed queue for webhooks/autopilot (retry + DLQ)
- Email (SMTP) + SMS provider adapters through the same consent-gated pipeline
- Template sync from Meta + template variable validation; media (image/doc) campaign attachments
- Suppression-list import UI; consent audit export; per-channel consent capture widget/webhook

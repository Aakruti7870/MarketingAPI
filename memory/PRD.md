# GOLD-e — AI Revenue Engine (PRD)

## Problem statement
Multi-tenant SaaS where each business gets an isolated workspace, adds its own API credentials (encrypted vault), imports/AI-scores leads (HOT/WARM/COLD), runs a sales pipeline, sends omnichannel campaigns with reusable templates, manages a unified inbox with AI assist, generates marketing creatives/copy, and drives everything from an AI Command Center.

## Stack
- Frontend: React (CRA) + Tailwind + recharts + lucide-react + sonner
- Backend: FastAPI (single server.py) + Motor/MongoDB
- Auth: JWT Bearer (email/password, bcrypt), token in localStorage
- AI: OpenAI gpt-5.4 via emergentintegrations (EMERGENT_LLM_KEY), with heuristic fallbacks
- Security: Fernet encryption for vault secrets & phone numbers; phone masking + lookup hash

## Personas
- Owner: full control (billing, team, vault)
- Admin: manage everything except billing
- Agent: leads, inbox, campaigns

## Implemented (2026-06-07)
- Multi-tenant workspaces with strict workspace_id isolation on every query (verified)
- Auth: register (creates workspace + owner), login, me; RBAC via require_role
- Secure API Vault: add/list/delete credentials, AES-encrypted at rest, masked in UI (owner/admin only)
- Lead Engine: manual add + CSV import w/ dedupe, AI scoring HOT/WARM/COLD, re-score, filters, search, detail drawer; phones encrypted + masked
- Sales Pipeline: drag-drop kanban across 10 stages, stage persistence
- Unified Inbox: multi-channel threads, reply, AI reply suggestion, AI summary
- Content Studio (Templates): CRUD, AI writer, multi-language, action buttons
- Campaigns: create w/ segment targeting + computed delivery/reply stats
- AI Marketing Studio: headline/caption/CTA/hashtags + poster preview, aspect ratios
- Automations: trigger→condition→action rules, enable/disable toggle
- Quotations: AI-drafted line items, totals, auto-move lead to QUOTATION stage
- Team & Roles: list/add/remove members with RBAC
- Dashboard: KPIs, 7-day acquisition trend, temperature split, conversion funnel
- AI Command Center (Ctrl+K): NL commands over real workspace data
- Seeded demo workspace (Acme Ready-Mix Concrete) with realistic data

## Testing
- 35/35 backend tests pass; 12/12 frontend pages + AI flows pass. Tenant isolation & phone privacy verified. Suite: /app/backend/tests/test_backend.py

## Backlog / Next (P1/P2)
- Real channel sending (Meta WhatsApp Cloud API, SMTP, Twilio) wired to vault credentials
- Real AI image generation for posters (currently curated background + AI copy)
- Public developer API with GOLD-e API keys + rate limiting
- Consent/opt-out registry enforcement before send
- Follow-up sequence scheduler (Day 2/4/7) via background worker
- Audit log viewer UI + workspace_id index
- Workspace switcher (multi-workspace membership)

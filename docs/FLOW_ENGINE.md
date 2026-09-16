# GOLD-e Flow Engine

GOLD-e owns a channel-neutral workflow format so the same business workflow can run in the web app, support widget and—after WABA activation—a Meta WhatsApp Flow adapter.

## Core model

- `flows` stores editable draft metadata and the current draft definition.
- `flow_versions` stores immutable published snapshots.
- `flow_sessions` stores runtime state and collected answers.
- `flow_events` stores lifecycle events used for analytics and support diagnostics.

A live session always binds to a published version. Editing a published flow creates a new draft state without changing the version already serving customers.

## Supported fields

`text`, `textarea`, `select`, `radio`, `checkbox`, `number`, `email`, `phone`, and `date`.

Flow field names that imply passwords, OTPs, tokens, API keys, access keys or secrets are rejected by the server. Support copy also explicitly warns users not to submit credentials.

## Built-in templates

- GOLD-e AI Support
- Lead Qualification
- Feedback Survey

The Support flow includes conditional routes for CSV/XLSX import, WhatsApp setup, campaign issues, billing/coins, bug reports and human handoff.

## Lifecycle

1. Create or copy a draft.
2. Preview the draft with server-side validation and branching.
3. Owner/admin publishes an immutable version.
4. Live sessions bind to that version.
5. Draft edits can continue independently for the next version.
6. Analytics report started, completed, active and cancelled sessions.

## WhatsApp adapter boundary

`whatsapp` is an allowed delivery target in the internal schema, but Meta-specific Flow JSON, public-key/data-channel handling, WABA Flow IDs and publish synchronization are intentionally kept out of the core engine. That adapter is connected only after the GOLD-e WABA is verified and production credentials are available.

## E2E coverage

The production HTTP suite verifies template creation, publish gating, immutable version publication, conditional routing, required-field validation, terminal completion, analytics, unsafe-field rejection and workspace isolation.

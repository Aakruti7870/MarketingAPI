# Lumina360 Data Persistence Plan

## Current state

The application contains in-memory application data and illustrative records used by several workspace, campaign, lead, billing, and dashboard experiences. These are useful for development/demo flows but must not be treated as durable multi-user production data.

## Target architecture

1. **Identity** — durable users with server-side authentication records.
2. **Tenancy** — workspaces/organizations with explicit membership and role records.
3. **Marketing data** — campaigns, audiences, creatives, leads, conversations, appointments, and automation runs keyed to a workspace.
4. **Billing** — customer/plan/credit ledger records with immutable transaction history.
5. **Audit** — security-sensitive actions and integration events with timestamps and actor/workspace IDs.
6. **Integrations** — provider connection metadata stored separately from operational marketing records; credentials remain in the deployment secret manager.

## Required controls

- Every tenant-owned record must carry an authorization boundary.
- Server-side authorization must be checked on every tenant-scoped API route.
- Sensitive fields must be minimized and encrypted/protected according to the selected database and deployment platform.
- Database migrations must be versioned and repeatable.
- Backups and restoration must be tested before launch.
- Production seed/demo data must be explicitly separated from customer data.

## Implementation gate

Choose the production database and hosting environment before implementing the persistence layer. The choice affects connection management, migrations, backups, secret configuration, and deployment topology, so the repository should not silently assume a provider.

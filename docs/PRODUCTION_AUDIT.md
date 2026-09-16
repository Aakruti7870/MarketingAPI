# Lumina360 Production Audit

## Purpose

Track the remaining engineering work required to move Lumina360 from a CI-green application to a production-grade multi-user service.

## Workstreams

### Authentication and sessions
- [ ] Add signed session expiration.
- [ ] Add a server-side session validation endpoint.
- [ ] Add logout/session revocation semantics.
- [ ] Prefer secure, HttpOnly cookies for browser sessions where deployment architecture permits.
- [ ] Add automated auth smoke tests for valid, invalid, expired, and missing-configuration cases.

### Data and persistence
- [ ] Inventory all in-memory stores and demo records.
- [ ] Define durable persistence for users, workspaces, campaigns, leads, billing, and audit events.
- [ ] Add tenant/workspace authorization boundaries to persistent records.
- [ ] Define migration and backup strategy.

### Public product claims
- [ ] Replace unsupported benchmark figures with measured product data or clearly label examples as illustrative.
- [ ] Remove absolute guarantees such as zero leakage unless technically and contractually substantiated.
- [ ] Keep public health/availability indicators tied to real runtime checks.

### AI and integrations
- [ ] Verify provider configuration and fail-safe behavior when API keys are unavailable.
- [ ] Add bounded retries/timeouts for external AI requests.
- [ ] Ensure provider errors never expose secrets or internal stack traces.
- [ ] Make model/provider selection observable without exposing credentials.

### Security
- [ ] Audit API routes for authentication and authorization requirements.
- [ ] Validate uploaded files and request sizes.
- [ ] Review CORS, security headers, rate limiting, and abuse controls for deployment.
- [ ] Reintroduce automated secret scanning after validating the repository history and scanner configuration.

### Deployment
- [ ] Select and document the production hosting target.
- [ ] Configure production environment variables/secrets.
- [ ] Add deployment health checks and rollback procedure.
- [ ] Verify the deployed canonical URL before finalizing SEO metadata.

## Definition of production readiness

Lumina360 is considered production-ready only when authentication, tenant isolation, durable data persistence, external-provider failure handling, security controls, and deployment verification have all been validated. Green CI is necessary but is not sufficient by itself.

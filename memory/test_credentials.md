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

## Auth endpoints
- POST /api/auth/register  { name, email, password, workspace_name }  -> creates isolated workspace + owner
- POST /api/auth/login     { email, password } -> { token, user }
- GET  /api/auth/me        (Bearer token)

## Notes
- Auth uses JWT Bearer tokens (Authorization: Bearer <token>), stored in localStorage on frontend.
- Multi-tenant: every document carries workspace_id; all queries are scoped to the caller's workspace.
- Phone numbers are encrypted (Fernet) + masked; only masked value + lookup hash exposed.
- API vault credentials are encrypted at rest and returned masked only.

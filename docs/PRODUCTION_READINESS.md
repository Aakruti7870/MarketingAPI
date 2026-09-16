# LUMINA360 Production Readiness

## Current CI gate

The `Lumina360 CI` workflow validates TypeScript, creates the production Vite/server build, verifies build output, and starts the compiled server to check `/health`.

The `Lumina360 Auth Hardening` workflow validates that administrator authentication remains server-side and that required authentication configuration is represented by environment variables rather than source-code credentials.

## Required server configuration

Configure these values in the deployment platform's secret/environment manager. Never commit real values to the repository.

- `LUMINA_ADMIN_EMAIL`
- `LUMINA_ADMIN_PASSWORD_HASH`
- `LUMINA_ADMIN_PASSWORD_SALT`
- `LUMINA_AUTH_SECRET`

Optional provider credentials are also server-side configuration:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `NVIDIA_NIM_API_KEY`

## Authentication notes

`LUMINA_ADMIN_PASSWORD_HASH` is a one-way scrypt-derived password hash; it is not the administrator's normal password. `LUMINA_ADMIN_PASSWORD_SALT` is the salt used for that derivation. `LUMINA_AUTH_SECRET` is an independent signing secret.

The deployment must provide all four administrator authentication variables. If they are absent, administrator authentication fails closed.

## Before public launch

1. Configure the production environment secrets.
2. Confirm the deployment uses HTTPS.
3. Verify the admin login flow against the production API.
4. Verify provider credentials through the provider integration controls before enabling live campaigns.
5. Replace or clearly label any remaining sample/demo records and benchmark figures before presenting them as customer results.
6. Confirm retention, deletion, consent, messaging, advertising, and third-party provider requirements for the jurisdictions and channels in use.
7. Run the CI workflow and production smoke test after each release.

## Important implementation boundary

The repository currently contains in-memory application data for several demo/workspace features. That storage is suitable for development and demonstration but should be replaced with durable, access-controlled persistence before those features are marketed as production multi-user data services.

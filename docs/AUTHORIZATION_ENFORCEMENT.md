# Admin API Authorization

Sensitive provider-key administration endpoints require a valid server-side Lumina360 admin session.

The authorization guard is enforced by `requireAdminSession` and is validated in CI.

# Organization Member Management

## Purpose
Keep Workspace organization membership actions scoped to the active organization instead of the platform operator allowlist.

## Owner
`apps/workspace`

## Entrypoints
- Workspace organization settings members screen.
- Hono organization action routes under `/api/v1/organizations/:organizationId`.
- Better Auth organization membership endpoints.

## Actor/System Flow
Organization owners and permitted work roles manage invitations, member roles, and member removal. Better Auth owns membership storage and role permission checks. Workspace service code adds Qentrah-specific safety checks and records audit events.

## Current Status
Active. Member removal should require organization `member:delete` permission and removal policy checks, not `PLATFORM_ADMIN_EMAILS`.

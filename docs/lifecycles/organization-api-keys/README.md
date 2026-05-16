# Organization API Keys

## Purpose
Manage organization-scoped bearer API keys for server-side integrations.

## Owner
`apps/workspace`

## Entrypoints
- Workspace organization settings, API Keys tab.
- Hono organization API key routes under `/api/v1/organizations/:organizationId/api-keys`.
- External resource API under `/api/v1/partner/organizations/:organizationId`.

## Actor/System Flow
Organization owners or permitted roles create, rotate, and revoke scoped keys. External systems call Qentrah with `Authorization: Bearer <key>`.

## Current Status
Active. One-time key handoff must include both the secret and the API URL needed by the external system.

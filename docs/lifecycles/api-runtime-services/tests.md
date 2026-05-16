# Tests

## Existing Coverage

- Workspace partner domain tests cover partner app catalog, connection authorization, access token validation, and resource access.
- Partners auth route tests are currently limited; signup/signin rely on route-level behavior.

## New Coverage For This Pass

- Typed API errors map to expected HTTP status and payload shape.
- Cache keys are stable, scoped, invalidatable, and respect TTL.
- Cache rejects unsafe organization-sensitive keys without explicit scoped parts.
- Rate limits isolate keys, return remaining counts, reset after the window, and produce retry metadata.
- Hono Effect Adapter maps success, typed errors, unexpected errors, and rate-limit headers correctly.

## Commands

- `npm --workspace @qentrah/platform-core test` - passed 2026-05-16
- `npm --workspace @qentrah/platform-core run build` - passed 2026-05-16
- `npm --workspace @qentrah/workspace test -- src/server/effect src/server/domains/partnerApps` - passed 2026-05-16
- `npm --workspace @qentrah/workspace run typecheck` - passed 2026-05-16
- `npm --workspace @qentrah/partners test` - passed 2026-05-16
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-16
- `npm --workspace @qentrah/admin-review test` - passed 2026-05-16
- `npm --workspace @qentrah/admin-review run typecheck` - passed 2026-05-16

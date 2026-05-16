# Tests

## Existing Coverage

- `apps/workspace/src/server/domains/organization/services/access-policy.test.ts` covers self-removal and last-owner removal.

## Checks For This Change

- Added service coverage that member removal does not call the platform-admin allowlist.
- Ran `npm --workspace @qentrah/workspace test -- src/server/domains/organization/services/actions.test.ts src/server/domains/organization/services/access-policy.test.ts`.
- Ran `npm --workspace @qentrah/workspace run typecheck`.

## Manual Checks

- As an organization owner, remove a non-owner member from Workspace settings.
- Confirm the removed member disappears after query invalidation.
- Confirm last-owner and self-removal are still blocked.

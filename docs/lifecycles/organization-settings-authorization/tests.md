# Tests

## Checks For This Change

- Confirmed no organization settings write path calls `requirePlatformAdmin` or `assertPlatformAdmin`.
- Ran `npm --workspace @qentrah/workspace test -- src/server/domains/organization/services/actions.test.ts src/server/domains/organization/services/access-policy.test.ts src/server/domains/organization/validation/api-key.schema.test.ts src/server/protocols/mcp/transports/agent-link.test.ts src/server/protocols/mcp/tools/catalog.test.ts`.
- Ran `npm --workspace @qentrah/workspace run typecheck`.
- Ran `npm --workspace @qentrah/workspace run dev:convex:once` after restoring the strict partner connection schema.
- Ran `rg -n "requirePlatformAdmin\\(|assertPlatformAdmin\\(|Platform admin required" apps/workspace/src/server/domains/organization apps/workspace/convex/organizations apps/workspace/convex/mcp/connections.ts`; no organization-settings matches remain.
- Ran `npm --workspace @qentrah/workspace test -- src/packages/authz src/server/utils/organization/access-checker.test.ts src/server/domains/organization/handlers/actions.capabilities.test.ts src/server/domains/organization/services/actions.test.ts`.
- Ran `npm --workspace @qentrah/workspace test -- src/server/domains/organization src/server/utils/organization src/packages/authz`.
- Ran `git diff --check -- docs/lifecycles/organization-settings-authorization apps/workspace/src/packages/authz apps/workspace/convex/organizations/profile/access.ts apps/workspace/src/server/utils/organization/access-checker.ts apps/workspace/src/server/domains/organization/handlers/actions.ts`.

## Manual Checks

- As an organization owner, save profile changes.
- As an organization owner, create an agent link and confirm it remains listed after closing the one-time modal.
- As an organization owner, create/cancel invite links and email invitations.
- Confirm non-permitted members still see disabled controls or permission errors.

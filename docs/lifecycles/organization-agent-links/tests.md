# Tests

## Existing Coverage

- MCP transport tests cover downstream agent-link validation and tool transport behavior.
- Organization capabilities drive UI enablement before create/update/revoke actions.

## Checks For This Change

- Confirmed `apps/workspace/convex/mcp/connections.ts` no longer imports or calls `assertPlatformAdmin`.
- Confirmed Agent Links UI no longer gates create/delete buttons on `isPlatformAdmin`.
- Confirmed MCP catalog tests cover `members_list` and `integrations_list` as read tools.
- Ran `npm --workspace @qentrah/workspace test -- src/server/protocols/mcp/transports/agent-link.test.ts src/server/protocols/mcp/tools/catalog.test.ts`.
- Ran `npm --workspace @qentrah/workspace test -- src/server/protocols/mcp/tools/catalog.test.ts src/server/protocols/mcp/transports/agent-link.test.ts src/domains/organization/settings-view-model.test.ts src/packages/authz/capabilities.test.ts convex/mcp/connectionPermissions.test.ts`.
- Ran `npm --workspace @qentrah/workspace run typecheck`.
- Ran focused ESLint over the MCP catalog, validation, capability, agent permission, and organization Agent Links UI files. It reported only existing warnings in `organization-screens.tsx`.

## Manual Checks

- As an organization owner with `apiKey:create` and delegated resource permissions, create an agent link.
- Confirm the one-time link appears and the connection remains in the current list after closing the modal.
- Confirm rotate/revoke still respect organization permissions.

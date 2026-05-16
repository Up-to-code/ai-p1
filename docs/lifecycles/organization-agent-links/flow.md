# Flow

## Create Agent Link

1. User opens Workspace organization settings, Agent Links tab.
2. UI reads organization capabilities, enables actions from organization `apiKey` permissions, and clamps requested agent permissions to what the current user may delegate.
3. Browser calls the organization MCP connection create route.
4. Hono validates payload and calls the Convex mutation.
5. Convex checks the signed-in user.
6. Convex checks organization `apiKey:create`.
7. Convex checks every delegated resource/action permission requested for the agent.
8. Convex creates the underlying API key secret.
9. Convex inserts `organizationMcpConnections` and an audit event.
10. UI displays the one-time agent link and refreshes the list.

## Update, Revoke, Rotate

- Update requires organization `apiKey:update`.
- Revoke requires organization `apiKey:delete`.
- Rotate requires organization `apiKey:create`.
- All operations are scoped to the connection's `organizationId`.

## Source Of Truth

- Better Auth organization permissions: who can manage/delegate.
- Convex `organizationMcpConnections`: organization grant and link status.
- Convex API key component: actual secret validation and rotation.
- `PLATFORM_ADMIN_EMAILS`: platform/operator-only actions, not organization agent-link management.

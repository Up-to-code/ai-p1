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

## Tool Call Safety Gateway

1. The MCP transport validates the agent-link public id and secret.
2. Convex filters the link permissions against the creator's current organization permissions.
3. The Agent tool policy gateway evaluates adapter, actor type, organization, tool, resource/action, risk level, approval requirement, and permissions.
4. Read tools execute only after policy allows the call.
5. External MCP write/delete tools never mutate immediately. They create an encrypted pending approval record and return a confirmation-required response.
6. High-impact actions, including destructive changes, member/role management, organization identity changes, production-system actions, billing/payment actions, and broad data changes, require admin approval.
7. Full tool input stays encrypted in the approval record. MCP/model-visible responses receive only redacted previews and approval metadata.

# Files

- `apps/workspace/src/domains/organization/components/organization-screens.tsx`: Agent Links panel, one-time link modal, capability gating, and list refresh behavior.
- `apps/workspace/src/domains/organization/api/better-auth-organization.ts`: browser API wrapper for MCP connection routes.
- `apps/workspace/src/server/domains/mcpConnections/handlers/mcp-connections.ts`: Hono request/response boundary and generated agent-link URL.
- `apps/workspace/src/server/domains/mcpConnections/services/mcp-connections.ts`: server bridge to Convex MCP connection functions.
- `apps/workspace/src/server/domains/mcpConnections/validation/mcp-connection.schema.ts`: request validation for create/update payloads.
- `apps/workspace/convex/mcp/connections.ts`: organization MCP connection persistence, key creation/rotation/revocation, permission checks, and validation.
- `apps/workspace/convex/mcp/tools.ts`: downstream MCP tool execution using validated connection permissions.
- `apps/workspace/convex/organizations/profile/access.ts`: Better Auth organization permission checker used by Convex mutations.
- `apps/workspace/convex/platform/access.ts`: platform operator allowlist helper; should not gate organization agent-link management.

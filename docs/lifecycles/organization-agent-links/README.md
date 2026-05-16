# Organization Agent Links

## Purpose
Manage organization-scoped MCP/agent links that let external agents call approved Qentrah resources with bounded permissions.

## Owner
`apps/workspace`

## Entrypoints
- Workspace organization settings, Agent Links tab.
- Hono organization routes under `/api/v1/organizations/:organizationId/mcp-connections`.
- Convex MCP connection mutations and MCP transport validation.

## Actor/System Flow
Organization owners or permitted roles create, update, rotate, pause, and revoke agent links. The link is backed by an internal API key secret and an organization MCP connection record.

## Current Status
Active. Agent link management is organization-scoped and should require organization `apiKey` management permissions plus delegated permissions, not the platform-admin email allowlist.

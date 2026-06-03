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

## WorkOS MCP Auth Direction

WorkOS MCP Auth should be treated as the future OAuth 2.1 authorization layer for remote MCP clients, not as a replacement for Qentrah's MCP tool server.

Current boundary:
- WorkOS owns user login, organization identity, membership projection, and role context.
- Qentrah owns real estate MCP tools, resource handlers, audit events, approval flows, and organization-scoped permission enforcement.
- Agent-link secrets remain the current production-compatible remote MCP credential until a WorkOS OAuth-backed MCP endpoint is implemented and tested.

Adoption phases:
1. Keep `/api/mcp/agent/:publicId/:secret` stable while expanding safe read scopes.
2. Add a parallel WorkOS OAuth-backed MCP endpoint that validates AuthKit-issued access tokens and maps OAuth scopes to Qentrah MCP permissions.
3. Run both endpoints during migration and compare tool listing, audit actor, approval, quota, and revocation behavior.
4. Move new external MCP clients to WorkOS OAuth after parity is proven.
5. Keep legacy agent links until existing customer/client integrations are rotated or expired.

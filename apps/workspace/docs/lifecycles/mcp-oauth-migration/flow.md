# Flow

## Old Flow (API Key)

1. User creates "agent link" via UI → generates publicId + secret
2. Convex stores API key + permissions in `organizationMcpConnections`
3. External MCP client connects via `POST /api/mcp/agent/:publicId/:secret`
4. Server validates via `convexHttp.query(api.mcp.connections.validateConnection)` (unauthenticated)
5. Each tool call re-validates publicId + secret + permission

## New Flow (OAuth)

1. MCP client discovers OAuth metadata from `.well-known/oauth-protected-resource/mcp`
2. MCP client initiates OAuth flow with Clerk (user authenticates in browser)
3. Clerk issues OAuth access token
4. Client connects via `POST /api/mcp` with `Authorization: Bearer <token>`
5. `withMcpAuth` calls verify callback → `auth({ acceptsToken: 'oauth_token' })` → verifies token
6. `createMcpHandler` dispatches to tool handler with `authInfo`
7. Tool handler calls `convexHttp.action(api.mcp.tools.callToolOAuth, { userId, orgId, orgRole, tool, input })`
8. Convex derives permissions from orgRole, checks permission, dispatches to handler

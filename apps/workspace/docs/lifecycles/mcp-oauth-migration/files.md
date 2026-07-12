# Files

- `apps/mcp-gateway/src/app.ts` — Hono middleware, discovery, token challenge, limits, and MCP entrypoint.
- `apps/mcp-gateway/src/mcp.ts` — stateless Streamable HTTP server exposing grant-filtered tools.
- `apps/workspace/convex/mcp/oauthGrants.ts` — durable grants and live permission resolution.
- `apps/workspace/convex/mcp/toolsOAuth.ts` — grant-authorized business dispatch.
- `apps/workspace/src/app/oauth/consent/` — organization, scope, permission, and expiry approval.
- `apps/workspace/src/domains/mcp/` — OAuth grant management and revocation.

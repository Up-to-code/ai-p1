# Files

## New
- `src/app/mcp/[transport]/route.ts` — MCP handler using createMcpHandler + withMcpAuth
- `src/app/.well-known/oauth-authorization-server/route.ts` — OAuth auth server metadata
- `src/app/.well-known/oauth-protected-resource/mcp/route.ts` — OAuth protected resource metadata
- `convex/mcp/toolsOAuth.ts` — callToolOAuth action + readToolOAuth/writeToolOAuth

## Modified
- `src/proxy.ts` — expose `.well-known/*` as public routes

## Deprecated (to remove)
- `src/server/protocols/mcp/transports/agent-link.ts` — old API-key auth handler
- `src/server/app/app.ts` — old MCP route registration (POST /mcp/agent/:publicId/:secret)
- `convex/mcp/connections.ts:validateConnection` — API key validation query
- `src/server/domains/mcpConnections/` — server-side API key handlers
- `src/domains/organization/components/panels/agent-links-panel.tsx` — API key creation UI

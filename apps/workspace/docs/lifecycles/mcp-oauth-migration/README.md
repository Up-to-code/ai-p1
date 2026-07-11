# MCP OAuth Migration

Replace the custom API-key-based MCP authentication (`publicId` + `secret` in URL) with standard OAuth MCP authentication.

**Owner app:** `@qentrah/workspace`

**Entrypoints:**
- `src/app/mcp/[transport]/route.ts` — new OAuth MCP handler
- `src/app/.well-known/oauth-authorization-server/api/auth/route.ts` — issuer-scoped OAuth metadata proxy
- `src/app/.well-known/oauth-protected-resource/mcp/route.ts` — OAuth metadata
- `convex/mcp/toolsOAuth.ts` — OAuth-authenticated Convex tool dispatch

**Current status:** In migration — the secret-based agent-link endpoint is the supported connection path. The unscoped `/.well-known/oauth-authorization-server` route was removed because it advertised a dynamic registration endpoint that does not exist and caused MCP clients to start a failing OAuth flow for agent links. OAuth metadata must remain issuer-scoped at `/.well-known/oauth-authorization-server/api/auth` until the authorized MCP flow is completed.

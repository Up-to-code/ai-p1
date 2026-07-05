# MCP OAuth Migration

Replace the custom API-key-based MCP authentication (`publicId` + `secret` in URL) with Clerk's standard OAuth MCP approach using `@clerk/mcp-tools` and `mcp-handler`.

**Owner app:** `@qentrah/workspace`

**Entrypoints:**
- `src/app/mcp/[transport]/route.ts` — new OAuth MCP handler
- `src/app/.well-known/oauth-authorization-server/route.ts` — OAuth metadata
- `src/app/.well-known/oauth-protected-resource/mcp/route.ts` — OAuth metadata
- `convex/mcp/toolsOAuth.ts` — OAuth-authenticated Convex tool dispatch

**Current status:** In migration — old API-key and new OAuth paths coexist.

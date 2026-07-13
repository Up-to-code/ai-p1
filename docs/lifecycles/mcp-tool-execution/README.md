# MCP Tool Execution Lifecycle

**Purpose**: Describe how an external AI client discovers, authorizes, lists,
and calls Qentrah tools through the single workspace-owned MCP resource.

**Owner app**: `apps/workspace`

**Public resource**: `https://app.qentrah.com/api/mcp`

**Primary entry points**:

- Next.js Streamable HTTP Adapter: `src/app/api/mcp/route.ts`
- Workspace protocol Module: `src/server/protocols/mcp`
- Grant authorization: `convex/mcp/toolsOAuth.ts:authorizeOAuthGrant`
- Tool execution: `convex/mcp/toolsOAuth.ts:callToolOAuth`
- Durable grant policy: `convex/mcp/oauthGrants.ts`
- Handler registry: `convex/mcp/handlers/registry.ts`
- Shared catalog: `@qentrah/mcp-contracts`

**Actor/system flow**: External AI → workspace MCP Adapter → request policy and
shared bearer-token verification → Convex executor → grant resolution →
grant-filtered registry → domain handler → canonical data/access Module → audit
and grant-activity update.

**Current status**: Workspace hard cutover. The standalone gateway and
secret-bearing agent links are retired and are not fallback paths.

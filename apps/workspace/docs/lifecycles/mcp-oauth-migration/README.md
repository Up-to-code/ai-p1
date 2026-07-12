# MCP OAuth Cutover

Qentrah MCP uses OAuth 2.1 authorization code with PKCE. The public MCP resource is owned by the standalone Hono gateway at `https://mcp.qentrah.com/mcp`; the workspace remains the Better Auth issuer and consent host.

Durable grants bind a Better Auth user, organization, OAuth client, organization/space/project scope, exact resource actions, and an expiry. Convex revalidates the grant and current membership before every tool call.

Secret-bearing agent links are retired. The legacy route exists only as a sanitized `410 Gone` migration tombstone and never reads the embedded secret.

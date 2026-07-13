# MCP OAuth Workspace Cutover

Qentrah MCP uses OAuth 2.1 authorization code with PKCE. The workspace owns the
only public MCP resource at `https://app.qentrah.com/api/mcp`, as well as the
Better Auth issuer and consent experience.

Durable Convex grants bind a Better Auth user, Organization, OAuth client,
Organization/Space/Project scope, exact resource actions, and expiry. Convex
revalidates the grant, membership, and resource access before every tool list
or call.

The standalone gateway and secret-bearing agent links are retired. There is no
migration tombstone or compatibility resource; existing clients reconnect and
approve the new audience through OAuth.

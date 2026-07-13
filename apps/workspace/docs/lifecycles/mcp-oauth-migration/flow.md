# MCP OAuth Flow

1. The client discovers the workspace protected-resource metadata for
   `https://app.qentrah.com/api/mcp`.
2. The client starts Better Auth authorization code with PKCE.
3. The user authenticates, selects an Organization, and approves resource
   scope, actions, and grant lifetime.
4. Better Auth issues an RS256 access token whose audience is the workspace MCP
   resource; Convex persists the exact OAuth grant.
5. The client calls `/api/mcp` with `Authorization: Bearer <token>`.
6. The workspace Adapter uses `@qentrah/auth` to verify signature, issuer,
   audience, expiry, and `mcp:read`; write tools also require `mcp:write`.
7. `authorizeOAuthGrant` or `callToolOAuth` resolves the active Convex grant,
   current membership, and current Organization/Space/Project policy.
8. Tool exposure and dispatch use `@qentrah/mcp-contracts` plus the active
   Convex handler registry.
9. Convex applies the correct quota, executes the canonical domain lifecycle,
   writes audit data, and records grant activity.

Session cookies, client-supplied roles, retired gateway secrets, and legacy
agent-link identifiers do not authorize this flow. Revocation or access loss is
effective on the next request.

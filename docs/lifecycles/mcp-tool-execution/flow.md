# MCP Tool Execution Flow

## Discovery and authorization

```text
MCP client
  → protected-resource metadata for https://app.qentrah.com/api/mcp
  → Better Auth authorization-server metadata
  → authorization code + PKCE
  → user selects Organization and approves scope, resource actions, and expiry
  → Better Auth issues an RS256 access token for the workspace MCP audience
  → Convex persists the exact OAuth grant
```

The grant binds the authenticated user, Organization, OAuth client, scope
(Organization, Space, or Project), resource actions, and expiry. It does not
freeze the user's current authority: membership and resource access are
re-evaluated on every request.

## Tool listing

```text
POST https://app.qentrah.com/api/mcp
  → Next.js stateless Streamable HTTP Adapter
  → @qentrah/auth verifies bearer signature, issuer, audience, expiry, and scope
  → authorizeOAuthGrant
  → resolveInternal finds active grant and derives live permissions
  → Convex reserves grant authorization quota
  → authorizedTools intersects permissions with @qentrah/mcp-contracts
  → protocol-safe tools/list response
```

No session cookie or client-provided Organization role participates in this
flow. The Organization identity is a verified claim and must match the durable
grant resolved by Convex.

## Tool call

```text
tools/call
  → transport validates protocol shape and request limits
  → callToolOAuth resolves the current grant again
  → assertOAuthToolPermission checks resource/action permission
  → write tools also require mcp:write
  → Convex reserves read, write, or destructive quota
  → readToolOAuth or writeToolOAuth
  → registered domain handler with resolved scope policy
  → canonical domain access and lifecycle behavior
  → Organization audit + grant lastUsedAt/usageCount
  → protocol-safe result
```

Unknown tools, out-of-scope records, revoked or expired grants, missing
membership, and insufficient permissions fail closed. Raw Convex or provider
errors are not exposed to the client.

## Revocation and access loss

Revoking the OAuth grant blocks the next list or call. The same is true for
grant expiry, Organization membership loss, scope removal, or a permission
change. Token validity alone never authorizes a tool.

# MCP OAuth Cutover Modules

- `apps/workspace/src/app/api/mcp/route.ts` — stateless Streamable HTTP Adapter
  for the canonical workspace MCP resource.
- `apps/workspace/src/server/protocols/mcp/` — bearer-auth, request-policy,
  stateless transport, and Convex-executor Modules behind the route Adapter.
- `packages/auth/src/config/topology.ts` — canonical workspace, issuer, JWKS,
  and MCP topology.
- `packages/auth/src/credentials/credential.ts` and
  `src/http/auth-http-client.ts` — shared credentials and safe authenticated
  HTTP behavior.
- `packages/auth/src/resource-server/` — bearer verification and scope policy.
- `apps/workspace/convex/auth/{runtime,email,organization,oauth}.ts` — focused
  Better Auth configuration, delivery, invitations, OAuth issuer, PKCE,
  RS256/JWKS, resource claims, and token lifecycle.
- `apps/workspace/convex/mcp/oauthGrants.ts` — durable grants and live permission
  resolution.
- `apps/workspace/convex/mcp/toolsOAuth.ts` — grant-authorized tool dispatch.
- `apps/workspace/src/app/oauth/consent/` — Organization, scope, permission, and
  expiry approval.
- `apps/workspace/src/domains/mcp/` — connection guidance, grant activity, and
  revocation.

The deleted standalone gateway is not an Adapter or fallback in this lifecycle.

# MCP Execution Modules

## Transport and authentication

- `apps/workspace/src/app/api/mcp/route.ts` — workspace-owned, stateless
  Streamable HTTP Adapter for `GET`, `POST`, and `OPTIONS`.
- `apps/workspace/src/server/protocols/mcp/authorization/bearer-auth.ts` —
  workspace Adapter from Next.js headers to the shared resource-server policy.
- `apps/workspace/src/server/protocols/mcp/transports/http-handler.ts`,
  `request-policy.ts`, and `streamable-http.ts` — protocol dispatch, request
  limits/timeouts, safe errors, and stateless transport.
- `apps/workspace/src/server/protocols/mcp/executor/convex-executor.ts` — narrow
  Adapter to Convex grant authorization and tool execution.
- `packages/auth/src/config/topology.ts` — canonical workspace, issuer, JWKS,
  and MCP topology derived from environment inputs.
- `packages/auth/src/credentials/credential.ts` — normalized bearer and Better
  Auth session-cookie credentials.
- `packages/auth/src/resource-server/` — access-token verification and required
  scope checks shared by resource-server Adapters.
- `packages/auth/src/http/auth-http-client.ts` — shared authenticated JSON
  request behavior and typed safe errors.
- `packages/auth/src/types/context.ts` and `src/server/guards.ts` — normalized
  Auth Context and pure authorization guards.

## Contract, policy, and execution

- `packages/mcp-contracts/src/` — MCP tool identity, descriptions, Adapter
  exposure, and resource/action requirements.
- `apps/workspace/convex/mcp/oauthGrants.ts` — durable grants, live permission
  derivation, revocation, expiry, and activity.
- `apps/workspace/convex/mcp/toolsOAuth.ts` — OAuth identity resolution,
  authorization, quota selection, and read/write dispatch.
- `apps/workspace/convex/mcp/rateLimits.ts` — grant/tool quotas; no gateway quota
  remains.
- `apps/workspace/convex/mcp/scopePolicy.ts` — Organization, Space, and Project
  scope policy.
- `apps/workspace/convex/mcp/handlers/registry.ts` and `handlers/*.ts` — active
  per-domain tool dispatch.
- Canonical domain lifecycle/access Modules — authoritative business rules,
  record authorization, side effects, and audit behavior.

## OAuth and user-facing management

- `apps/workspace/convex/auth/runtime.ts`, `email.ts`, `organization.ts`, and
  `oauth.ts`, composed by `convex/auth.ts` — focused Better Auth runtime,
  delivery, invitation, OAuth, PKCE, RS256/JWKS, claims, refresh, and revocation
  Modules.
- `apps/workspace/src/app/oauth/consent/` — Organization, scope, resource action,
  and expiry approval.
- `apps/workspace/src/domains/mcp/` — connection instructions, grant activity,
  and revocation UI.

`apps/mcp-gateway`, secret-bearing agent-link transport, and
`organizationMcpConnections` are not part of the supported OAuth execution
path.

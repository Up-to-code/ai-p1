# Workspace MCP Cutover and Gateway Retirement

Status: accepted hard cutover, 2026-07-13

This document supersedes the earlier standalone Hono gateway design. The
filename is retained so existing architecture links continue to resolve; the
standalone gateway itself is not a compatibility surface.

## Decision

`apps/workspace` owns the only public MCP resource:

```text
https://app.qentrah.com/api/mcp
```

`apps/mcp-gateway`, `mcp.qentrah.com`, gateway-only secrets, and gateway-only
rate limiting are retired. There is no alias, redirect, or fallback transport.
Existing clients must remove the old registration and complete OAuth again for
the new resource audience.

## Ownership and seams

| Module | Interface | Implementation and source of truth |
|---|---|---|
| Auth Topology | `resolveAuthTopology(env)` | `@qentrah/auth/config`; derives issuer, JWKS, workspace, marketing, and MCP URLs from canonical environment inputs |
| Resource Server | bearer verification, scope checks, challenges, no-store responses | `@qentrah/auth`; pure cross-runtime policy with a workspace Next.js Adapter |
| OAuth Issuer | discovery, PKCE, consent, token issuance, refresh, revocation | Better Auth in `apps/workspace`; one RS256 keyset and its advertised JWKS route |
| MCP Transport | stateless Streamable HTTP at `/api/mcp` | `apps/workspace` Next.js Adapter; accepts OAuth bearer tokens only |
| MCP Contract | tool identity, descriptions, resource/action mappings | `@qentrah/mcp-contracts` |
| MCP Authorization | durable grant, live membership, scope, permission, expiry, rate limits | `apps/workspace/convex/mcp`; re-evaluated for every list or call |
| Business Execution | domain handlers, record access, audit, side effects | Convex lifecycle and access Modules |
| Grant Management | consent and user-visible revoke/activity UI | Workspace OAuth and MCP domain Modules |

The shared Auth Modules are deep seams: callers provide runtime credentials and
environment inputs, while URL normalization, credential parsing, safe HTTP,
claims, scopes, and policy remain local to `@qentrah/auth`. Next.js, Convex,
mobile SecureStore, and Eve remain Adapters; they do not duplicate that policy.

## Request invariants

- The MCP Adapter accepts `Authorization: Bearer <access-token>` and never
  authenticates an external MCP request from a workspace session cookie.
- The access token issuer, audience, signature, expiry, and `mcp:read` scope are
  verified before protocol parsing or Convex dispatch.
- Write tools additionally require `mcp:write`.
- Tool exposure is the intersection of the shared catalog, token scopes, the
  durable OAuth grant, current membership, current resource scope, and current
  permission policy.
- Revocation, grant expiry, membership loss, and permission loss take effect on
  the next request.
- Convex owns grant/tool rate limits and audits. The transport does not maintain
  a second quota source.
- Authorization headers, cookies, OAuth codes, access/refresh tokens, and raw
  upstream errors are never logged or returned.
- Transport responses are protocol-safe and `no-store`; authentication failures
  include the canonical protected-resource challenge.

## Hard-cutover sequence

1. Deploy the shared Auth topology and Better Auth RS256/JWKS configuration.
2. Deploy the workspace `/api/mcp` Adapter and protected-resource metadata.
3. Revoke grants whose audience is the retired gateway resource.
4. Verify OAuth, tool listing, a read call, a permitted write call, auditing,
   revocation, and rate limiting against the workspace URL.
5. Remove the standalone gateway application, deployment configuration,
   gateway-only secrets, and `mcp.qentrah.com` DNS/deployment.
6. Update client setup instructions to require reconnection to the new URL.

The release is considered incomplete while either public resource is presented
as supported. If verification fails, roll forward in the workspace deployment;
do not restore the gateway as an undocumented fallback.

## Verification gates

- OAuth authorization-server metadata and protected-resource metadata name the
  workspace MCP resource and the same issuer.
- The advertised JWKS route exists and verifies an issued MCP access token.
- Unauthenticated and invalid-token requests return a safe `401` challenge.
- `initialize`, `tools/list`, read, write, destructive-denial, grant revocation,
  tenant isolation, timeout, request-size, and rate-limit scenarios pass.
- Repository searches find no active gateway package, gateway hostname,
  gateway secret, fake internal URL, or duplicate credential parser.
- A real Codex connection completes OAuth, lists only authorized tools, performs
  a read, and updates the grant's activity record.

## Unchanged boundaries

Google, Apple, email/password, email OTP, Organization selection and
invitations, mobile authentication, Eve, billing, partner OAuth clients, and
domain authorization rules retain their behavior. Convex remains authoritative
for Organization membership and business data.

# MCP Execution Verification

## Automated coverage

- Auth topology: local, preview, and production resolution; production rejects
  loopback and malformed origins.
- Resource server: bearer parsing, issuer, audience, RS256 signature, expiry,
  missing `mcp:read`, and safe bearer challenges.
- OAuth: discovery, PKCE, consent, one advertised JWKS route, refresh,
  revocation, and expired tokens.
- Grant policy: exact permissions, Organization/Space/Project scope, live
  membership loss, expiry, revocation, and cross-tenant denial.
- Transport: `GET`, `POST`, `OPTIONS`, initialize, tools/list, tools/call,
  malformed JSON-RPC, oversized requests, timeouts, and safe errors.
- Execution: read, write, destructive denial, canonical side effects, audit,
  grant activity, and read/write/destructive rate limits.
- Contract parity: every exposed MCP tool has one shared catalog entry, one
  permission mapping, and one registered Convex handler.

## Repository checks

Run the focused Auth, MCP contract, workspace MCP route, and Convex MCP suites,
then workspace/shared-package typechecks, Convex checks/code generation,
production build, documentation-map drift check, and `git diff --check`.

Searches across runtime source, manifests, deployment configuration, and active
setup documentation must find no use of (historical cutover records may name
retired surfaces explicitly):

- `apps/mcp-gateway`
- `mcp.qentrah.com`
- `MCP_GATEWAY_RATE_LIMIT_SECRET`
- `reserveGateway`
- secret-bearing `/api/mcp/agent/:publicId/:secret`
- duplicated credential/cookie parsing in workspace or Eve Adapters

## Production smoke test

1. Remove the old Qentrah registration from Codex.
2. Register `https://app.qentrah.com/api/mcp`.
3. Complete browser OAuth and Organization consent.
4. Confirm `tools/list` returns only grant-authorized tools.
5. Run one read-only tool and one permitted non-destructive write tool.
6. Confirm audit output and grant `lastUsedAt`/usage count.
7. Revoke the grant and confirm the next request fails safely.

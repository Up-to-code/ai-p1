# Hono MCP Gateway Cutover

## Boundaries

- `apps/mcp-gateway` owns the public MCP resource at `mcp.qentrah.com`: discovery, bearer verification, rate limiting, Streamable HTTP transport, protocol-safe errors, and tool exposure.
- `apps/workspace` remains the Better Auth OAuth 2.1 issuer at `app.qentrah.com`: login, organization selection, consent, dynamic client registration, token issuance, and grant management.
- Convex remains the source of truth for organization membership, delegated MCP grants, scope policy, tool authorization, auditing, and business execution.
- `packages/mcp-contracts` owns protocol-safe tool metadata and permission mappings shared by the gateway and Convex.

The gateway never accepts a Qentrah session cookie and never owns application users. The workspace never serves the MCP transport after cutover.

## Implementation passes

### Pass 1: Shared contract and gateway

Current behavior: the workspace Next.js app serves OAuth MCP and a secret-bearing Hono transport.

Structural improvement: add a standalone Hono service and a shared contract package; keep the workspace OAuth issuer unchanged until the gateway is verifiable.

Validation check: gateway health, discovery, unauthenticated challenge, token validation, and MCP initialize tests.

### Pass 2: Durable OAuth grants

Current behavior: OAuth tokens carry broad read/write scopes and dispatch with an invalid user-id-to-legacy-connection-id cast.

Structural improvement: persist an exact organization/space/project grant and revalidate it before listing or calling tools.

Validation check: permission-clamping, expiry, revocation, tenant isolation, and scope regression tests.

### Pass 3: Legacy removal

Current behavior: the UI and API still create, rotate, and execute long-lived secrets embedded in URLs.

Structural improvement: replace creation with OAuth connection guidance and grant management; retire the old endpoint with a sanitized migration response and purge legacy key data.

Validation check: every legacy method returns `410`, secrets never reach logs, and no creation or rotation path remains.

### Pass 4: Clerk removal

Current behavior: workspace and mobile use Better Auth. Active Clerk runtime packages, adapters, environment variables, and compatibility loaders have been removed; migration records remain historical documentation only.

Structural improvement: use Better Auth Expo/SecureStore while preserving the local auth-client contract, then remove Clerk packages, variables, shims, and active documentation.

Validation check: web and mobile sign-in, social callback, session restoration, organization switching, API authentication, and repository-wide Clerk searches.

## Parity and security invariants

- Existing Google, Apple, email/password, email OTP, organization, and billing behavior remains available.
- Every MCP tool decision is derived server-side from the verified OAuth identity and current Convex state.
- Access loss, scope loss, grant expiry, or revocation is effective on the next request.
- No authorization header, cookie, OAuth code, refresh token, legacy MCP secret, or raw upstream error is logged or returned.
- Dodo Payments and Better Auth Agent Auth are outside this cutover.

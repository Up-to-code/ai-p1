# Changes

## 2026-05-28 Lifecycle Projection Depth

- Deepened `convex/organizationApiKeyLifecycle.ts` so API key status projection, presentation, list ordering, and creation TTL calculation sit behind tested internal helpers.
- Preserved organization API key Convex wrapper exports, permission checks, quota semantics, token creation/rotation/revoke behavior, and response shapes.

## 2026-05-28 API Key Lifecycle Depth

- Extracted organization API key lifecycle behavior into `convex/organizationApiKeyLifecycle.ts`.
- Kept `organizationApiKeys:list/createFromHono/rotateFromHono/revokeFromHono/validateAndReserve/readResource/writeResource` exports stable.
- Preserved delegated permission checks, audit actor fields, token prefix, quota limit/window behavior, expired presentation state, and validation rejection reasons.

## 2026-05-28 Runtime Token Assertion Deepening

- Kept organization API key resource wrapper behavior unchanged while moving bridge-token comparison through the shared Convex `serviceTokens` Module via `partnerResourceGateway`.
- Preserved the existing `WORKSPACE_CONVEX_BRIDGE_SECRET` minimum-length and `Invalid server function token.` rejection behavior.

## 2026-05-28 Partner Resource Access Deepening

- Kept API key creation, rotation, revocation, quota reservation, route shape, and one-time secret handoff unchanged.
- Moved organization API key resource reads and client writes behind the shared Convex `partnerResourceGateway`.
- Preserved API-key-specific audit actor fields and avoided adding partner webhook enqueueing to API-key writes.
- Added focused tests for API-key access through the new Hono seam and API-key actor behavior through the shared resource gateway.

## 2026-05-16

- Created lifecycle docs for organization API keys.
- Added API URL and starter request details to the one-time key ready modal.

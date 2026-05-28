# Files

- `apps/workspace/src/domains/organization/components/organization-screens.tsx`: API Keys panel and one-time key modal.
- `apps/workspace/messages/en.json`: English API key handoff copy.
- `apps/workspace/messages/ar.json`: Arabic API key handoff copy.
- `apps/workspace/src/server/domains/partnerApps/routing/router.ts`: external resource API route shape.
- `apps/workspace/src/server/domains/partnerApps/services/partner-resource-access.ts`: Hono-facing access Module that detects organization API key bearer tokens and returns the shared partner resource access context.
- `apps/workspace/convex/organizationApiKeys.ts`: key creation, validation, quota reservation, and stable resource access wrappers.
- `apps/workspace/convex/organizationApiKeyLifecycle.ts`: internal lifecycle Module for organization API key status/presentation, list ordering, creation TTL, delegated permission checks, create/rotate/revoke, and validation/quota reservation.
- `apps/workspace/convex/partnerResourceGateway.ts`: shared resource gateway used by organization API key resource wrappers and OAuth partner resource wrappers.
- `apps/workspace/convex/serviceTokens.ts`: shared Convex service-token assertion Module used by organization API key resource wrappers through the partner resource gateway.

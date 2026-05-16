# Files

## Runtime And Contracts

- `packages/platform-core/src/effect-api.ts`: public barrel Interface for typed API errors, Effect cache service, and HTTP rate-limit service.
- `packages/platform-core/src/effect-api-errors.ts`: typed API error Implementation.
- `packages/platform-core/src/effect-api-cache.ts`: Effect cache service Implementation.
- `packages/platform-core/src/effect-api-rate-limit.ts`: HTTP and internal Effect rate-limit Implementation.
- `packages/platform-core/src/index.ts`: public export for shared runtime contracts.
- `apps/workspace/src/server/effect/route.ts`: Hono Adapter that runs Effect programs and maps typed outcomes to JSON responses.

## Workspace Consumers

- `apps/workspace/src/server/domains/partnerApps/handlers/admin-partner-apps.ts`: first Workspace admin partner handlers migrated away from repeated `try/catch`.
- `apps/workspace/src/server/domains/partnerApps/handlers/partner-apps.ts`: first Workspace partner catalog/grant handlers migrated to the route Adapter.
- `apps/workspace/src/server/cache/*`: existing cache readiness seam that now points to the shared cache Interface.

## Partners Consumers

- `apps/partners/app/api/partner-auth-rate-limit.ts`: app-local Next Adapter for shared HTTP rate-limit behavior.
- `apps/partners/app/api/partner-signup/route.ts`: uses the Partners auth rate-limit Adapter.
- `apps/partners/app/api/partner-signin/route.ts`: uses the Partners auth rate-limit Adapter.
- `apps/partners/rate-limits/memory.ts`: legacy ad hoc limiter, removed once callers use the shared Module.

## Tests

- `packages/platform-core/src/effect-api.test.ts`: typed errors, cache, and rate-limit behavior.
- `apps/workspace/src/server/effect/route.test.ts`: Hono Adapter response mapping and rate-limit headers.

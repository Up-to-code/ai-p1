# Changes

## 2026-05-16 Effect Runtime First Pass

- Created lifecycle docs for incremental Effect API runtime, DRY cache, and HTTP rate limiting.
- Planned the first implementation slice around a shared `platform-core` runtime Module and a Workspace Hono Adapter.
- Kept Hono and Next route entrypoints unchanged to avoid a broad router rewrite.
- Added shared typed API errors, Effect cache service, and in-memory HTTP rate-limit service in `@qentrah/platform-core`.
- Added the Workspace Hono `runEffectRoute` Adapter and migrated partner app/admin handlers to use it.
- Replaced Partners signup/signin local rate limiter with the shared rate-limit Interface and removed the app-local limiter.
- Re-exported cache keys/policies/read-through/invalidation from the Workspace cache seam.
- Ran focused platform, Workspace, Partners, and Admin tests/typechecks successfully.
- Split the `@qentrah/platform-core/effect-api` Implementation into error, cache, and rate-limit Modules while keeping the same public Interface.
- Added `routeSync` for Workspace Hono guard code and a Partners auth rate-limit Adapter to remove repeated header/429 ceremony.

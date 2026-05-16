# API Runtime Services

## Purpose

This lifecycle covers the shared server runtime used by Qentrah API entrypoints: Hono route handlers, Next route handlers, typed errors, request parsing, cache policy, and HTTP rate limiting.

## Owner

- Primary owner app: `apps/workspace`
- Shared runtime package: `packages/platform-core`
- Consuming apps in this pass: `apps/workspace`, `apps/partners`

## Entrypoints

- Workspace Hono API: `apps/workspace/src/server/app/app.ts`
- Workspace v1 routes: `apps/workspace/src/server/routing/v1/router.ts`
- Workspace partner routes: `apps/workspace/src/server/domains/partnerApps`
- Partners auth routes: `apps/partners/app/api/partner-signup/route.ts`, `apps/partners/app/api/partner-signin/route.ts`

## Current Status

Hono and Next remain the edge routers. Effect is introduced beneath those routers as a runtime and service Module so handlers can share typed errors, parsing, cache, and rate-limit behavior without a broad router rewrite.

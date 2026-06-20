# Error Handling Lifecycle

## Purpose
Centralize HTTP error classification, status mapping, and response construction across all workspace server domain handlers.

## Owner
`apps/workspace/src/server/utils/response/error-map.ts`

## Entrypoints
- `actionErrorJson(c, error, fallback)` — universal handler-level error responder
- `workspaceReadJson(c, label, operation)` — read-path wrapper with timeout
- `createCrudHandlers()` — factory-generated try/catch delegates to `actionErrorJson`
- `runEffectRoute()` — Effect-based pipeline (partner apps, richer response shape)

## Flow
1. Domain handler catches error
2. Calls `actionErrorJson(c, error, fallback)` (or `workspaceReadJson` for reads)
3. `classifyError(error)` checks: typed errors with `.status` → regex on message → fallback to INTERNAL
4. `errorStatus()` maps class to HTTP status
5. `errorMessage()` returns sanitized message (never leaks raw error.message for INTERNAL)
6. Returns `{ error: string }` JSON response

## Status
Stable. All write handlers use `actionErrorJson`. All read handlers use `workspaceReadJson`.

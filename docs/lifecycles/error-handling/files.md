# Files

## Core
- `src/server/utils/response/error-map.ts` — `classifyError()`, `errorStatus()`, `errorMessage()`, `httpStatusFromCode()`
- `src/server/utils/response/action-error.ts` — `actionErrorJson()`, `actionErrorStatus()`, `actionErrorMessage()`
- `src/server/domains/organization/handlers/workspace-read-helper.ts` — `workspaceReadJson()` with 10s timeout

## Migrated to unified pattern
- `src/server/domains/organization/handlers/get-profile.ts` — was leaking error.message, always 500
- `src/server/domains/organization/handlers/invite-links.ts` — had custom `errorResponse`, hardcoded 403
- `src/server/domains/organization/handlers/update-profile.ts` — had typed error catch, now uses classifyError
- `src/server/domains/organization/handlers/actions.ts` — had typed error catch, now uses classifyError
- `src/server/domains/agents/handlers/confirmations.ts` — hardcoded 400, now uses classifyError
- `src/server/domains/billing/handlers/billing.ts` — removed `handleBillingError` wrapper
- `src/server/domains/notifications/handlers/notifications.ts` — removed `notificationError` wrapper
- `src/server/domains/mcpConnections/handlers/mcp-connections.ts` — removed `handleError` wrapper
- `src/server/domains/organization/handlers/api-keys.ts` — removed `handleError` wrapper

## Specialized (kept as-is)
- `src/server/domains/agents/handlers/read.ts` — requestId tracking, structured logging, 409/502
- `src/server/domains/partnerApps/handlers/resources.ts` — Response passthrough pattern
- `src/server/effect/route.ts` — Effect-based pipeline with richer response shape

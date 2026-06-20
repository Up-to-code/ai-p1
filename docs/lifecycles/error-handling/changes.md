# Changes

## 2026-06-20 — Unify domain error handling
- Added `hasStatus()` check to `classifyError()` so typed errors with `.status` property are classified by HTTP status (401→UNAUTHENTICATED, 403→FORBIDDEN, 404→NOT_FOUND, 400/422→VALIDATION, 429→RATE_LIMITED, >=500→INTERNAL)
- Migrated 9 handler files from ad-hoc error handling to `actionErrorJson()`
- Removed 4 thin wrapper functions (`handleBillingError`, `notificationError`, `handleError`×2, `errorResponse`, `handleActionError`)
- Removed unused `OrganizationProfileUpdateError` and `OrganizationActionError` imports from handlers (still used in service layer)
- Left `agents/read.ts` (specialized: requestId, logging, 409/502), `partnerApps/resources.ts` (Response passthrough), and Effect handlers untouched

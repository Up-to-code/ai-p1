# Changes

## 2026-05-16 Architecture Deepening Pass

- Split target-specific backfill behavior into `security/backfillTargets.ts` so the job runner owns scheduling/progress while target Adapters own table reads, id normalization, idempotency checks, and patch creation.
- Added Adapter-level tests for soft-delete idempotency, already-protected payload no-ops, and encrypted/redacted text patch creation.
- Re-ran focused Workspace tests, Workspace typecheck, and Convex codegen successfully.

## 2026-05-16

- Created lifecycle folder for enterprise data security and retention hardening.
- Captured target scope: encrypted partner payloads, reduced raw AI/tool storage, active-record indexes, strict service tokens, and migration-safe partner connection cleanup.
- Added organization-scoped AES-GCM helpers for encrypted text/JSON and redacted previews.
- Changed new partner inbound/outbound webhook payload writes to store encrypted payloads with redacted legacy placeholders and 90-day retention metadata.
- Changed new agent messages, summaries, memory facts, and tool previews to store encrypted values with redacted legacy text fields.
- Removed broad service-token fallbacks from Workspace Convex bridge functions and Admin Convex real-data access.
- Added `isDeleted` schema/index support for projects, properties, and clients, and set the flag on new create/delete writes.
- Updated environment docs and production checks so `ADMIN_CONVEX_SERVICE_TOKEN`, `WORKSPACE_CONVEX_BRIDGE_SECRET`, `WORKSPACE_ADMIN_SERVICE_TOKEN`, and encryption keys stay distinct.

## 2026-05-16 Second Pass

- Added shared `clientPii` helpers and wired user, partner API, organization API key, MCP, and inbound webhook client writes through encrypted client PII storage.
- Added `security/backfill:runDataSecurityBackfill`, protected by `ADMIN_CONVEX_SERVICE_TOKEN`, to batch-upgrade legacy plaintext client PII, webhook payloads, agent messages/memory, and `isDeleted` flags.
- Kept read compatibility by revealing encrypted client PII server-side and falling back to legacy plaintext while migration is incomplete.
- Re-ran Convex codegen, Workspace typecheck, and focused Workspace/Admin tests successfully.

## 2026-05-16 Production Backfill Pass

- Replaced the one-shot backfill mutation with persisted `dataSecurityBackfillJobs` and `dataSecurityBackfillFailures` tables.
- Added cursor-driven per-target jobs with batch size limits, progress counters, status, cursor, errors, and completion timestamps.
- Split CPU-heavy encryption into `runBackfillBatch` internal action and writes into `applyBatch` internal mutation.
- Added self-scheduling with `ctx.scheduler.runAfter()` so large backfills run in bounded chunks instead of one long transaction.
- Preserved the old `runDataSecurityBackfill` entrypoint as a compatibility wrapper that creates scheduled jobs.
- Re-ran Convex codegen, Workspace typecheck, and focused Workspace/Admin tests successfully.

## 2026-05-16 Cleanup Pass

- Kept the cursor-driven backfill architecture unchanged.
- Tightened the public `listDataSecurityBackfillJobs` return validator so job status/progress reads are explicit instead of broad `v.any()`.
- Left cross-table patch payloads as a dynamic internal mutation boundary because each backfill target writes a different table shape.

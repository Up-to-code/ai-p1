# Changes

## 2026-05-28 Workspace Read Stats Count Surface

- Added `convex/workspace/readSurface.ts` so project, property, client, calendar, and task read queries share active-row filtering, updated ordering, chronological ordering, due-date ordering, bounded option limits, capped search rows, and active page presentation behind one Convex read Module.
- Deepened `convex/workspace/readStats.ts` so client, project, property, calendar, and audit stats share one internal counting seam for active rows, field buckets, unique owners, and category totals.
- Deepened `convex/workspace/dashboardOverview.ts` so Dashboard active-row selection, count composition, project card projection, and week-event enrichment are separate internal seams behind the same overview Interface.
- Preserved stable Convex callers, stat keys, soft-delete behavior, and response shapes while keeping the read stats tests as the Module interface surface.

## 2026-05-28 Workspace Read Stats Depth

- Added `convex/workspace/readStats.ts` so hot project, property, client, calendar, and audit stats queries share soft-delete filtering and count calculation behind one Module.
- Added `convex/workspace/dashboardOverview.ts` so Dashboard count composition, project card projection, event ordering, and client/task enrichment sit behind one Module.
- Preserved stable Convex query function names, permission checks, scan limits, return shapes, and PII reveal behavior.
- Added focused tests for shared soft-delete filtering and client/project/property stats.

## 2026-05-28 Runtime Architecture Deepening

- Kept the backfill runner as the scheduling/progress owner while making `security/backfillTargets.ts` an explicit Adapter registry for table reads, id normalization, protection checks, and patch creation.
- Added the shared Convex `serviceTokens` Module and moved admin, backfill, billing bridge, partner resource, and webhook bridge assertions through it without changing env names or error messages.
- Split partner webhook URL safety, signing-secret crypto, inbound/outbound delivery state, and retry behavior into internal Modules behind the stable `partnerApps.webhooks` Convex facade.
- Added focused tests for webhook URL/signature/retry behavior, request safety, workspace read surface parsing, and existing backfill Adapter behavior.

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

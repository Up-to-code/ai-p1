# Flow

Old/current flow before this hardening:
1. Workspace stores core business records in organization-scoped Convex tables.
2. Partner inbound events and outbound deliveries store raw `payload: v.any()`.
3. Agent messages, tool previews, summaries, and facts are stored as plain text.
4. Hot lists use organization indexes, then filter `deletedAt` after the read.
5. Admin and bridge calls can fall back to broader service tokens in some paths.
6. Partner connection schema temporarily accepts both legacy and new field names.

Target flow after this pass:
1. Organization-scoped records remain the source of truth.
2. Partner inbound and outbound webhook payloads are stored in encrypted fields. The legacy `payload` field receives a redacted placeholder for new writes while old plaintext rows remain readable.
3. Agent user/assistant messages, summaries, memory facts, and tool previews are stored encrypted with redacted legacy text fields for new writes.
4. Hot query paths prefer active-record indexes that exclude soft-deleted records from normal reads.
5. New project/property/client writes include `isDeleted: false`, and deletes set `isDeleted: true`. Existing rows still need a backfill before reads can rely only on active-record indexes.
6. Service-token boundaries are separated: admin Convex, Workspace admin API, and Workspace Convex bridge.
7. Compatibility fields stay only until a data backfill removes legacy partner connection fields.
8. Agent tool approvals store full inputs encrypted, expose only redacted previews to models/MCP clients, and require user or admin approval before any approved write is executed.

Enterprise agent safety controls:
1. Agent and MCP tool catalogs declare risk level, approval requirement, and data sensitivity.
2. The policy gateway denies unknown or incomplete tools by default.
3. Tool input/output previews are redacted before audit, model-visible, or MCP-visible use.
4. Admin-impact approvals are separated from ordinary user confirmations and should be reviewed through operator-controlled workflows.

Backfill flow after production hardening:
1. Admin operator calls `security/backfill:startDataSecurityBackfill` with `ADMIN_CONVEX_SERVICE_TOKEN`, optional target list, and optional batch size.
2. The mutation creates one `dataSecurityBackfillJobs` row per target and schedules `runBackfillBatch`.
3. `runBackfillBatch` is an internal action. It reads a cursor page through `readBatch`, asks the target Adapter to perform CPU-heavy encryption/redaction outside the write transaction, then calls `applyBatch`.
4. `applyBatch` is an internal mutation. It patches only the current page, records progress, persists the cursor, writes dead-letter rows to `dataSecurityBackfillFailures`, and marks completed jobs.
5. Target Adapters own table selection, id normalization, already-protected checks, patch construction, and per-row failure capture. The job runner owns scheduling, cursor state, progress, and retry/backpressure only.
6. The action self-schedules the next batch with `ctx.scheduler.runAfter()`. Each target is isolated so one table failure does not stop the others.
7. Operators monitor `security/backfill:listDataSecurityBackfillJobs`; completion means all target jobs are `completed` and failure rows have been reviewed.

Upstream dependencies:
- Infisical/Vercel/Convex environment variables must provide strong random secrets.
- Hono services call Convex public functions for resource bridges.
- Admin UI calls Convex through `ConvexHttpClient`.

Downstream dependencies:
- Partner webhooks need decrypted outbound payloads at delivery time.
- Admin summaries must avoid exposing raw secrets or payloads.
- Agent context retrieval must not leak tool previews or memory facts beyond authorized organization reads.

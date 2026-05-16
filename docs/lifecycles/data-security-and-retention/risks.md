# Risks

- Encryption key rotation is not fully modeled yet. Existing encrypted payloads require the same `ORGANIZATION_DATA_ENCRYPTION_KEY` unless key versioning is added.
- Legacy plaintext webhook secrets and payloads may exist from prior deployments. Readers must tolerate old data until migration is complete.
- Making schema fields optional for migration safety can hide incomplete backfills if not tracked.
- Removing service-token fallbacks can break local/dev environments that only set the legacy token.
- Soft-delete index migration must be staged carefully because existing documents need backfilled active/deleted marker fields before reads can depend entirely on `isDeleted` indexes.
- Agent messages can contain secrets or PII. This pass encrypts new content and redacts legacy fields, but existing plaintext rows need migration/rotation handling.
- New client CRM writes now encrypt contact, phone, nationality, and budget while keeping revealed values available through server-side reads. Existing rows require `security/backfill:runDataSecurityBackfill`.
- Client search currently decrypts a bounded recent page before filtering. This is safer than plaintext storage but not a final enterprise search design; use search indexes or blind indexes for large tenants.
- Backfill is now cursor-driven and resumable, but still needs an operator runbook for production rate limits, alerting, and failure review.
- Encryption happens in an internal action and persistence in an internal mutation. This is safer for Convex transaction limits, but large tenants still need conservative batch sizes and live-traffic monitoring.
- Target Adapter tests cover patch creation and idempotent no-ops, but a full Convex scheduled-job harness is still needed to prove cursor resumption and dead-letter review end-to-end.

# Tests

Existing coverage to preserve:
- Workspace Convex codegen/typecheck.
- Partner app connection and resource access tests.
- Admin real-data adapter tests.
- Production env shape check.

Commands to run during this lifecycle:
- `npm --workspace @qentrah/workspace run codegen:convex` (passed 2026-05-16)
- `npm --workspace @qentrah/workspace run typecheck` (passed 2026-05-16 after production backfill pass)
- `npm --workspace @qentrah/workspace run codegen:convex` (passed 2026-05-16 cleanup pass)
- `npm --workspace @qentrah/workspace run typecheck` (passed 2026-05-16 cleanup pass)
- `npm --workspace @qentrah/admin-review run typecheck` (passed 2026-05-16)
- `npm --workspace @qentrah/workspace test -- convex/partnerApps/apps.test.ts src/server/domains/partnerApps/services/access-token.test.ts src/server/domains/partnerApps/validation/partner-app.schema.test.ts` (passed 2026-05-16)
- `npm --workspace @qentrah/workspace test -- src/server/domains/partnerApps convex/partnerApps` (passed 2026-05-16 cleanup pass)
- `npm --workspace @qentrah/admin-review test -- src/lib/admin-convex.test.ts src/app/api/admin/admin-route.test.ts` (passed 2026-05-16)
- `npm --workspace @qentrah/workspace test -- src/server/domains/partnerApps convex/security/backfillTargets.test.ts src/domains/integrations/store/integrations.view-model.test.ts` (passed 2026-05-16 architecture deepening pass)
- `npm --workspace @qentrah/workspace run typecheck` (passed 2026-05-16 architecture deepening pass)
- `npm --workspace @qentrah/workspace run codegen:convex` (passed 2026-05-16 architecture deepening pass)

Missing coverage to consider:
- Encryption roundtrip for partner webhook payload storage.
- Redaction tests for agent tool previews.
- Query behavior for active-record indexes after soft delete.
- Admin token fallback rejection.
- Direct test for cursor-driven `security/backfill:startDataSecurityBackfill` once a Convex function harness is added for scheduled jobs and encrypted document assertions.

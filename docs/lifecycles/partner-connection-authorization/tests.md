# Tests

## Existing Coverage

- Partner access tests cover bearer header enforcement, legacy OAuth rejection, organization API key access, and key permission routing.
- Partner authorization service tests cover catalog verification, organization grant mutation, and connection updates.
- MCP connection tests cover permission normalization, built-in role defaults, and source-level protection against Better Auth role adapter reads.

## Required Checks For This Change

- `npm --workspace @qentrah/workspace run test -- src/server/domains/partnerApps/services/partner-resource-access.test.ts src/server/domains/partnerApps/services/organization-api-key-access.test.ts src/server/domains/partnerApps/handlers/resources-source.test.ts` - passed 2026-06-06 architecture cleanup.
- `npm --workspace @qentrah/workspace run test -- src/server/domains/partnerApps` - passed 2026-06-06 architecture cleanup.
- `npm --workspace @qentrah/workspace run typecheck` - passed 2026-06-06 architecture cleanup.
- `npm --workspace @qentrah/partner-auth-core test` - passed 2026-05-16.
- `npm --workspace @qentrah/partner-auth-core run typecheck` - passed 2026-05-16.
- `npm --workspace @qentrah/workspace test -- src/server/domains/partnerApps convex/partnerApps/migrations.test.ts` - passed 2026-05-16.
- `npm --workspace @qentrah/workspace run codegen:convex` - passed 2026-05-16.
- `npm --workspace @qentrah/workspace run typecheck` - passed 2026-05-16.
- `npm --workspace @qentrah/auth-sdk test` - passed 2026-05-16.
- `npm --workspace @qentrah/workspace test -- src/server/domains/partnerApps convex/partnerApps` - passed 2026-05-16 cleanup pass.
- `npm --workspace @qentrah/admin-review test` - passed 2026-05-16 cleanup pass.
- `npm --workspace @qentrah/admin-review run typecheck` - passed 2026-05-16 cleanup pass.
- `npm --workspace @qentrah/partners test` - passed 2026-05-16 cleanup pass.
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-16 cleanup pass.
- `npm --workspace @qentrah/workspace test -- src/server/domains/partnerApps convex/partnerApps` - passed 2026-05-16 source-of-truth cleanup.
- `npm --workspace @qentrah/workspace run typecheck` - passed 2026-05-16 source-of-truth cleanup.
- `npm --workspace @qentrah/partners test` - passed 2026-05-16 source-of-truth cleanup.
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-16 source-of-truth cleanup.
- `npm --workspace @qentrah/admin-review test` - passed 2026-05-16 source-of-truth cleanup.
- `npm --workspace @qentrah/admin-review run typecheck` - passed 2026-05-16 source-of-truth cleanup.
- Manual local API check: Partners admin apps, Partners published apps, and Workspace integrations catalog returned the approved WhatsApp partner app after local env wiring.
- `npm --workspace @qentrah/partner-workspace-sync test` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/partner-workspace-sync run typecheck` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/workspace test -- src/server/domains/partnerApps convex/security/backfillTargets.test.ts src/domains/integrations/store/integrations.view-model.test.ts` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/workspace run typecheck` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/workspace run codegen:convex` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/partners test` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/admin-review test` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/admin-review run typecheck` - passed 2026-05-16 architecture deepening pass.
- `npm --workspace @qentrah/workspace run dev:convex:once` - passed 2026-05-16 emergency data compatibility unblock after temporary compatibility schema deployment.
- `npx convex run partnerApps/migrations:previewPartnerConnectionFieldCutover '{"limit":1000}'` - found two migratable records, then passed with `needsMigration: 0` after backfill.
- `npx convex run partnerApps/migrations:backfillPartnerConnectionCanonicalFields '{"limit":500}'` - patched two records with zero blocked.
- `npm --workspace @qentrah/workspace test -- convex/partnerApps/migrations.test.ts` - passed 2026-05-16 emergency data compatibility unblock.
- `npm --workspace @qentrah/partners test -- server/platformApi.test.ts` - passed 2026-05-16 published catalog cache fix.
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-16 published catalog cache fix.
- `npm --workspace @qentrah/partners test -- server/adminPartnerApps.test.ts server/qentrahWorkspace.test.ts` - passed 2026-05-28 Partners OAuth runtime sync status depth.
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-28 Partners OAuth runtime sync status depth.
- `npm --workspace @qentrah/partners test` - passed 2026-05-28 Partners OAuth runtime sync status depth.
- `npm --workspace @qentrah/partners test -- server/serviceTokens.test.ts server/platformApi.test.ts` - passed 2026-05-28 Partners service token gate depth.
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-28 Partners service token gate depth.
- `npm --workspace @qentrah/partners test` - passed 2026-05-28 Partners service token gate depth.
- `npm --workspace @qentrah/partners test -- server/partnerAppCatalog.test.ts server/adminPartnerApps.test.ts server/platformApi.test.ts` - passed 2026-05-28 Partners app catalog projection depth.
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-28 Partners app catalog projection depth.
- `npm --workspace @qentrah/partners test` - passed 2026-05-28 Partners app catalog projection depth.

## Manual Checks

- Confirm a connection created from consent stores only the requested resource scopes.
- Confirm old connection documents are migrated before strict schema deployment.

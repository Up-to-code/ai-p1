# Migration Risks & Mitigations

## CRITICAL: Permission Gap During Cutover

| Risk | Severity | Mitigation |
|---|---|---|
| `requireWorkspaceAccess` denies legitimate users during Phase 2 | **Critical** | Feature flag `FF_ENFORCE_PERMISSIONS`; deploy with gradual % rollout |
| `workspaceMembers` table is out of sync with Clerk org members | **High** | Cron job syncs every 5 min during Phase 0-1; manual reconcile tool |
| API keys lose access when `workspaceId` becomes NOT NULL | **High** | Backfill API keys with `workspaceId` BEFORE making it non-nullable |

## Data Integrity

| Risk | Severity | Mitigation |
|---|---|---|
| `projectSpaces → spaces` migration loses slug uniqueness | **High** | `by_workspace_slug` index prevents duplicates; pre-check in migration |
| Dual-write creates inconsistent `workspaceId` on partial failures | **Medium** | Use Convex transaction-level writes; validate with nightly audit |
| Soft-delete migration misses rows that have `isDeleted=true` but no `deletedAt` | **Medium** | Pre-scan: `WHERE isDeleted = true AND deletedAt IS NULL`, set `deletedAt` before migration |
| PII access audit has gaps because `logAccess` is not called from all client read paths | **Medium** | Audit: wrap all PII reads through a shared `decryptAndAudit` helper |

## Performance

| Risk | Severity | Mitigation |
|---|---|---|
| `getEffectivePermissions` does 3 index queries per request | **Medium** | Cache `EffectiveRole` in `AuthContext` for the request lifetime |
| `wouldCreateCycle` BFS on every dependency create is O(n) | **Low** | Add `maxDepth = 100` limit; denormalize `dependsOn` array on tasks for fast reads |
| Compound indexes increase write latency | **Low** | Only add indexes proven by query patterns; remove unused indexes after profiling |

## Rollback Plan

```
1. Feature flag FF_WORKSPACE_HIERARCHY = "0"
   → All new code paths disabled, old Organization-scoped paths used
2. Re-run migration_archives restore script
   → projectSpaces restored, workspaceId unlinked
3. Set FF_ENFORCE_PERMISSIONS = "0"
   → Permission system returns to no-op
```

**Testing**: Before every phase, run the full backfill against a Convex snapshot clone and compare query results.

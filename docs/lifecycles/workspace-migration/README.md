# Workspace Migration Plan

Migrate from the current Organization-scoped hierarchy to the new Workspace-first model.

## Current State
- `organizationId` as the tenant boundary (from Clerk)
- `projectSpaces` as children of `projects`
- Permission system is a no-op
- Inconsistent soft-delete (`isDeleted` + `deletedAt`)
- No `workspaces`, `workspaceMembers`, `spaces`, `projectMembers` tables
- No milestone or dependency tracking

## Target State
- `workspaceId` as the tenant boundary on every business table
- `spaces` as parents of `projects`
- Fully enforced permission system (workspace → space → project)
- Consistent `deletedAt`-only soft-delete
- `milestones`, `taskDependencies`, `projectMembers`, `piiAccessAudit` tables

## Phase Plan

### Phase 0: Foundation + Dual-Write (SAFETY FIRST)
Duration: 1 week

**Goal**: Introduce `workspaceId` as nullable on all tables, set up dual-write to validate correctness without breaking production.

**Steps**:
1. Add `workspaceId: v.optional(v.id("workspaces"))` to all business tables (non-breaking)
2. Create `workspaces` table + backfill script that maps `organizationId → workspaceId`
3. Enable dual-write mode: on every `create` mutation, write both `organizationId` AND `workspaceId`
4. Set up a validation job that compares reads by `organizationId` vs `workspaceId` — log mismatches
5. Run validation job against a copy of production data (Convex snapshot)
6. Add new tables (`workspaceMembers`, `spaces`, `projectMembers`, `milestones`, `taskDependencies`, `piiAccessAudit`) — empty, no reads yet

**Verification**: Dual-write produces zero mismatches over 24h.

**Deployment**: Feature flag `FF_WORKSPACE_HIERARCHY`; all new code behind flag.

### Phase 1: Backfill
Duration: 1 week

**Goal**: Populate `workspaceId` on all existing rows and seed new tables from existing data.

**Steps**:
1. Run backfill script to populate `workspaceId` on all existing `projects`, `tasks`, `clients`, `deals`, `opportunities`, `calendarEvents`, `docs`, `mediaAssets`, `customFieldDefinitions`
2. Seed `workspaceMembers` from Clerk org memberships (or `organizationInviteLinks`)
3. Migrate `projectSpaces` → `spaces` (promote to top-level, keep `projectId` as optional link)
4. Backfill each `space` with `workspaceId` from its parent project's organization
5. Verify: every row with `organizationId` has a matching `workspaceId`

**Rollback**: Re-run with `migrationArchives` for full restore capability.

### Phase 2: Permission Enforcement
Duration: 1 week

**Goal**: Enable real permission checking.

**Steps**:
1. Deploy `requireWorkspaceAccess` in all Convex queries (behind `FF_ENFORCE_PERMISSIONS`)
2. Test with existing roles — ensure owner/admin/member/viewer all work
3. Make `workspaceId` NOT NULL on all tables
4. Remove `assertOrganizationResourcePermission` no-op fallback
5. Deploy `requireSpaceAccess` for space-scoped operations

**Cutover**: Set `FF_ENFORCE_PERMISSIONS = "1"` in production. Monitor for 403 errors.

### Phase 3: Space Promotion
Duration: 1 week

**Goal**: Make `spaces` the parent of `projects`.

**Steps**:
1. Add `spaceId: v.optional(v.id("spaces"))` to `projects` table
2. Migration: for each `projectSpaces` row, set the matching `project.spaceId`
3. Update frontend routing: `/[workspaceSlug]/spaces/[spaceSlug]/projects/[projectId]`
4. Remove `projectSpaces` old table reads
5. Deprecate `projectSpaces` table (keep for rollback)

### Phase 4: Cleanup
Duration: 2 weeks

**Goal**: Remove all legacy Organization-scoped artifacts.

**Steps**:
1. Drop `isDeleted` references across the codebase — use `deletedAt` only
2. Remove `projectSpaces` table
3. Remove `recordLinks` table (replaced by explicit FK fields)
4. Remove `organizationId` columns (where superseded by `workspaceId`)
5. Remove `clientFollowUps` (superseded by calendar events + tasks)
6. Audit: run full integration test suite

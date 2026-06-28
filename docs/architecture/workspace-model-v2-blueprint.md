# Workspace-First Model v2 — Blueprint

## Overview

Complete re-architecture from Organization-scoped hierarchy to Workspace-first multi-tenant model.

## Files Created/Modified

### Schema & Core
- `convex/schema.ts` — Full new schema with workspaces, spaces, milestones, dependencies, projectMembers, PII audit
- `convex/shared/present.ts` — Updated: removed `isDeleted`, consistent `deletedAt`-only
- `convex/shared/soft-delete.ts` — New: `filterActive()`, `activeRows()`, `paginateActive()`
- `convex/workspace/readSurface.ts` — Updated: uses new `soft-delete` helpers
- `convex/workspace/readStats.ts` — Updated: uses new `soft-delete` helpers

### Permissions
- `convex/auth/permissions.ts` — New: `requireWorkspaceAccess()`, `requireSpaceAccess()`, `getEffectivePermissions()`, full permission matrix with workspace + space + project roles

### Domain Files
- `convex/projects/milestones/validators.ts` — Milestone schema validators
- `convex/projects/milestones/read.ts` — `listByProject`, `listBySpace`, `get`, `options`
- `convex/projects/milestones/write.ts` — `create`, `update`, `remove` with audit logging
- `convex/tasks/dependencies/validators.ts` — Dependency type validators
- `convex/tasks/dependencies/read.ts` — `listByTask`, `listByProject`, `get`
- `convex/tasks/dependencies/write.ts` — `create` (with cycle detection), `remove`
- `convex/projects/projectMembers/validators.ts` — Project member role validators
- `convex/projects/projectMembers/write.ts` — `addMember`, `removeMember`
- `convex/pii/read.ts` — `listAccessAudit` (admin-only view)
- `convex/pii/write.ts` — `logAccess` (automatic PII access logging)

### Documentation
- `docs/architecture/workspace-model-v2-blueprint.md` — This file
- `docs/lifecycles/workspace-migration/README.md` — Migration plan (5 phases)
- `docs/lifecycles/workspace-migration/backfill-scripts.md` — Migration scripts
- `docs/lifecycles/workspace-migration/risks.md` — Risk register
- `docs/lifecycles/workspace-migration/performance.md` — Index strategy, caching, aggregate patterns

## Key Changes Summary

### 1. Schema Refinements
- **milestones** table with status lifecycle (pending→inProgress→completed/delayed/cancelled), linked to projects + optional spaces
- **taskDependencies** table with `depends_on`/`blocks`/`relates_to` types, cycle detection via BFS
- **projectMembers** for fine-grained project-level access (manager/editor/viewer/guest)
- **piiAccessAudit** for compliance-grade PII access tracking
- **Consistent soft-delete**: all tables use only `deletedAt`; `isDeleted` removed entirely

### 2. Permissions
- **Three-layer permission model**: workspace → space → project
- `requireWorkspaceAccess(workspaceId, resource, action)` — tenant gate
- `requireSpaceAccess(workspaceId, spaceId, resource, action, options?)` — space-level with optional project scope check
- `getEffectivePermissions(workspaceId)` — builds full `EffectiveRole` from workspace + space + project memberships
- `createCapabilitiesQuery` — public query for UI to pre-fetch permission bundle
- Role matrix defined for owner/admin/member/viewer at workspace, manager/editor/viewer at space, manager/editor/viewer/guest at project

### 3. Compound Indexes
- `by_workspace_project_space` on tasks + calendarEvents for scoped queries
- `by_workspace_deleted_updated` on all tables for efficient active-item listing
- `by_workspace_milestone` on tasks for milestone grouping
- `by_workspace_space_project` on projects for space-scoped project listing
- Every index starts with `workspaceId` for tenant isolation

### 4. Migration Safety
- **Phase 0**: Dual-write validation before full cutover
- **Feature flag** controlled: `FF_WORKSPACE_HIERARCHY`, `FF_ENFORCE_PERMISSIONS`
- **Snapshot testing**: run backfill against Convex clone before production
- **Rollback scripts**: `migrationArchives` preserves every transformed record

# T02-002 - Convex Table Reset

Status: [x]
Workstream: Backend Schema
Depends on: T01-001, T02-001

Goal:
Make Convex tables match the Work OS record model.

Inputs:
- `apps/workspace/convex/schema.ts`
- Existing Convex domain folders

Steps:
- Ensure tables exist for clients, opportunities, projects, tasks, calendar events, assets, automations, custom fields, record links, and templates.
- Remove or rename property/unit/clientTasks tables from active schema.
- Align table field names with domain contracts.
- Add indexes needed by list, board, detail, and linked-record reads.

Traps:
- Do not keep legacy table names for convenience when the product is unpublished.
- Do not over-index before T02-003 defines query needs.

Acceptance:
- Convex schema uses Work OS core records.
- No first-class property/unit schema remains.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- `npm --workspace @qentrah/workspace test -- convex/workspace/readStats.test.ts`

Completion note:
Completed. `apps/workspace/convex/schema.ts` now uses Work OS tables for clients, opportunities, projects, tasks, calendar events, assets, automations, custom fields, record links, and workspace templates. First-class property/unit tables are removed from the active schema, and stale `clientTasks`/client-asset callers compile through the new `tasks` and `recordLinks` storage model. Existing UI surfaces still have temporary presentation aliases for old cards/forms; those are intentionally left for the dedicated UI rewrite tasks.

Evidence:
- `npm --workspace @qentrah/workspace run typecheck`
- `npm --workspace @qentrah/workspace test -- convex/workspace/readStats.test.ts convex/workspace/dashboardOverview.test.ts src/server/domains/assets/asset-payload.schema.test.ts src/server/domains/calendar/validation/calendar.schema.test.ts src/server/domains/clients/validation/client.schema.test.ts src/server/domains/clientTasks/validation/client-task.schema.test.ts src/domains/clients/client-view-model.test.ts src/domains/clients/api/client-tasks-request.test.ts`
- `git diff --check -- apps/workspace/convex apps/workspace/src/server apps/workspace/src/domains plan/work-os-hard-reset-v1/02-backend-schema/t02-002-convex-table-reset.md plan/work-os-hard-reset-v1/tasks.md`

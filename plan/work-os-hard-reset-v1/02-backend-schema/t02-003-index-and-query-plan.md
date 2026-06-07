# T02-003 - Index And Query Plan

Status: [x]
Workstream: Backend Schema
Depends on: T02-002

Goal:
Define query indexes for scalable list, board, detail, and linked-record reads.

Inputs:
- Convex schema
- UI module requirements
- Existing query load guard tests

Steps:
- List every query needed by record modules.
- Map each query to a Convex index.
- Identify pagination requirements.
- Update tests that prevent broad scans.

Traps:
- Do not rely on full table scans for module list screens.
- Do not create indexes for fields that do not exist in final models.

Acceptance:
- Every core list/board/detail query has an index strategy.
- Query load guard tests reflect Work OS modules.

Tests:
- `npm --workspace @qentrah/workspace test -- src/domains/convex/query-load-guard.test.ts`

Completion note:
Completed. Core Work OS read paths now have an explicit index strategy, and the load guard test protects those paths against legacy property/reference assumptions and unbounded reads.

Query and index map:

| Module | Query/read shape | Index strategy | Pagination/bounds |
| --- | --- | --- | --- |
| Projects | list cards, paged list, board filters | `projects.by_organization_updated`, `projects.by_organization_status`, `projects.by_organization_deleted_status_updated` | `listPaged` uses `paginationOpts`; search scans latest bounded rows |
| Projects | detail read | direct `ctx.db.get(projectId)` after organization check | single document |
| Projects | options picker | `projects.by_organization_updated` | bounded by `boundedWorkspaceReadLimit` |
| Assets | list cards, paged list, status filters | `assets.by_organization_updated`, `assets.by_organization_status`, `assets.by_organization_deleted_status_updated` | `listPaged` uses `paginationOpts`; search scans latest bounded rows |
| Assets | detail read | strict Convex id normalization plus direct `ctx.db.get(assetId)` | single document |
| Assets by project | project detail linked assets | `recordLinks.by_source` using source `project`, then bounded asset lookups | bounded by `MAX_LINKED_PROJECT_ASSETS` |
| Clients | list cards, paged list, type filters | `clients.by_organization_updated`, `clients.by_organization_type`, `clients.by_organization_deleted_type_updated` | `listPaged` uses `paginationOpts`; search scans latest bounded rows |
| Clients | detail read | direct `ctx.db.get(clientId)` after organization check | single document |
| Client/asset links | client detail assets and asset detail clients | `recordLinks.by_source` and `recordLinks.by_target` | bounded to 100 linked records |
| Tasks | list and assignee filter | `tasks.by_organization_id`, `tasks.by_organization_assignee` | bounded to `MAX_LIST_TASKS` |
| Tasks | options/due ordering | `tasks.by_due` | bounded options read |
| Calendar | range, upcoming, dashboard range | `calendarEvents.by_start` | bounded range reads |
| Calendar | list | `calendarEvents.by_organization_id` | bounded list read |
| Custom fields | record fields and definition lookup | `customFieldValues.by_organization_record`, `customFieldDefinitions.by_organization_key` | scoped lookup |
| Automations | list and enabled filter | `automations.by_organization_id`, `automations.by_organization_enabled` | scoped list/read |
| Workspace templates | template lookup | `workspaceTemplates.by_key`, `workspaceTemplates.by_organization_key` | scoped lookup |
| MCP tools | cursor-aware list tools | per-record `by_organization_updated`, `by_start`, `partnerResourceMappings.by_organization_resource` | max list limit 50 with cursor |

Code changes:
- `apps/workspace/convex/assets/read.ts` now resolves project-linked assets through `recordLinks.by_source` instead of returning an empty placeholder.
- `apps/workspace/src/domains/convex/query-load-guard.test.ts` now checks Work OS modules, core schema indexes, strict asset ids, cursor-aware MCP lists, and linked-record indexes.

Evidence:
- `npm --workspace @qentrah/workspace test -- src/domains/convex/query-load-guard.test.ts`
- `npm --workspace @qentrah/workspace run typecheck`

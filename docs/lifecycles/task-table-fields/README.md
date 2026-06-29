# Task Table Fields

Right-side **Fields** panel + server-side group-by for the AG Grid–backed
Qentrah Task Table view.

## Purpose

Give workspace users a ClickUp-style:

1. **Inline popover editors** for the built-in columns: status, assignee,
   due date, priority. Click a cell → popover anchored to the cell with
   grouped options / calendar / member search.
2. **Group by** control in the toolbar: group rows by status, priority,
   assignee, or due-date bucket (overdue / today / tomorrow / this week /
   this month / later / no date). Choice persists in `localStorage`
   keyed by project.
3. **Right-side Fields panel** for adding custom columns: Dropdown, Text,
   Date, Number, Labels, etc. New fields are persisted in Convex
   (`customFieldDefinitions` + `customFieldValues` tables) and appear
   as live columns.

## Owner

- **Package**: `@qentrah/ui` (editors, popover primitive, cell renderers)
- **Convex**: `apps/workspace/convex` (`clientTasks/read.listGrouped`,
  `customFields/*`)
- **App**: `apps/workspace/src/domains/projects/components/project-detail-overview.tsx`
  (TaskTableView), `apps/workspace/src/domains/tasks/components/*`

## Entry points

- `apps/workspace/src/domains/projects/components/project-detail-overview.tsx` —
  `TaskTableView` (the table itself, includes the toolbar + panel mount)
- `apps/workspace/src/domains/tasks/components/task-table-toolbar.tsx` —
  `TaskTableToolbar` (Group by / Filter / Sort / Fields / search / +Task)
- `apps/workspace/src/domains/tasks/components/task-table-fields-panel.tsx` —
  `TaskTableFieldsPanel` (right-side slide-in)
- `apps/workspace/src/domains/tasks/api/fields.ts` — `useFieldDefinitionsQuery`,
  `useFieldValuesQuery`, `createCustomFieldRequest`,
  `updateCustomFieldDisplayRequest`, `deleteCustomFieldRequest`,
  `setCustomFieldValueRequest`
- `apps/workspace/src/domains/tasks/api/tasks.ts` — `useTasksGroupedQuery`,
  `readPersistedGroupBy`, `writePersistedGroupBy`
- `packages/ui/src/qentrah-table/cell-renderers/editors/*` — `StatusEditor`,
  `AssigneeEditor`, `DateEditor`, `PriorityEditor`, `TextEditor`,
  `NumberEditor`, `DropdownEditor`, `LabelsEditor`, `UrlEditor`

## Current Status

- Phases A → D complete. AG Grid table renders with status pill, priority
  flag, assignee avatar, due date, plus any user-created custom columns.
- Group by supports `status | priority | assignee | dueDate` (the
  `assignee` group uses the local `memberNameById` to label groups).
- Right-side Fields panel toggles a 340px slide-in with Create new /
  Add existing tabs, Popular / All type list, search.
- Custom field values are written via
  `customFieldValues.upsertFromHono`; reads via
  `customFieldValues.listByOrganization`.

## Known follow-ups

- AG Grid Community does not support row-grouping as a first-class
  feature; we render the groups client-side from
  `useTasksGroupedQuery`'s `flat` array. The server still does the
  grouping (server-side, as agreed) and the client only flattens into
  a list of `{ __groupKey, __groupLabel, __groupCount, …task }` rows.
- The Convex `customFields` query API uses Hono endpoints (not the
  generated `api.customFields.*` codegen path yet). When the project
  runs `npx convex codegen`, the field wrappers can drop the
  `listByOrganization ?? listByOrganizationForTable` fallback.
- The Fields panel is workspace-level only; admin / partner apps do
  not yet consume `QentrahTable`.

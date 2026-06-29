# Files

## Convex (server)

- `apps/workspace/convex/clientTasks/read.ts` — new `listGrouped` query.
  Takes `{ organizationId, projectId?, groupBy: "status" | "priority" |
  "assignee" | "dueDate" | "none" }`, returns
  `{ groupBy, groups: [{ key, label, count, tasks: [...] }], flat }`.
  Reuses the existing `by_organization_id` / `by_organization_project`
  indexes and the `activeDueWorkspaceRows` filter.
- `apps/workspace/convex/customFields/{read,write,values_read,values_write}.ts`
  — already-shipped WorkOS-style custom field API used by the panel.

## API wrappers (apps/workspace)

- `apps/workspace/src/domains/tasks/api/tasks.ts` — adds
  `useTasksGroupedQuery`, `readPersistedGroupBy`, `writePersistedGroupBy`,
  `GroupBy` type.
- `apps/workspace/src/domains/tasks/api/fields.ts` — new wrapper for
  `customFieldDefinitions` + `customFieldValues`. Uses
  `useQuery` / `useMutation` against the Convex API when the codegen
  symbol is available, with a graceful fallback to the existing
  `listByOrganization` / `listByOrganizationForTable` queries.
- Exports `createCustomFieldRequest`, `updateCustomFieldDisplayRequest`,
  `deleteCustomFieldRequest`, `setCustomFieldValueRequest` — all Hono
  POST/PATCH/DELETE helpers.

## UI components (apps/workspace)

- `apps/workspace/src/domains/tasks/components/task-table-toolbar.tsx` —
  `TaskTableToolbar` (Group by / Filter / Sort / Fields / search / +Task).
- `apps/workspace/src/domains/tasks/components/task-table-fields-panel.tsx` —
  `TaskTableFieldsPanel` (right-side slide-in: search, Create/Existing
  tabs, Popular/All type list, create form, toggle visible, delete).
- `apps/workspace/src/domains/projects/components/project-detail-overview.tsx` —
  `TaskTableView` rewritten: uses the new toolbar, the new editors on
  every cell, renders group header rows from `useTasksGroupedQuery`, and
  mounts the Fields panel.

## `@qentrah/ui` package

- `packages/ui/src/qentrah-table/cell-renderers/popover-editor.tsx` —
  `CellPopover` (self-contained popover anchored to a cell rect; portals
  to `document.body`; click-outside / escape / scroll-close).
- `packages/ui/src/qentrah-table/cell-renderers/editors/status-editor.tsx` —
  `StatusEditor` (Status / Task Type tabs, search, grouped options).
- `packages/ui/src/qentrah-table/cell-renderers/editors/assignee-editor.tsx` —
  `AssigneeEditor` (search, "Unassigned" row, members list).
- `packages/ui/src/qentrah-table/cell-renderers/editors/date-editor.tsx` —
  `DateEditor` (Today / Tomorrow / Next week quick picks, mini calendar,
  Clear; consumers can pass `renderCalendar` to use their own calendar).
- `packages/ui/src/qentrah-table/cell-renderers/editors/priority-editor.tsx` —
  `PriorityEditor` (Urgent / High / Normal / Low / Clear; optional
  "Prioritize with AI" footer).
- `packages/ui/src/qentrah-table/cell-renderers/editors/text-number-dropdown-url-editors.tsx` —
  `TextEditor`, `NumberEditor`, `DropdownEditor`, `LabelsEditor`,
  `UrlEditor` for custom field types.
- `packages/ui/src/qentrah-table/cell-renderers/{status-pill,priority-flag,assignee-avatar}.tsx` —
  Visual polish (ClickUp contrast, always-render flag, fix "UN" leak).
- `packages/ui/src/qentrah-table/qentrah-table.tsx` — `QentrahColumnDef`
  exposes `cellEditor`, `cellEditorPopup`, `cellEditorPopupPosition`;
  row selected state and cell-focus glow.
- `packages/ui/src/qentrah-table/index.ts` — barrel exports all new pieces.

## Docs

- `docs/lifecycles/qentrah-table/{README,files,flow,tests,risks,changes}.md`
  — extended with the interaction layer.
- `docs/lifecycles/task-table-fields/{README,files,flow,tests,risks,changes}.md`
  — this folder.

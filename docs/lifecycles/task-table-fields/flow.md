# Flow

## Old

1. Table renders a custom HTML `<table>` with hand-rolled status pills,
   priority cells, and assignee cells.
2. Editing requires a separate "open task" route or the right-side
   task sheet.
3. Grouping is unavailable client-side; the server returns a flat list.
4. Custom fields are read from `tasks.customFields` (legacy) and the
   `customFieldValues` table, but there is no UI to author new ones.

## New

### A. Visual polish (no behavior change)

1. Status pill colors are vivid (transparent-bordered TO DO, solid
   blue IN PROGRESS, solid green COMPLETE).
2. Priority flag is always rendered (no bare "Normal" text).
3. Assignee avatar never shows "UN" — it shows "—" + a muted placeholder
   when no name is set.
4. Row selected state has a violet background and a 1px violet left
   border.

### B. Inline popover editors

1. Each interactive cell uses a custom `cellRenderer` that returns a
   `<CellPopover>` wrapping both the display and the editor content.
2. `CellPopover` measures the cell rect with `getBoundingClientRect()`
   on the closest `.ag-cell`, ports the content to `document.body`,
   and handles click-outside / escape / scroll close.
3. On commit, the editor calls `onChange(next)` which the column's
   renderer maps to a `handleUpdate(task, { field: next })` — that
   eventually lands in the Convex `clientTasks.write.updateFromHono`
   mutation.
4. Custom field values route through `setCustomFieldValueRequest` →
   `customFieldValues.upsertFromHono`.

### C. Server-side group by

1. `useTasksGroupedQuery(organizationId, { projectId, groupBy })` calls
   the new `clientTasks.read.listGrouped` Convex query.
2. The Convex query runs the existing index, filters out deleted /
   soft-deleted rows via `activeDueWorkspaceRows`, and groups in JS.
3. The client flattens the response back into a list of
   `{ __groupKey, __groupLabel, __groupCount, …task }` rows and feeds
   them to `<QentrahTable>`.
4. Group header rows render with a chevron, the group label, and a
   count badge; clicking collapses / expands the group.
5. The Group By choice is persisted in `localStorage` under
   `qentrah.tasks.groupBy.<projectId>`.

### D. Right-side Fields panel

1. Toolbar's **Fields** button toggles a 340px slide-in
   (`TaskTableFieldsPanel`).
2. The panel has search + two tabs: `Create new` / `Add existing`.
3. `Create new` lists Popular + All field types. Clicking a type opens
   a small form (default name pre-filled); submit calls
   `createCustomFieldRequest` → `customFields.write.createFromHono`.
4. `Add existing` lists every field where `appliesTo: ["task"]` with
   an eye / eye-off toggle (calls `updateCustomFieldDisplayRequest`).
5. Each new field is read by `useFieldDefinitionsQuery` (a Convex
   `useQuery` against `customFields.read.listByOrganization` filtered
   to `recordType: "task"`).
6. `useFieldValuesQuery` (against `customFieldValues.values_read.listByOrganization`)
   returns a flat list of `{ fieldKey, recordId, ...value }` rows;
   the client indexes them by `fieldKey → recordId` and renders the
   matching cell renderer.
7. New columns appear in the table immediately (Convex reactivity).

## Upstream / Downstream

- **Upstream**: `useTasksGroupedQuery` (Convex), `useFieldDefinitionsQuery`
  (Convex), `useFieldValuesQuery` (Convex), `listOrganizationMembers` (Hono).
- **Downstream**: `updateTaskRequest` (Hono → Convex), `createCustomFieldRequest`
  (Hono → Convex), `setCustomFieldValueRequest` (Hono → Convex).
- **Cross-app**: admin and partner apps do not currently consume
  `QentrahTable`; this work is workspace-only.

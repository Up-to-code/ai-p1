# Qentrah Table (AG Grid)

Shared, themeable data-grid primitive for all Qentrah apps.

## Purpose

Replace ad-hoc HTML `<table>` markup across `apps/workspace` with a single,
configurable AG Grid–based primitive that ships with:

- Dark + light Quartz-aligned theming.
- Built-in sort, filter, column resize, column reorder, column show/hide.
- A small library of cell renderers (`StatusPill`, `AssigneeAvatar`,
  `PriorityFlag`, `NameCell` with inline edit) that match the ClickUp
  reference used for the visual target.
- TypeScript-first API: `QentrahTable<TRow>` infers column defs from a typed
  row shape.

## Owner

- **Package**: `@qentrah/ui`
- **Consumers**: `apps/workspace` (Table views, lists that need
  filter/sort/resize)

## Entry points

- `@qentrah/ui` barrel re-exports `QentrahTable` and the renderer helpers.
- `QentrahTable.tsx` — the React wrapper around `AgGridReact`.
- `cell-renderers/` — `StatusPill`, `AssigneeAvatar`, `PriorityFlag`,
  `NameCell`, `RowHandle`, `ToolbarAdd`.
- `theme.ts` — dark/light AG Grid theme parameters.

## Current Status

- Initial migration in progress.
- Consumer rollout: `TaskTableView` in `project-detail-overview.tsx` and
  `workspace-screen.tsx` first, then `client-table-view.tsx`.

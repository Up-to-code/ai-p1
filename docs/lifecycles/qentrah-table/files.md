# Files

## New: `@qentrah/ui/src/qentrah-table/`

- `QentrahTable.tsx` — main component. Wraps `AgGridReact`, applies the dark
  theme, enables sort/filter/resize/reorder, exposes a `getRowId` + `onCellValueChanged`
  for inline edit.
- `cell-renderers/status-pill.tsx` — ClickUp-style status pill
  (`To Do` / `In Progress` / `Complete` with colored dot/check).
- `cell-renderers/assignee-avatar.tsx` — circle avatar with initial or
  supplied URL.
- `cell-renderers/priority-flag.tsx` — colored flag for `urgent`, `high`,
  `normal`, `low`.
- `cell-renderers/name-cell.tsx` — checkbox + status icon + title with
  double-click inline edit.
- `cell-renderers/row-handle.tsx` — drag-handle column.
- `theme.ts` — AG Grid `themeQuartz.withParams(...)` parameter object.
- `index.ts` — barrel exports.
- `__tests__/qentrah-table.test.tsx` — render smoke test.

## New: `@qentrah/ui` package surface

- `package.json` — adds `ag-grid-community` and `ag-grid-react` runtime
  deps; new export `./qentrah-table`.
- `src/index.ts` — re-exports `qentrah-table`.

## Migrated consumers

- `apps/workspace/src/domains/projects/components/project-detail-overview.tsx`
  → `TaskTableView` uses `QentrahTable`.
- `apps/workspace/src/domains/workspace/components/workspace-screen.tsx`
  → reuses the same `TaskTableView` (no change here).
- `apps/workspace/src/domains/clients/components/client-table-view.tsx`
  → uses `QentrahTable` with the client column set.

## Documentation

- `docs/lifecycles/qentrah-table/` — this folder.

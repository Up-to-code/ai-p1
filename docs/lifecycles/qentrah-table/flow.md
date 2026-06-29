# Flow

## Old

1. Each table-bearing screen (Tasks Table, Clients Table, etc.) hand-rolls a
   `<table>` with bespoke `td`/`th` markup.
2. Sort, filter, resize, column reorder, and row selection must be
   re-implemented per surface.
3. Cell visual treatments (status pill, avatar, priority flag) are repeated
   as raw `className` strings inside each consumer.
4. Editing a cell requires local state, onBlur/onKeyDown wiring, and ad-hoc
   mutation logic per consumer.

## New

1. Consumer declares a typed `ColDef<TRow>[]` and a `RowData[]`.
2. Consumer renders `<QentrahTable rows={data} columns={cols} onRowUpdated={...} />`.
3. `QentrahTable` configures the AG Grid once: dark theme, default
   `sortable`/`filter`/`resizable`/`floatingFilters` behaviour,
   `animateRows`, `getRowId` from `row.id`.
4. Cell visuals come from named renderers shipped with the package.
5. Inline edit hooks through `onCellValueChanged` to a single
   `onRowUpdated(row)` callback the consumer wires to the mutation layer.

## Upstream / Downstream

- **Upstream**: `useTasksQuery`, `useClientsQuery`, etc. from
  `apps/workspace/src/domains/*/api` provide the row data.
- **Downstream**: Convex `updateTask`, `updateClient` mutations.
- **Cross-app**: Admin and Partner apps do not currently render large
  tabular data; `QentrahTable` is workspace-first but the package lives
  in `@qentrah/ui` so it can be adopted later without code moves.

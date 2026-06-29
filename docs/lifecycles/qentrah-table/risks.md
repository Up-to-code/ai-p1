# Risks

- **AG Grid is a client-only library**. `QentrahTable` is marked
  `"use client"` and must only be rendered inside a Client Component or
  wrapped in a dynamic import (`next/dynamic` with `{ ssr: false }`) if the
  consumer is server-rendered.
- **Bundle size**. AG Grid Community v33+ ships modular. We register only
  the modules we use (`ClientSideRowModelModule`,
  `TextFilterModule`, `NumberFilterModule`, `ValidationModule`). If a
  consumer needs grouping/pivot/menu items not registered, AG Grid will
  throw at runtime — keep the registration list in one place.
- **Theme drift**. The dark theme is parameterised off the Qentrah
  `--background` / `--foreground` / `--muted-foreground` tokens. Any new
  token used by `QentrahTable` must be added to
  `apps/workspace/src/app/globals.css` for the light theme to stay
  readable.
- **Data shape**. AG Grid mutates cell values back through the row
  reference. Consumers must pass a stable `getRowId` and treat the row
  passed to `onRowUpdated` as the source of truth for the patch.
- **Schema compatibility**. Row data flows from Convex
  (`tasks`, `clients`, …). The `QentrahTable` does not validate shapes;
  consumers must guard with the matching Zod schema from
  `@qentrah/domain-contracts` if the row shape is optional.
- **Rollback**. `QentrahTable` is additive — re-rendering the old
  custom-table markup is a one-line swap at each call site, no migration
  or schema change is required.

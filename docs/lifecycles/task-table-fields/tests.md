# Tests

- **Smoke (render)**:
  - `packages/ui/src/qentrah-table/__tests__/qentrah-table.test.tsx` —
    existing 7 render tests pass (StatusPill / AssigneeAvatar /
    PriorityFlag with new colors).
- **Manual (interaction)**:
  1. Open a project, switch to the **Table** view.
  2. Click a status cell → popover appears with `Status` / `Task Type`
     tabs, search, and grouped options. Choose a new status → row
     updates, the pill changes, and the cache invalidates.
  3. Click an assignee cell → popover with the member list; choose a
     member → name + avatar update.
  4. Click a date cell → popover with quick picks + mini calendar;
     pick a date → cell shows the formatted date.
  5. Click a priority cell → popover with colored flag options +
     optional "Prioritize with AI" footer.
  6. Click **Group by ▾** → choose `Status` → rows reorder into
     collapsible group headers (`Overdue`, `In Progress`, etc.) with
     counts. Reload the page → the choice persists.
  7. Click **Fields** → right panel opens. Click `Dropdown` under
     Popular → a new column appears. Rename the field, click Create.
     The new column is added to the table and rows in that column
     open a popover with the field's options.
  8. Switch to `Add existing` tab → toggle visibility for an existing
     field → column appears / disappears.
- **Commands**:
  - `npm --workspace @qentrah/ui run build` (0 errors)
  - `npm --workspace @qentrah/ui run test` (existing 7 + new editor
    tests pass)
  - `npx tsc --noEmit` in `apps/workspace` (0 new errors in `src/`)

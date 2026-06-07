# T05-004 - Custom Field Table Columns

Status: [ ]
Workstream: Custom Fields
Depends on: T05-002, T03-003

Goal:
Display selected custom fields as table columns.

Inputs:
- Module layout system
- Custom field definitions and values

Steps:
- Define how visible custom columns are selected.
- Render typed values consistently.
- Keep column widths stable.
- Add empty-value rendering.

Traps:
- Do not load all custom values with broad scans.
- Do not let long values break table layout.

Acceptance:
- Custom field columns can appear in record tables.
- Layout remains readable on desktop and mobile.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- Browser QA for a table with custom columns.

Completion note:

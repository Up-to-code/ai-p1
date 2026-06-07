# T05-005 - Custom Field Filtering

Status: [ ]
Workstream: Custom Fields
Depends on: T05-002, T05-004

Goal:
Support filtering records by custom field values.

Inputs:
- Query/index plan
- Custom field value model
- Module filters

Steps:
- Define filter operators by field type.
- Add query support only where indexes allow it.
- Add UI filter controls for select, boolean, date, number, and text fields.
- Document unsupported high-cost filters.

Traps:
- Do not implement unbounded client-side filtering for large tables.
- Do not expose unsupported operators.

Acceptance:
- Common custom field filters work without broad scans.
- Unsupported cases are blocked clearly.

Tests:
- `npm --workspace @qentrah/workspace test -- src/domains/convex/query-load-guard.test.ts`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

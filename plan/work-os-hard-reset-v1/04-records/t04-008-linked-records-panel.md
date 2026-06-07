# T04-008 - Linked Records Panel

Status: [ ]
Workstream: Records
Depends on: T01-009, T05-002, T03-003

Goal:
Build a generic linked-records panel for detail views.

Inputs:
- Record link model
- Core record detail views

Steps:
- Show links grouped by record type and link type.
- Allow adding and removing links if permissions allow.
- Use generic labels and cards.
- Feed linked records into AI context and MCP reads through later tasks.

Traps:
- Do not create custom link sections for every pair of records.
- Do not keep client-unit link behavior as special core UI.

Acceptance:
- Detail views can show and manage links consistently.
- Link behavior is reusable across record modules.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- Browser QA on two different record detail views.

Completion note:

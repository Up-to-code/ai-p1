# T04-001 - Clients List Form Detail

Status: [ ]
Workstream: Records
Depends on: T01-002, T02-004, T03-003

Goal:
Complete generic Client list, form, and detail workflows.

Inputs:
- Client domain model
- Existing clients screens, forms, stores, APIs, validation

Steps:
- Replace old client pipeline and unit-link assumptions.
- Implement client list/table with owner, status, source, contact, linked records.
- Implement create/edit form with generic client fields.
- Implement detail view with activity, linked records, tasks, events, assets, notes.

Traps:
- Do not keep viewing or unit statuses.
- Do not require real-estate-specific client roles.

Acceptance:
- A client can be created, edited, listed, opened, and linked to other records.
- UI and validation use generic client language.

Tests:
- `npm --workspace @qentrah/workspace test -- src/domains/clients src/server/domains/clients`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

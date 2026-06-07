# T04-003 - Projects List Board Form Detail

Status: [ ]
Workstream: Records
Depends on: T01-004, T02-004, T03-003

Goal:
Convert Projects from real-estate inventory to generic coordinated work.

Inputs:
- Project domain model
- Existing project screens, forms, stores, validation

Steps:
- Remove developer, REGA, unit inventory, bedrooms, and bathrooms fields.
- Build generic project list/table with client, owner, team, status, health, dates.
- Build board view by status or health.
- Build create/edit form and detail view with tasks, assets, events, opportunity, team.

Traps:
- Do not preserve project inventory as a hidden section.
- Do not call assets units.

Acceptance:
- Project workflows support any industry project.
- Old inventory behavior is removed or moved to future templates only.

Tests:
- `npm --workspace @qentrah/workspace test -- src/domains/projects src/server/domains/projects`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

# T04-005 - Calendar List Calendar Form Detail

Status: [ ]
Workstream: Records
Depends on: T01-006, T02-004, T03-003

Goal:
Convert Calendar into generic scheduled work.

Inputs:
- Calendar event domain model
- Existing calendar screen, store, validation, Convex functions

Steps:
- Replace viewing event types with generic event types.
- Support agenda/list and calendar views.
- Build event form with title, type, start/end, attendees, location/link, linked records.
- Build detail view with links and notes.

Traps:
- Do not keep property or viewing as default event assumptions.
- Do not make events client-only.

Acceptance:
- Calendar events can link to any Work OS record.
- Event creation and editing use neutral labels.

Tests:
- `npm --workspace @qentrah/workspace test -- src/domains/calendar src/server/domains/calendar convex/calendar`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

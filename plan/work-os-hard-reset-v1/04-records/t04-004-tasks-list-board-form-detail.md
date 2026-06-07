# T04-004 - Tasks List Board Form Detail

Status: [ ]
Workstream: Records
Depends on: T01-005, T02-004, T03-003

Goal:
Make Tasks a generic top-level module.

Inputs:
- Task domain model
- Existing `clientTasks` code
- Task placeholder route

Steps:
- Rename UI/API/store/server naming from client task to task.
- Build list/table with status, priority, assignee, due date, linked records.
- Build board by status.
- Build create/edit form and detail view with checklist and links.

Traps:
- Do not require `clientId`.
- Do not leave `/client-tasks` as the primary product route.

Acceptance:
- Tasks can exist independently and link to any core record.
- Existing client-specific tasks become generic linked tasks.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains/clientTasks src/domains/clients`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

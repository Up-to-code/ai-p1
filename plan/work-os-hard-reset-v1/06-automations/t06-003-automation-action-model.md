# T06-003 - Automation Action Model

Status: [ ]
Workstream: Automations
Depends on: T06-001, T06-002

Goal:
Define automation actions.

Inputs:
- Automation domain model
- Task, calendar event, record link, and custom field models

Steps:
- Define actions: create task, schedule event, update field, notify, link record.
- Define action payload validation.
- Define permissions needed for each action.
- Define rollback or failure logging expectations.

Traps:
- Do not let automation bypass normal record validation.
- Do not include connector writes until connector contracts exist.

Acceptance:
- Actions are generic, permissioned, and auditable.
- Execution service has a stable action interface.

Tests:
- `npm --workspace @qentrah/domain-contracts test`

Completion note:

# T06-005 - Automation Execution Service

Status: [ ]
Workstream: Automations
Depends on: T06-001, T06-002, T06-003

Goal:
Implement deterministic automation execution behind a deep Module.

Inputs:
- Automation rule contracts
- Convex write functions
- Permission model

Steps:
- Create an execution Module with a small Interface.
- Evaluate triggers and conditions.
- Execute actions through existing record write paths.
- Prevent recursive or duplicate execution where needed.

Traps:
- Do not let callers know every action implementation detail.
- Do not bypass permission, validation, or audit seams.

Acceptance:
- Automation execution has locality and tests at its Interface.
- Failed actions are logged without corrupting records.

Tests:
- `npm --workspace @qentrah/workspace test -- convex`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

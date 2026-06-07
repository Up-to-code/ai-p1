# T06-006 - Automation Logs And Failures

Status: [ ]
Workstream: Automations
Depends on: T06-005

Goal:
Track automation runs, successes, failures, and retries.

Inputs:
- Automation execution service
- Audit/logging patterns

Steps:
- Define run log fields.
- Record trigger payload summary, actions attempted, result, error, and timestamp.
- Display recent runs in automation detail.
- Add tests for failed action logging.

Traps:
- Do not store secrets or full sensitive payloads in logs.
- Do not hide failures behind silent no-ops.

Acceptance:
- Automation failures are diagnosable.
- Logs are safe and useful.

Tests:
- `npm --workspace @qentrah/workspace test -- convex`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

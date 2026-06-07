# T09-006 - Connector Error And Audit Logs

Status: [ ]
Workstream: Connectors
Depends on: T09-005

Goal:
Make connector failures and audit logs diagnosable.

Inputs:
- Existing audit/logging docs and code
- Connector action surface
- Data security rules

Steps:
- Define connector audit event types.
- Define safe error summaries.
- Record failed sync/action attempts with retry state.
- Add admin or workspace visibility where appropriate.

Traps:
- Do not log secrets, tokens, or full payloads.
- Do not hide revoked-grant failures.

Acceptance:
- Connector issues can be debugged without exposing sensitive data.

Tests:
- `npm --workspace @qentrah/workspace test -- convex`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

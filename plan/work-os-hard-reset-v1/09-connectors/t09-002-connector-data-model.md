# T09-002 - Connector Data Model

Status: [ ]
Workstream: Connectors
Depends on: T09-001

Goal:
Define connector records and their relationship to Work OS records.

Inputs:
- Partner grant and key projection models
- Integration runtime
- Work OS record taxonomy

Steps:
- Define connected app, account, grant, sync state, external record map, and action log concepts.
- Define which fields live in Workspace versus Partners.
- Define how external records link to Work OS records.
- Define retention and redaction expectations.

Traps:
- Do not duplicate Partners-owned app catalog state in Workspace.
- Do not store connector secrets in user-facing records.

Acceptance:
- Connector model respects existing app ownership decisions.
- Work OS records can link to external systems without becoming external-system records.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- `npm --workspace @qentrah/partners run typecheck`

Completion note:

# T09-003 - Connector OAuth And Permissions

Status: [ ]
Workstream: Connectors
Depends on: T09-002

Goal:
Map connector authorization, scopes, and permissions to Work OS records.

Inputs:
- Organization partner grant
- Partner key projection
- Auth scope catalog
- MCP permissions

Steps:
- Define scopes for each Work OS record read/write action.
- Align connector permissions with MCP and partner resource access.
- Ensure OAuth grant state controls connector actions.
- Add tests for allowed, denied, expired, and revoked grants.

Traps:
- Do not give connectors blanket workspace write access.
- Do not bypass organization authorization decisions.

Acceptance:
- Connector access is scoped, testable, and aligned with existing authorization Modules.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp src/server/domains/organization`
- `npm --workspace @qentrah/partners test`

Completion note:

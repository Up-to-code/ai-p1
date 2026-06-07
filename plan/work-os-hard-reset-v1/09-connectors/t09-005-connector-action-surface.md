# T09-005 - Connector Action Surface

Status: [ ]
Workstream: Connectors
Depends on: T09-003, T09-004, T08-010

Goal:
Define connector-triggered actions against Work OS records.

Inputs:
- MCP tool permissions
- Partner resource gateway
- Connector sync contracts

Steps:
- Define which actions connectors can trigger directly.
- Define when connector actions use MCP tools versus resource APIs.
- Define audit event payloads.
- Define user-visible action history.

Traps:
- Do not let connectors bypass the same validation and permissions as UI and AI.
- Do not make connector action logs too verbose or secret-bearing.

Acceptance:
- Connector actions are permissioned, auditable, and route through stable seams.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains/organization convex/mcp`

Completion note:

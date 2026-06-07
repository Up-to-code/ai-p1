# T08-005 - MCP Project Tools

Status: [ ]
Workstream: MCP
Depends on: T01-004, T08-002

Goal:
Expose generic Project MCP tools.

Inputs:
- Project record model
- Project server Module
- MCP registry

Steps:
- Define create, update, list, search, and link project tools.
- Remove developer, REGA, inventory, and unit fields from inputs.
- Support status, health, owner, team, dates, and linked records.
- Add tests.

Traps:
- Do not preserve old project inventory tool inputs.

Acceptance:
- MCP project tools operate on generic project work.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp/toolInputs.test.ts src/server/protocols/mcp`

Completion note:

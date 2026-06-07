# T08-007 - MCP Calendar Tools

Status: [ ]
Workstream: MCP
Depends on: T01-006, T08-002

Goal:
Expose generic Calendar Event MCP tools.

Inputs:
- Calendar event model
- Calendar server Module
- MCP registry

Steps:
- Define create, update, list, search, and link event tools.
- Replace viewing event inputs with generic event types.
- Validate date/time and attendee fields.
- Add tests.

Traps:
- Do not preserve site-viewing as a default type.

Acceptance:
- MCP can schedule generic Work OS events.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp/toolInputs.test.ts src/server/protocols/mcp`

Completion note:

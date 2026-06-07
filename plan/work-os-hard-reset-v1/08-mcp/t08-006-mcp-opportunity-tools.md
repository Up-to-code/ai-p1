# T08-006 - MCP Opportunity Tools

Status: [ ]
Workstream: MCP
Depends on: T01-003, T08-002

Goal:
Expose Opportunity MCP tools.

Inputs:
- Opportunity record model
- Opportunity server Module
- MCP registry

Steps:
- Define create, update stage, list, search, and link tools.
- Support value, owner, client, close date, and next step.
- Add tests for stage changes and linked project creation/linking.

Traps:
- Do not call the resource lead, deal, listing, or unit in tool names.

Acceptance:
- MCP can operate the opportunity pipeline.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp/toolInputs.test.ts src/server/protocols/mcp`

Completion note:

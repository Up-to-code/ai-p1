# T08-010 - MCP Permissions And Tests

Status: [ ]
Workstream: MCP
Depends on: T08-003, T08-004, T08-005, T08-006, T08-007, T08-008, T08-009

Goal:
Verify MCP permissions and test coverage for all Work OS tools.

Inputs:
- MCP connection permissions
- Tool policy
- Tool input tests

Steps:
- Map every tool to required scope and permission.
- Add tests for allowed and denied calls.
- Ensure AI, partner, and connector call paths obey permissions.
- Run forbidden-term search in MCP surfaces.

Traps:
- Do not grant broad write permissions for convenience.
- Do not miss connector-originated MCP calls.

Acceptance:
- MCP tools are permissioned and covered by tests.
- Old real-estate MCP language is gone.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp src/server/protocols/mcp`
- `rg -n "property|unit|broker|developer|viewing|clientTasks|client task" apps/workspace/convex/mcp apps/workspace/src/server/protocols/mcp`

Completion note:

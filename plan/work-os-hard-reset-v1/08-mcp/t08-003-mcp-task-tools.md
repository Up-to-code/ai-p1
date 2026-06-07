# T08-003 - MCP Task Tools

Status: [ ]
Workstream: MCP
Depends on: T01-005, T08-002

Goal:
Expose generic Task MCP tools.

Inputs:
- Task record model
- Task API/server Module
- MCP tool registry

Steps:
- Define create, update, list, search, and link task tools.
- Remove client-only task requirements.
- Validate linked record ids generically.
- Add tests for task tool inputs and permissions.

Traps:
- Do not use `clientTasks` as public MCP language.
- Do not require client id for every task.

Acceptance:
- MCP can create and manage generic tasks.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp/toolInputs.test.ts src/server/protocols/mcp`

Completion note:

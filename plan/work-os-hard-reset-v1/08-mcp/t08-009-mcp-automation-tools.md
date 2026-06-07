# T08-009 - MCP Automation Tools

Status: [ ]
Workstream: MCP
Depends on: T01-008, T06-003, T08-002

Goal:
Expose Automation MCP tools.

Inputs:
- Automation rule model
- Automation builder/execution contracts
- MCP registry

Steps:
- Define create, update, enable, disable, list, and inspect run tools.
- Validate trigger, condition, and action payloads.
- Require permission and confirmation where needed.
- Add tests.

Traps:
- Do not allow arbitrary code execution through automation tools.
- Do not let MCP bypass automation validation.

Acceptance:
- MCP can manage automation rules safely.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp/toolInputs.test.ts src/server/protocols/mcp`

Completion note:

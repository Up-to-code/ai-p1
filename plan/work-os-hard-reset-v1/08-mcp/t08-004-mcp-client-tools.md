# T08-004 - MCP Client Tools

Status: [ ]
Workstream: MCP
Depends on: T01-002, T08-002

Goal:
Expose generic Client MCP tools.

Inputs:
- Client record model
- Client server Module
- MCP registry

Steps:
- Define create, update, list, search, and link client tools.
- Remove buyer/tenant/unit-link assumptions.
- Validate contact and status payloads.
- Add permission tests.

Traps:
- Do not expose real-estate client roles.
- Do not couple client tools to opportunities or projects beyond record links.

Acceptance:
- MCP can manage clients using generic Work OS language.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp/toolInputs.test.ts src/server/protocols/mcp`

Completion note:

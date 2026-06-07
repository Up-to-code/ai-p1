# T08-008 - MCP Asset Tools

Status: [ ]
Workstream: MCP
Depends on: T01-007, T08-002

Goal:
Expose generic Asset MCP tools.

Inputs:
- Asset record model
- Asset/media server Modules
- MCP registry

Steps:
- Define create, update, list, search, and link asset tools.
- Support files, URLs, documents, media, links, and deliverables.
- Remove property listing and bedroom/bathroom inputs.
- Add tests.

Traps:
- Do not require a media file for every asset.

Acceptance:
- MCP can manage assets as generic work resources.

Tests:
- `npm --workspace @qentrah/workspace test -- convex/mcp/toolInputs.test.ts src/server/protocols/mcp`

Completion note:

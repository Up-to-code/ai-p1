# T09-001 - Connector Product Boundary

Status: [ ]
Workstream: Connectors
Depends on: T01-001, T07-001, T08-001

Goal:
Define connectors separately from AI and MCP.

Inputs:
- Partner app authorization docs
- Existing integration screens
- MCP and AI boundaries

Steps:
- Define connector as external product integration.
- Define read, write, sync, and action categories.
- Define what connector features belong in Workspace, Partners, and Demo Partner App.
- Define relationship to MCP tools and AI actions.

Traps:
- Do not call connectors AI.
- Do not expose partner integration internals to workspace users unless needed.

Acceptance:
- Connector scope is clear for Workspace UI, Partners docs, APIs, and tests.

Tests:
- `rg -n "connector|integration|partner app|MCP|agent" CONTEXT.md apps/workspace apps/partners apps/demo-partner-app`

Completion note:

# T08-001 - MCP Tool Taxonomy

Status: [ ]
Workstream: MCP
Depends on: T01-001, T07-001

Goal:
Define the MCP tool taxonomy separately from AI.

Inputs:
- MCP catalog and registry
- Work OS record taxonomy
- AI product boundary

Steps:
- Define read, create, update, link, and search tools by record type.
- Define tool names and descriptions using Work OS vocabulary.
- Define which tools AI can call and which are partner-facing.
- Define permission requirements by tool.

Traps:
- Do not make MCP a synonym for AI.
- Do not preserve client-task-only tools as the primary task interface.

Acceptance:
- MCP tool taxonomy covers Work OS records and is independent from prompt wording.

Tests:
- `rg -n "client task|property|unit|viewing|broker|developer" apps/workspace/src/server/protocols/mcp apps/workspace/convex/mcp`

Completion note:

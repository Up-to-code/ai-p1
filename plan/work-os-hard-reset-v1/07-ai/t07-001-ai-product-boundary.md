# T07-001 - AI Product Boundary

Status: [ ]
Workstream: AI
Depends on: T01-001

Goal:
Define what AI owns in the Work OS and what belongs to MCP, connectors, or automations.

Inputs:
- Agent runtime code
- MCP catalog
- Automation model
- Connector workstream

Steps:
- Define AI as planning, summarizing, drafting, and proposing actions.
- Define deterministic execution through confirmed tools, automations, or connectors.
- Define when AI needs confirmation.
- Define what data AI can read for context.

Traps:
- Do not let AI become an unbounded write path.
- Do not merge AI, MCP, connectors, and automations into one task.

Acceptance:
- AI boundary is explicit and referenced by downstream AI tasks.
- MCP and connector tasks remain separate.

Tests:
- `rg -n "agent|AI|MCP|automation|connector" apps/workspace/src/server/domains/agents apps/workspace/src/server/protocols/mcp plan/work-os-hard-reset-v1`

Completion note:

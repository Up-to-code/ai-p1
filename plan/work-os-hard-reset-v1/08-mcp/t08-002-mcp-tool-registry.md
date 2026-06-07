# T08-002 - MCP Tool Registry

Status: [ ]
Workstream: MCP
Depends on: T08-001

Goal:
Update MCP catalog and registry to expose generic Work OS tools.

Inputs:
- MCP tool catalog
- Registry core
- Tool permissions

Steps:
- Rename old tools to generic Work OS names.
- Register tools by record type and action.
- Update descriptions, input schemas, and output summaries.
- Remove stale property/unit/clientTasks tool registrations.

Traps:
- Do not leave aliases that keep old product language unless documented as compatibility exceptions.
- Do not update catalog text without updating schemas.

Acceptance:
- MCP registry exposes generic Work OS tools only.
- Tests prove expected tools are present.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/protocols/mcp/tools/catalog.test.ts`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

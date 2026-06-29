# Files, Functions, Routes, Tables

## Source files
- `convex/mcp/tools.ts` — Tool dispatch (711 lines, inline write logic). Target for refactoring.
- `convex/mcp/toolCall.ts` — Entry point: validates connection, dispatches to read/write tools
- `convex/mcp/toolInputs.ts` — Input parsers for MCP tools (`clientInput`, `projectInput`, etc.)
- `convex/clients/write.ts` — Canonical client write mutations
- `convex/projects/write.ts` — Canonical project write mutations
- `convex/deals/write.ts` — Canonical deal write mutations
- `convex/calendar/write.ts` — Canonical calendar event write mutations
- `convex/clientTasks/write.ts` — Canonical task write mutations
- `convex/workspace/businessData.ts` — `writeMcpWorkspaceAudit`, `mcpActor`, `presentWorkspaceRecord`

## Functions being added
- `clients.write.createInternal` (internalMutation) — No Clerk auth, accepts `actorUserId`
- `clients.write.updateInternal` (internalMutation)
- `clients.write.deleteInternal` (internalMutation)
- Same for projects, deals, calendar, clientTasks

## Convex tables
- `clients`, `projects`, `deals`, `calendarEvents`, `tasks` — Core entity tables
- `organizationAuditEvents` — Audit log (both canonical and MCP write to this)
- `organizationMcpConnections` — MCP connection records with permissions

## Why each matters
- Canonical write mutations: business rules (defaults, PII, audit, webhooks)
- MCP tools.ts: currently bypasses canonical logic, missing webhooks, wrong defaults
- New internal mutations: bridge the gap — MCP gets canonical behavior

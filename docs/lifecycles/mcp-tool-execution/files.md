# Files, Functions, Routes, Tables

## Source files
- `convex/mcp/tools.ts` — Tool dispatch (711 lines, inline write logic). Target for refactoring. Pass A will route this through the handlers registry.
- `convex/mcp/toolCall.ts` — Entry point: validates connection, dispatches to read/write tools
- `convex/mcp/toolInputs.ts` — Input parsers for MCP tools (`clientInput`, `projectInput`, etc.)
- `convex/mcp/handlers/registry.ts` — `readHandlers` / `writeHandlers` Maps + registration helpers. Currently unused (no caller for `registerAllHandlers()`).
- `convex/mcp/handlers/{clients,projects,deals,calendar,tasks,media,notifications,organization}.ts` — Per-domain handlers. Written for the new registry path; currently dead code. Will become live on Pass A.
- `convex/clients/write.ts` — Canonical client write mutations. Pass prerequisite added `*Internal` (2026-07-01).
- `convex/projects/write.ts` — Same
- `convex/deals/write.ts` — Same
- `convex/calendar/write.ts` — Same
- `convex/clientTasks/write.ts` — Same
- `convex/workspace/businessData.ts` — `writeMcpWorkspaceAudit`, `mcpActor`, `presentWorkspaceRecord`

## Functions now present (after 2026-07-01 prerequisite)
- `clients.write.createInternal` (internalMutation) — No Clerk auth, accepts `actorUserId`
- `clients.write.updateInternal` (internalMutation)
- `clients.write.deleteInternal` (internalMutation)
- `projects.write.{createInternal,updateInternal,deleteInternal}`
- `deals.write.{createInternal,updateInternal,deleteInternal}`
- `calendar.write.{createInternal,updateInternal,deleteInternal}`
- `clientTasks.write.{createInternal,updateInternal,deleteInternal}`

## Convex tables
- `clients`, `projects`, `deals`, `calendarEvents`, `tasks` — Core entity tables
- `organizationAuditEvents` — Audit log (both canonical and MCP write to this)
- `organizationMcpConnections` — MCP connection records with permissions

## Why each matters
- Canonical write mutations: business rules (defaults, PII, audit, webhooks)
- MCP tools.ts: currently bypasses canonical logic, missing webhooks, wrong defaults
- New internal mutations: bridge the gap — MCP gets canonical behavior

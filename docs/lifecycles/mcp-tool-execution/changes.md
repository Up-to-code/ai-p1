# 2026-06-28: Wave A — Add internal mutations, refactor MCP tools

## What changed
1. Added `createInternal`, `updateInternal`, `deleteInternal` to:
   - `convex/clients/write.ts`
   - `convex/projects/write.ts`
   - `convex/deals/write.ts`
   - `convex/calendar/write.ts`
   - `convex/clientTasks/write.ts`
2. Refactored `convex/mcp/tools.ts:writeTool` to call internal mutations instead of inline DB operations.
3. MCP layer passes MCP-specific defaults (`visibility: "workspace"`, `source: "mcp"`) explicitly through to internal mutations.

## Why
- Eliminate duplicate write logic (711 lines of MCP inline CRUD)
- Fix missing webhooks for MCP-originated changes
- Fix wrong defaults (`visibility: "workspace"` vs `"private"`)
- Unify audit trail between Hono and MCP pathways
- Future entity changes only need updates in one place (canonical write.ts)

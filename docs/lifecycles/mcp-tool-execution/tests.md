# Tests

## Existing tests
- `convex/mcp/toolInputs.test.ts` — Input parsing
- `convex/mcp/tools.test.ts` — (not found, may not exist)
- `server/domains/agents/services/tool-executor.test.ts` — Server-side tool executor

## Commands to run
```bash
npx vitest run convex/mcp/ --reporter verbose
npx vitest run convex/clients/ --reporter verbose
```

## Manual checks
- Create a client via MCP → verify `visibility` defaults to `"workspace"` (MCP requires workspace-visibility for read tool to find it)
- Verify audit event is written with correct `actorType: "mcpConnection"`
- Verify webhook fires for MCP-created client
- Verify same flow works for projects, deals, calendar, tasks

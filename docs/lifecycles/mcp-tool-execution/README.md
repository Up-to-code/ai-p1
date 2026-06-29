# MCP Tool Execution Lifecycle

**Purpose**: External AI agents (Claude Desktop, Cursor via agent-link) call workspace tools through the MCP protocol. This lifecycle covers how a tool call flows from external request through auth/validation to execution, and what side effects it produces.

**Owner app**: `apps/workspace` — Convex backend

**Entry points**:
- Public action: `convex/mcp/tools.ts:callTool` (exposed via HTTP transport at `/mcp/:publicId/:secret`)
- Internal query: `convex/mcp/tools.ts:readTool` (read operations)
- Internal mutation: `convex/mcp/tools.ts:writeTool` (write operations)

**Actor/system flow**: External AI → HTTP POST → agent-link transport → `callTool` action → `executeMcpToolCall` → `readTool`/`writeTool` → DB operations

**Current status**: Active. Internal mutations being added to canonical write.ts files to eliminate duplicate inline write logic in tools.ts.

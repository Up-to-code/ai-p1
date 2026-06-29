# Risks

## Coupling risks
- MCP tools currently hardcode `visibility: "workspace"`. Canonical defaults are `"private"`. If internal mutation applies canonical default, MCP-created records become invisible to MCP read tools.
  - **Mitigation**: MCP layer passes `visibility: "workspace"` and `source: "mcp"` explicitly in the input to internal mutations. Canonical handlers respect user-provided values before falling back to defaults.

- MCP uses `writeMcpWorkspaceAudit` which adds `actorType: "mcpConnection"` and `actorMcpConnectionId`. Canonical audit uses `actorUserId` only.
  - **Mitigation**: Keep MCP-specific audit in the `writeTool` handler (before/after calling internal mutation), or accept an `actorType` parameter in internal mutations.

## Rollback notes
- New internal mutations are additive — removing them doesn't break existing Hono flow.
- If MCP pathway breaks, revert `tools.ts:writeTool` to inline logic (current behavior).

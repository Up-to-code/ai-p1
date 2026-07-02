# Current Flow (after 2026-07-01 prerequisite)

## Prerequisite done: `*Internal` mutations now exist on all 5 canonical write files
The shared-helper pattern means each domain has a private `*Core` function that the Hono `*FromHono` and the new `*Internal` both call. Audit is written by the caller (Hono writes user audit, MCP writes connection audit).

## Status of the original Wave A target

### Canonical (Hono/agent) write flow — DONE (Hono uses the cores, writes user audit)
```
Client → Hono handler → createFromHono (mutation)
  → clerkAuthComponent.getAuthUser()
  → assertOrganizationResourcePermission()
  → createCore(ctx, { ..., actorUserId: user._id }) — shared helper
  → write organizationAuditEvents (user actor)
  → return presented record
```

### MCP write flow — still inline (Pass A pending)
```
External AI → POST → callTool (action) → executeMcpToolCall
  → validateConnection() + reserveUsage()
  → writeTool (internalMutation, still inline)
  → inline DB insert/patch/delete (WRONG defaults, NO webhooks, different audit)
  → return presentWorkspaceRecord
```

## Target after Pass A (NOT YET DONE)
```
External AI → POST → callTool → executeMcpToolCall
  → validateConnection() + reserveUsage()
  → writeTool (thinned) → writeHandlers.get(args.tool)(ctx, common)
  → handler calls internal.*.write.*Internal via ctx.runMutation()
  → writes writeMcpWorkspaceAudit (mcpConnection actor)
  → return result
```

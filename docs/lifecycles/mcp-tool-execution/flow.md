# Current Flow (Wave A Target)

## Before: Two parallel implementations

### Canonical (Hono/agent) write flow
```
Client → Hono handler → createFromHono (mutation)
  → clerkAuthComponent.getAuthUser()
  → assertOrganizationResourcePermission()
  → ctx.db.insert (canonical defaults, PII, audit events, webhooks, rollup)
  → return presented record
```

### MCP write flow (current — being replaced)
```
External AI → POST → callTool (action) → executeMcpToolCall
  → validateConnection() + reserveUsage()
  → writeTool (internalMutation)
  → inline DB insert/patch/delete (WRONG defaults, NO webhooks, different audit)
  → return presentWorkspaceRecord
```

## After: Shared internal mutations

### Canonical flow
```
Client → Hono handler → createFromHono → createInternal(internalMutation)
                                                        ↓
                                              canonical defaults
                                              PII handling
                                              audit events
                                              webhooks
                                              rollup
                                              return presented
```

### MCP flow
```
External AI → POST → callTool → executeMcpToolCall
  → validateConnection() + reserveUsage()
  → writeTool (internalMutation, thinned out)
  → call internal.*.write.*Internal via ctx.runMutation()
  → return result
```

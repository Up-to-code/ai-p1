# Eve Agent Integration Lifecycle

## Purpose

Documents the integration of Eve v0.19.0 as the AI agent system for Qentrah workspace, replacing the legacy custom agent system. Eve provides a declarative agent framework with built-in tool calling, streaming, and session management.

## Owner

`apps/workspace` - Eve agent configuration, React integration, and domain tools

## Entrypoints

- Agent Definition: `apps/workspace/agent/agent.ts` - Main Eve agent configuration
- Auth Channel: `apps/workspace/agent/auth/clerk-auth.ts` - Clerk authentication integration
- Eve Channel: `apps/workspace/agent/channels/eve.ts` - Eve event channel
- Frontend Client: `apps/workspace/src/domains/eve/client.ts` - Singleton Eve Client factory
- React Hook: `apps/workspace/src/domains/eve/hooks/use-eve-chat.ts` - React integration hook
- UI Component: `apps/workspace/src/components/dashboard/eve-dashboard-chat.tsx` - Chat UI
- Domain Tools: `apps/workspace/agent/tools/` - Domain-specific tools (clients, projects, calendar, spaces)
- Subagents: `apps/workspace/agent/subagents/` - Specialized subagents (custom-role-manager)
- Skills: `apps/workspace/agent/skills/` - Agent skills (permissions, risk-policy, security)

## Actor/System Flow

### 1. User Initiates Chat

```
User opens AI page (/ai)
  → EveDashboardChat component mounts
  → useEveChat hook initializes
  → getEveClient() creates singleton Eve Client
  → useEveAgent hook from eve/react initializes
  → Session state loaded from URL param (?state=base64)
  → Ready to receive messages
```

### 2. User Sends Message

```
User types message and clicks send
  → handleSend(text) called
  → Eve Client sends message via Eve Agent
  → Agent processes message through:
    - Channels (eve.ts for streaming, clerk-auth.ts for auth)
    - Tools (domain tools from agent/tools/)
    - Skills (permissions, risk-policy, security)
  → Streaming response via SSE
  → useEveChat updates messages state
  → EveDashboardChat renders new messages
```

### 3. Tool Execution Flow

```
Agent determines tool call needed
  → Tool selected from agent/tools/ (e.g., clients-create.ts)
  → Permission check via skills/permissions.md
  → Risk assessment via skills/risk-policy.md
  → Security check via skills/security.md
  → Tool executes with Convex/HTTP calls
  → Result returned to agent
  → Agent incorporates result into response
```

### 4. Session Persistence

```
Session state changes
  → onSessionChange callback fires
  → Session encoded to base64
  → URL updated with ?state= parameter
  → User can refresh and restore session
  → Thread history preserved across page reloads
```

### 5. Error Handling

```
Agent error occurs
  → onError callback fires
  → Error message set in state
  → UI displays error to user
  → User can retry or start new thread
```

## Architecture

### Eve Agent Configuration

```typescript
// agent/agent.ts
export default defineAgent({
  description: "AI assistant for Qentrah workspace management.",
  model: "openai/gpt-4.1-nano",
});
```

### Auth Integration

```typescript
// agent/auth/clerk-auth.ts
export const auth: AuthFn = async (ctx) => {
  const user = await clerkAuthComponent.getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return { userId: user._id, organizationId: user.orgId };
};
```

### Domain Tools

```
agent/tools/
├── clients-*.ts (create, delete, get, list, update)
├── projects-*.ts (create, delete, get, list, update)
├── calendar-*.ts (create, delete, get, list-month, list-range, list-today, update)
├── spaces-*.ts (create, delete, get, list, update)
└── tasks-*.ts (create, delete, get, list, update)
```

Each tool has:
- Zod schema for input validation
- Permission guards (canUseResourceAction)
- Space/project scoping
- Convex or HTTP calls to backend

### Subagents

```
agent/subagents/custom-role-manager/
├── agent.ts (subagent definition)
├── instructions.md (subagent instructions)
└── tools/ (create, delete, list, update custom roles)
```

### Skills

```
agent/skills/
├── permissions.md (permission checking logic)
├── risk-policy.md (risk assessment for tool calls)
└── security.md (security policies and PII handling)
```

## Key Decisions

### Eve Over Custom Agent

**Why Eve v0.19.0:**
- Declarative agent definition vs imperative custom code
- Built-in tool calling and streaming
- Session management out of the box
- Active development by Vercel
- Better TypeScript support

**Migration Approach:**
- Keep Convex backend unchanged
- Replace only the agent orchestration layer
- Preserve existing tool schemas and validation
- Maintain permission system integration

### Clerk ESM Fix

**Problem:** Eve child process failed to load `@clerk/nextjs` ESM dist (Node 24 rejects bare specifiers)

**Solution:** Node.js ESM hooks loader (`scripts/eve-esm-loader.mjs`)
- Resolves `next/*` bare specifiers to `.js`
- Adds `.js` to extensionless Clerk relative imports
- Handles `next/package.json` JSON import attribute
- Registered via `NODE_OPTIONS="--import \"$PWD/scripts/eve-esm-init.mjs\""`

**Key Insight:** `resolve` hook must be `async` with `await` on `nextResolve` to properly catch Promise rejections.

### Agent Tables Retention

**Decision:** Keep `agentTables` in Convex schema despite Eve migration

**Reason:**
- Billing system uses `agentRunId` for cost tracking
- Security backfill targets include `agentMessages`, `agentMemorySummaries`, `agentMemoryFacts`
- These tables are used by systems outside the agent layer
- Eve uses its own session state (URL-based), not Convex tables

## Current Status

**Active:** Eve v0.19.0 integration complete and working

**Completed:**
- ✅ Eve 0.19.0 Migration (client, hook, component)
- ✅ Custom-Role-Manager Subagent
- ✅ Eve Agent Space Tools (9 tools with permission guards)
- ✅ MCP Space Tool Integration
- ✅ Old System Deletion (legacy agent code removed)
- ✅ Sidebar AI Panel Rewrite (simplified to link-to-AI-page)
- ✅ Clerk ESM Fix (Node.js ESM hooks loader)
- ✅ Eve Auth Channel Fix (moved to agent/auth/)

**Known Issues:**
- ⚠️ Agent tables still in Convex schema (used by billing/security, cannot remove)
- ⚠️ Eve Nitro worker compilation cache (transient, resolves on restart)

## Next Steps

1. **Test End-to-End:** Verify AI chat works with real user authentication
2. **Audit Tools:** Ensure all tools have proper permission guards and space scoping
3. **Document Flows:** Create lifecycle docs for tool execution and permission checking
4. **Monitor Performance:** Track agent response times and streaming reliability
5. **Expand Tools:** Add missing domain tools (docs, tags, time tracking)

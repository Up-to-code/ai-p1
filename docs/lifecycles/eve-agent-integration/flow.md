# Flow

## Eve Agent Initialization Flow

### 1. Client Mount (No Session)

```
User opens /ai page
  → EveDashboardChat mounts
  → useEveChat({ organizationId }) initializes
  → searchParams.get("state") returns null
  → initialSession = undefined
  → useEveAgent({ host: "/en", initialSession }) initializes
  → Eve Client connects to Eve dev server (http://127.0.0.1:9999)
  → Agent ready, displays empty state with suggestions
```

### 2. Client Mount (Existing Session)

```
User opens /ai?state=base64EncodedSession
  → EveDashboardChat mounts
  → useEveChat initializes
  → searchParams.get("state") returns base64 string
  → decodeSession(state) restores SessionState
  → useEveAgent({ host: "/en", initialSession }) initializes
  → Session restored, displays previous messages
  → User can continue conversation
```

## Message Sending Flow

### 3. User Sends Message (Standard Mode)

```
User types "find clients in Marketing space"
  → User clicks send button
  → handleSend("find clients in Marketing space") called
  → setIsSending(true)
  → setErrorMessage(undefined)
  → handle.send({ message: text }) called (Eve hook)
  → Eve Agent processes message:
    - Parse user intent
    - Select appropriate tool (clients-list)
    - Check permissions (canReadClients)
    - Check space access (user in Marketing space?)
    - Execute tool with space filter
  → Streaming response via SSE
  → Messages update in real-time
  → setIsSending(false)
  → UI displays assistant response
```

### 4. User Sends Message (Plan Mode)

```
User enables "Plan Mode" toggle
  → setPlanMode(true)
  → User types "create new project Q4 Launch"
  → handleSend prepends PLAN MODE instruction:
    "[PLAN MODE]\nYou are in PLAN MODE. You can ONLY read data. Do NOT create, update, or delete anything. Ask questions to understand the user's needs. When you have a complete plan, present it inside <plan> tags.\n\ncreate new project Q4 Launch"
  → Agent runs in read-only mode
  → Agent asks clarifying questions
  → Agent presents plan in <plan> tags
  → User reviews plan
  → User clicks "Implement" button
  → handleImplement(planContent) called
  → send(`IMPLEMENT THE PLAN\n\n${planContent}`)
  → Agent executes write operations
```

## Tool Execution Flow

### 5. Agent Calls Domain Tool

```
Agent determines need to list clients
  → Selects clients-list tool
  → Tool definition: agent/tools/clients-list.ts
  → Input validation via Zod schema
  → Permission check:
    - canUseResourceAction(userId, "client", "read")
    - Returns false if user lacks permission
  → Space scoping:
    - If spaceId provided, filter by space
    - If no spaceId, return all accessible clients
  → Backend call:
    - Convex query: api.clients.read.list
    - Or HTTP: /api/v1/organizations/:orgId/read/clients
  → Result returned to agent
  → Agent formats response
  → Response streamed to client
```

### 6. Agent Calls Space Tool

```
Agent determines need to create space
  → Selects spaces-create tool
  → Tool definition: agent/tools/spaces-create.ts
  → Input validation via Zod schema
  → Permission check:
    - canUseResourceAction(userId, "space", "create")
    - Requires Space Admin or Org Admin
  → Risk assessment:
    - Skill: risk-policy.md
    - Classifies as "low_write" (destructive: false)
  → Security check:
    - Skill: security.md
    - Validates input for PII, injection
  → Backend call:
    - Convex mutation: api.spaces.create
  → Result returned to agent
  → Agent confirms space created
```

## Permission Checking Flow

### 7. Permission Guard Execution

```
Tool executes with permission check
  → canUseResourceAction(userId, resource, action) called
  → Load user organization membership
  → Check organization role (owner/admin/member)
  → If resource is space-scoped:
    - Load space membership
    - Check space role (admin/member/viewer)
    - Check space visibility (private/public/request_only)
  → If resource is project-scoped:
    - Load project membership
    - Check project role (admin/member/viewer)
    - Check project visibility (private/space_members/organization)
  → Return true if allowed, false if denied
  → If denied, agent explains permission requirement
```

## Error Handling Flow

### 8. Agent Error

```
Agent encounters error (e.g., Convex timeout)
  → onError callback fires
  → setErrorMessage(err.message)
  → Error message displayed in UI
  → User sees "Server returned an unexpected response. Try reloading the page."
  → User can:
    - Click "Retry" (resend message)
    - Click "New Thread" (reset conversation)
```

### 9. Tool Execution Error

```
Tool fails validation
  → Zod schema validation fails
  → Error returned to agent
  → Agent explains validation error
  → User corrects input and retries

Tool fails permission check
  → canUseResourceAction returns false
  → Agent explains permission requirement
  → User requests permission upgrade or uses different account

Tool fails backend call
  → Convex/HTTP request fails
  → Error returned to agent
  → Agent explains error
  → User retries or contacts support
```

## Session Persistence Flow

### 10. Session State Change

```
Agent sends message
  → Session state updated (new message added)
  → onSessionChange callback fires
  → encodeSession(state) converts to base64
  → URLSearchParams updated with ?state= parameter
  → window.history.replaceState updates URL
  → User can refresh page and restore session
```

### 11. New Thread

```
User clicks "New Thread" button
  → handleNewThread() called
  → handle.reset() clears session
  → URLSearchParams.delete("state")
  → window.history.replaceState removes state param
  → UI returns to empty state
  → New conversation starts fresh
```

## Dependencies

- **Upstream**: Eve dev server (http://127.0.0.1:9999), Convex backend, Clerk auth
- **Downstream**: EveDashboardChat component, useEveChat hook, domain tools
- **Cross-cutting**: Permission system (canUseResourceAction), risk policy, security skills

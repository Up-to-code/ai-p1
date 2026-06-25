# AI Confirmation Approval Bar

**Purpose**: When the AI agent requires user approval before executing a tool/action, a confirmation bar appears above the composer on web workspace surfaces, allowing the user to approve or cancel the action.

**Owner**: `apps/workspace` (web workspace), shared with `apps/mobile`

**Entrypoints**:
- Web: `AiPanel`, `AssistantPanel`, `DashboardChat` components
- Mobile: `PendingConfirmationDock` (already exists)
- API: `POST /api/v1/organizations/:orgId/agents/confirmations/:id/approve`
- API: `POST /api/v1/organizations/:orgId/agents/confirmations/:id/cancel`

**Actor/System Flow**:
1. User sends a message to the AI agent
2. Agent determines a tool call requires user confirmation
3. Server emits `confirmation_required` SSE event with confirmation ID, summary, input preview
4. Web client stores pending confirmation state
5. Approval bar renders above composer with summary and approve/cancel buttons
6. User clicks approve → POST to approve endpoint → server executes tool → marks executed
7. User clicks cancel → POST to cancel endpoint → server cancels confirmation

**Current Status**: Active — mobile has `PendingConfirmationDock`, web needs equivalent UI above composer

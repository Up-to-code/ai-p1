# Flow

## Current Flow (Mobile)
1. User sends message via `QentrahComposerDock`
2. SSE stream handler receives `confirmation_required` event
3. `useConversationController` stores `pendingConfirmation` state
4. `PendingConfirmationDock` renders above composer dock with approve/cancel buttons
5. User taps approve → `approveAgentConfirmation()` → server executes → status updates
6. User taps cancel → `cancelAgentConfirmation()` → server cancels → dock dismisses

## Current Flow (Web — before this change)
1. User sends message via `AiComposer`
2. SSE stream handler receives `confirmation_required` event
3. `confirmation_required` handler only calls `setStatusMessage(event.summary)` — no approval UI
4. No way for user to approve/cancel from the web UI

## New Flow (Web — after this change)
1. User sends message via `AiComposer`
2. SSE stream handler receives `confirmation_required` event
3. Component stores `pendingConfirmation` state (confirmationId, summary, inputPreview)
4. `PendingConfirmationBar` renders above composer with summary and approve/cancel buttons
5. User clicks approve → `approveAgentConfirmation()` → server executes → bar dismisses
6. User clicks cancel → `cancelAgentConfirmation()` → server cancels → bar dismisses

## Dependencies
- Server API endpoints already exist: `/approve` and `/cancel`
- SSE `confirmation_required` event already emitted
- Mobile `PendingConfirmationDock` serves as reference implementation

# Changes

## 2026-06-24: Added web workspace approval bar above composer

**Why**: The AI agent's `confirmation_required` SSE event was only setting a status message on web, with no UI for the user to approve or cancel the action. Mobile already had `PendingConfirmationDock` but web had no equivalent.

**What changed**:
- Added `approveAgentConfirmationRequest()` and `cancelAgentConfirmationRequest()` to `apps/workspace/src/domains/agents/api/agent-chat-request.ts`
- Created `PendingConfirmationBar` component at `apps/workspace/src/components/dashboard/pending-confirmation-bar.tsx`
- Updated `AiPanel`, `AssistantPanel`, and `DashboardChat` to track `pendingConfirmation` state and render the approval bar above the composer
- Updated `confirmation_required` event handlers to store the full confirmation data instead of just a status message

# Files

| File | Purpose |
|------|---------|
| `apps/workspace/src/domains/agents/api/chat.ts` | Agent chat SSE event types including `confirmation_required` |
| `apps/workspace/src/domains/agents/api/agent-chat-request.ts` | SSE stream parsing for agent chat |
| `apps/workspace/src/components/layout/ai-panel.tsx` | AI side panel — hosts AiComposer, needs approval bar |
| `apps/workspace/src/components/layout/assistant-panel.tsx` | Sheet-based assistant panel — hosts AiComposer, needs approval bar |
| `apps/workspace/src/components/dashboard/dashboard-chat.tsx` | Dashboard AI chat — hosts AiComposer, needs approval bar |
| `apps/workspace/src/components/dashboard/ai-composer.tsx` | Composer textarea component |
| `apps/workspace/src/components/dashboard/pending-confirmation-bar.tsx` | **NEW** — Approval bar above composer |
| `apps/workspace/src/server/domains/agents/handlers/confirmations.ts` | Server-side approve/cancel handlers |
| `apps/workspace/src/server/domains/organization/routing/domains/agents.ts` | API route definitions |
| `packages/ag-ui/src/cards/AgApprovalFooter.tsx` | Existing inline approval footer (ag-ui cards) |
| `apps/mobile/src/conversation/components/PendingConfirmationDock.tsx` | Mobile equivalent — floating confirmation dock |

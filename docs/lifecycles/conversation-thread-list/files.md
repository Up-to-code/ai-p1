# Files Involved

| File | Role |
|------|------|
| `src/store/slices/threadsSlice.ts` | **NEW** — Zustand slice: `threads`, `threadsLoaded`, `refreshThreads()`, `prependThread()` |
| `src/store/index.ts` | Registers `threadsSlice` in the app store |
| `src/persistence/api/conversationData.ts` | `useGlobalThreads()` hook reading from store; old `useThreadsState` / `usePaginatedAgentThreads` deprecated |
| `src/persistence/api/conversationApi.ts` | API calls: `listAgentThreads`, `listAgentThreadsPage` (unchanged) |
| `src/conversation/hooks/useConversationController.ts` | Consumes shared thread state; calls `prependThread` on `meta` event |
| `src/shell/components/ChatDrawer.tsx` | Reads from `useGlobalThreads()` instead of local `usePaginatedAgentThreads` |
| `app/(app)/threads.tsx` | Reads from `useGlobalThreads()` instead of local `usePaginatedAgentThreads` |
| `src/conversation/lib/threadSelection.ts` | `resolveActiveConversationThreadId` — uses shared threads (unchanged logic) |

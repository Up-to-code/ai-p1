# Flow

## Old Flow (Fragmented)

1. `useConversationController` calls `useThreadsState()` → local `useState` + fetch
2. `ChatDrawer` calls `usePaginatedAgentThreads(10)` → separate local `useState` + fetch
3. `threads.tsx` calls `usePaginatedAgentThreads(10)` → yet another separate local `useState` + fetch
4. After message send, controller calls `refreshThreads()` → only its own state updates
5. ChatDrawer and threads screen show stale data until manually refreshed

## New Flow (Shared Store)

1. `threadsSlice` holds `threads[]`, `threadsLoaded`, `refreshThreads()` in Zustand
2. `useGlobalThreads()` hook reads from the store; triggers initial fetch on mount
3. All components (`ChatDrawer`, `threads.tsx`, controller) read from the same store
4. After `meta` SSE event, controller calls `prependThread(thread)` → all subscribers see it
5. After `done` event, controller calls `refreshThreads()` → all subscribers get fresh data

## Dependencies

- **Upstream**: `conversationApi.ts` (REST API calls to workspace server)
- **Downstream**: `ChatDrawer`, `threads.tsx`, `useConversationController`, `threadSelection.ts`

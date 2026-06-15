# Risks

## State Stale-ness

- **Before**: Each hook had independent state → components showed different thread lists
- **After**: Single source of truth → all components see the same data
- **Risk**: If `refreshThreads()` fails silently, all surfaces show stale data

## Optimistic Insertion

- `prependThread()` adds the thread from the `meta` event before the server confirms
- If the server rejects the thread creation, the optimistic entry persists until next refresh
- **Mitigation**: `refreshThreads()` after `done` event replaces optimistic data

## Pagination

- `useGlobalThreads` fetches up to 50 threads (matching old `useThreadsState` limit)
- `threads.tsx` previously used cursor-based pagination via `usePaginatedAgentThreads`
- **Mitigation**: Keep cursor-based pagination in `threads.tsx` by writing paginated results into the shared store, or maintain a separate paginated fetch for the full history screen

## Cross-app Coupling

- Mobile uses REST API (`listAgentThreads`); workspace web uses Convex `useQuery`
- No direct coupling risk — they hit the same backend through different transports

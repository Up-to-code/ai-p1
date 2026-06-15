# Conversation Thread List Lifecycle

## Purpose

Manages the shared global list of agent threads (conversations/theories) across the mobile app. Ensures all UI surfaces (ChatDrawer, threads history screen, conversation controller) see a consistent, up-to-date thread list without manual refresh.

## Owner

`apps/mobile` — Zustand store + React hooks in `src/persistence/api/conversationData.ts`.

## Entrypoints

- `src/store/slices/threadsSlice.ts` — Zustand slice holding global thread state
- `src/persistence/api/conversationData.ts` — `useGlobalThreads()` hook
- `src/conversation/hooks/useConversationController.ts` — consumes thread list, triggers refreshes
- `src/shell/components/ChatDrawer.tsx` — displays recent threads
- `app/(app)/threads.tsx` — full thread history screen

## Actor/System Flow

1. User opens app → `useGlobalThreads` mounts → fetches threads from API
2. User sends message → server creates thread → `meta` SSE event returns `threadId`
3. Controller calls `prependThread()` → new thread appears at top of shared list
4. Stream completes → `done` event → controller calls `refreshThreads()` → full re-fetch
5. ChatDrawer and threads screen read from shared store → see updated list immediately

## Current Status

Migrating from fragmented local state (`useThreadsState` + `usePaginatedAgentThreads`) to a shared Zustand slice.

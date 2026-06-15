# Changes

## 2026-06-15 — Shared Zustand thread list store

**Why**: Thread list was fragmented across `useThreadsState` and `usePaginatedAgentThreads`. ChatDrawer and threads screen never saw new threads without manual refresh.

**What**:
- Added `threadsSlice.ts` to Zustand store with `threads`, `threadsLoaded`, `refreshThreads()`, `prependThread()`
- Added `useGlobalThreads()` hook reading from shared store
- Updated `ChatDrawer.tsx` and `threads.tsx` to use shared hook
- Updated `useConversationController.ts` to use shared store and call `prependThread` on new thread creation

## 2026-06-15 — Organization profile name sync

**Why**: Mobile app showed Clerk org name ("YTC test") while web app showed Convex profile name ("UTC"). They diverged because the mobile app never fetched the Convex profile.

**What**:
- Added `GET /api/v1/organizations/:organizationId/profile` endpoint in workspace app (handler + service)
- Added `fetchOrganizationProfile()` API function in mobile app
- Added `useOrganizationProfile()` hook in mobile app that fetches and caches the profile
- Updated `organization.tsx`, `ChatDrawer.tsx`, `profile.tsx` to use profile name (falls back to Clerk name if fetch fails)
- Fixed `WorkspaceAccessSurface` body text hidden by `display: "none"`
- Added `activeBadge` localization string (EN/AR/FR) and active org indicator in organization list

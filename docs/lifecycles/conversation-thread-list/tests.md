# Tests

## Existing Coverage

- No dedicated unit tests for thread list hooks
- E2E QA mode has mock thread state in `e2eSlice.ts`

## Manual Checks

- Send a message → verify new thread appears in ChatDrawer without refresh
- Send a message → navigate to threads screen → verify new thread appears
- Click "New series" → send message → verify new thread created and visible
- Switch organizations → verify thread list resets

## Missing Coverage

- Unit test for `threadsSlice` (prependThread deduplication, refreshThreads async flow)
- Unit test for `useGlobalThreads` hook
- Integration test: message send → thread appears in drawer

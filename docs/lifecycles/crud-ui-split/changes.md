# Changes

## 2026-06-20 — Split crud-ui.tsx into 3 focused modules
- Deleted 929-line `crud-ui.tsx`
- Created `crud-ui/loading.tsx` — all loading skeleton variants, error state, query state components
- Created `crud-ui/forms.tsx` — form fields, buttons, dialogs, validation summary
- Created `crud-ui/status.tsx` — status pill, search box, empty workspace
- Created `crud-ui/index.ts` — barrel re-exports for backward compatibility
- Zero consumer changes needed (11 files import from `@/components/shared/crud-ui`)

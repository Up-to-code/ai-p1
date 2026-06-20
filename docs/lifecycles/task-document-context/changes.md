# Changes

## 2026-06-19

- Created lifecycle for context-aware task document work.
- Added project/global task document context notes for routing, mentions, quick actions, uploads, and calendar creation.
- Implemented URL-preserved task detail selection with `taskId` query params.
- Added context-aware task action bar with schedule meeting, full-screen toggle, open link, and delete moved into More.
- Added task-to-calendar meeting creation using the existing calendar event API.
- Expanded the document editor with wider document canvas, link insertion, image/file uploads through UploadThing `projectMedia`, context scope messaging, and quick reference mention chips.
- Implemented context-aware mention sources for members, clients, projects, and tasks.
- Implemented a live `@/` reference menu in the document editor with keyboard navigation and structured clickable mention insertion.
- Converted list/project task detail into an overlay drawer with backdrop blur and click-outside close.
- Changed document edits to browser-local draft persistence with an explicit Save button, avoiding backend writes on every character or blur.
- Added current user fallback into assignee/member mention options so users can assign themselves.
- Added explicit meeting date/from/to controls before creating task calendar meetings.
- Improved reference UX: redesigned quick references, added overflow count/scroll, increased `@/` menu z-index, clamped menu width/position to viewport, and added scrollable results.
- Added a custom floating selection toolbar for formatting selected text and creating named links.
- Fixed metadata picker trigger rendering for status, priority, assignee, and due date controls.
- Replaced browser prompt link creation with an in-app link panel for URL and display name.
- Added a clickable `+ more` reference action that opens the scrollable searchable mention menu.
- Added editor click navigation for structured mentions/links and browser-supported resize styling for uploaded images.
- Fixed locale-aware mention hrefs so client/project/task references do not navigate to non-localized 404 routes.
- Lowered drawer overlay stacking so shared popovers and delete dialogs render above the task drawer.
- Explicitly set TipTap `immediatelyRender` for the client-only document editor.
- Prevented the block slash menu from opening when typing contextual mentions with `@/`.
- Normalized mention hrefs again at insertion time using the current browser locale path.
- Restyled and compacted the reference card to better match the app design system.
- Wired board drag/drop destination index into persisted `pipelineOrder`, including same-column moves and cross-column top insertion.

## 2025-06-20

- Fixed task query error handling and retry behavior.
- Exposed query error state from task hooks so the UI can show actionable error messages instead of silent empty states.
- Added retry buttons to task list and task detail screens using `refetch()` from the query result.
- Fixed ownership filter label to use existing `Tasks.filters.all` translation key.
- Fixed kanban card reload glitch by improving optimistic update logic in `moveTaskMutation`.
- Updated lifecycle notes in `risks.md` and `changes.md`.
- Removed the board-local optimistic task store so task columns render from the TanStack task query cache only.
- Centralized task cache upsert/remove handling for create, save, delete, and drag/drop moves so the task list no longer invalidates and reloads after every task mutation.
- Added an in-flight move patch overlay so a background task read cannot visibly snap a dragged card back to its old column/order while the write is still pending.

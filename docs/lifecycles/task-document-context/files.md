# Files

- `apps/workspace/src/domains/tasks/components/tasks-screen.tsx`: owns task list/detail selection, project-aware selected task URLs, task detail top actions, fullscreen shell, and schedule-meeting quick action.
- `apps/workspace/src/domains/tasks/api/tasks.ts`: task list/detail query entrypoints and cache keys.
- `apps/workspace/src/components/shared/work-os-doc-editor.tsx`: shared document editor with rich toolbar, mentions, link/image/file insertion surface, and document context.
- `apps/workspace/src/domains/calendar/api/calendar.ts`: calendar event creation endpoint used by task quick action.
- `apps/workspace/src/domains/calendar/validation/calendar.schema.ts`: calendar payload shape for task-created meetings.
- `apps/workspace/src/lib/uploadthing.ts`: existing UploadThing client used by editor uploads.
- `docs/lifecycles/task-document-context/*`: lifecycle notes for future routing/context/mention changes.

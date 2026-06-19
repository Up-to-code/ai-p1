# Flow

## Current flow

1. User enters either global Tasks or Project Tasks.
2. The screen derives `organizationId` from account context and optional `projectId` from route/props.
3. Task list query is scoped by `projectId` when present.
4. Selecting a task writes the selected task id into URL search params so refresh/share preserves detail state.
5. The task editor receives a document context:
   - project scope when route project id or task project id exists;
   - global scope otherwise.
6. The editor uses that context for display and future contextual mention/upload actions.
7. Text/document edits are saved to browser localStorage first and do not call the backend on every character or blur.
8. User explicitly clicks Save to persist the full draft to the backend.
9. Quick actions can create a calendar meeting from the task using task title, due date, assignee/client/project context, and a link back to the task.
10. In list/project task screens, task details open as an overlay drawer; clicking the backdrop closes it while preserving unsaved local draft data.

## Mention rules

- Global entities such as members and clients can appear everywhere.
- Project-scoped entities such as tasks, meetings, files, and deals should prefer the current project context.
- Cross-project references should be explicit in the UI and links.

## Navigation rules

- Project task context should prefer project task URLs with `?taskId=<id>`.
- Global task context can use `/tasks/[id]` or global list selection.

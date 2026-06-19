# Tests

Existing relevant coverage:
- `apps/workspace/src/domains/tasks/api/tasks-request.test.ts`
- `apps/workspace/src/domains/tasks/task-pipeline-order.test.ts`
- `apps/workspace/src/domains/tasks/task-pipeline-source.test.ts`

Validation to run after edits:
- Typecheck/build for workspace if available.
- Targeted tests for tasks where runnable.
- Manual checks: global task selection URL, project task selection URL, fullscreen toggle, schedule meeting action, editor link/image/file buttons.

Missing coverage:
- URL selected task state.
- Context-aware mention filtering.
- Task-created calendar event payload.

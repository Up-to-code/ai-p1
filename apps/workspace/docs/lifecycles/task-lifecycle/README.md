# Task Lifecycle

Purpose: provide the canonical persistence foundation for TaskWorkspace across create, patch, complete, project movement, and soft deletion.

Invariants:

- A Task belongs to one Organization; Client, Project, and Space links must be active in it.
- A Task with both Project and Space must reference an active Project–Space relation.
- Project date policy is checked against the resulting Task state.
- Entering `done` sets `completedAt` once, staying done preserves it, and reopening clears it.
- Project rollups update for both former and resulting Projects.
- Reminder, assignment, mention, and audit effects execute from the lifecycle for every adapter.
- Delete is soft and repeated deletion cannot duplicate cancellation or audit effects.

Public Interface: `createTask`, `updateTask`, and `deleteTask` in `convex/clientTasks/lifecycle.ts`. Task access remains in `convex/access/task.ts`.

The canonical Workspace read is `clientTasks.read.listPage`. It selects the
Organization, Project, or Project-Space index before applying record-level
authorization and returns a Convex cursor page. The UI retains Convex as its
only server-owned source of truth and incrementally renders authorized pages.

Assignment identity is normalized transactionally into `taskAssignments` by
`clientTasks/assignments.ts`. This derived relation covers both the primary
assignee and additional assignees and powers exact `assignedToMe` cursors.
`migrations/backfillTaskAssignments:runBatch` is the idempotent operator
backfill for records created before the relation existed.

Workspace capture uses `workspace/task-quick-create.ts`. Table, list, board,
the creation dialog, and Project Task adapters pass one normalized draft into
the Hono-owned write command. Successful creation returns one Task identity and
navigates to `/tasks/{id}`; cancellation never invokes the command.

Bulk completion and deletion use `clientTasks/bulk.ts` through the Hono
`tasks/bulk` endpoint. Known missing/forbidden records return structured
per-record outcomes; allowed records reuse the canonical lifecycle. Unexpected
effect or persistence failures escape so Convex rolls the transaction back.

This lifecycle is a prerequisite for issue #16; TaskWorkspace views must consume it rather than implement view-specific mutations.

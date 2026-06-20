# Risks

- Route coupling: task links must preserve project context where appropriate or users can lose workspace/project orientation.
- Query coupling: list queries and mention queries must not silently leak unrelated project-scoped entities into project-first workflows.
- Calendar coupling: task-created meetings depend on calendar payload shape; schema changes can break quick actions.
- Upload coupling: editor uploads depend on UploadThing env/runtime configuration and should show user-facing failures.
- Data compatibility: mentions are stored in HTML body; structured attributes should remain backward-compatible with existing descriptions.
- Draft persistence: browser localStorage drafts are per organization/task and should be cleared after successful explicit Save.
- Rollback: UI changes can be reverted without schema migration as long as body HTML remains valid.

## Additional Risks (2025-06-20)

- **Kanban reload glitch**: Previous implementation invalidated queries on every mutation success, causing all cards to reload with animation. Fixed by updating cache directly instead of invalidating in `onSuccess`.
- **Optimistic update ordering**: The `moveTaskMutation` now recalculates `pipelineOrder` for all tasks in the target column to maintain proper ordering without requiring a refetch.
- **Error state visibility**: Task queries now expose error state via `useWorkspaceResourceResult`, allowing the UI to show actionable error messages with retry buttons instead of silent empty states.
- **Duplicate board state**: The board previously kept a local optimistic task copy in addition to the query cache. Drag/drop now patches the task query cache directly, keeping card movement, document save, create, and delete on the same frontend-to-Hono-to-Convex flow.

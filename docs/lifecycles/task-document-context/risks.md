# Risks

- Route coupling: task links must preserve project context where appropriate or users can lose workspace/project orientation.
- Query coupling: list queries and mention queries must not silently leak unrelated project-scoped entities into project-first workflows.
- Calendar coupling: task-created meetings depend on calendar payload shape; schema changes can break quick actions.
- Upload coupling: editor uploads depend on UploadThing env/runtime configuration and should show user-facing failures.
- Data compatibility: mentions are stored in HTML body; structured attributes should remain backward-compatible with existing descriptions.
- Draft persistence: browser localStorage drafts are per organization/task and should be cleared after successful explicit Save.
- Rollback: UI changes can be reverted without schema migration as long as body HTML remains valid.

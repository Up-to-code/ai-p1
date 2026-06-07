# T03-002 - Workspace Header And Actions

Status: [ ]
Workstream: UI Shell
Depends on: T03-001

Goal:
Make the workspace topbar/header actions fit generic Work OS workflows.

Inputs:
- Topbar and global search components
- Module routes
- Agent drawer entrypoints

Steps:
- Replace real-estate labels in global actions and search.
- Provide generic create actions for core records.
- Keep header dense and operational.
- Ensure mobile header does not overflow.

Traps:
- Do not add marketing-style explanation text.
- Do not create actions for records without routes/forms.

Acceptance:
- Header actions support the operating core.
- Search labels and placeholders are Work OS neutral.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- Browser check desktop and mobile topbar rendering.

Completion note:

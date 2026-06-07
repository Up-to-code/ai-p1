# T12-004 - Browser QA Gate

Status: [ ]
Workstream: Testing Release
Depends on: T12-002, T12-003

Goal:
Verify desktop browser behavior for the converted workspace.

Inputs:
- Running Workspace dev server
- Core module routes

Steps:
- Open dashboard, clients, opportunities, projects, tasks, calendar, assets, automations.
- Capture screenshots or notes for each module.
- Verify sidebar, topbar, list/board/detail/form states.
- Record any visual or navigation failures.

Traps:
- Do not rely only on typecheck for UI completion.
- Do not ignore placeholder pages if the task requires real workflows.

Acceptance:
- Desktop core Work OS flows render without broken navigation or visible old language.

Tests:
- Browser QA through the in-app browser.
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

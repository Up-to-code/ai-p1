# T03-005 - Mobile Workspace Behavior

Status: [ ]
Workstream: UI Shell
Depends on: T03-001, T03-003

Goal:
Ensure the converted workspace shell works on mobile.

Inputs:
- Sidebar
- Topbar
- Module layout
- Existing mobile design language if applicable

Steps:
- Verify navigation, primary actions, filters, cards, and detail surfaces on mobile.
- Collapse dense controls without hiding core actions.
- Ensure text fits inside buttons and cards.
- Record screenshots for changed surfaces.

Traps:
- Do not turn mobile into a marketing page.
- Do not hide required form fields behind unreachable controls.

Acceptance:
- Mobile shell is usable for core Work OS workflows.
- No overlapping text or controls on common mobile widths.

Tests:
- Browser QA at mobile viewport.
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

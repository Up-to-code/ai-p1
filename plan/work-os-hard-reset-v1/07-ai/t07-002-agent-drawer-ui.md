# T07-002 - Agent Drawer UI

Status: [ ]
Workstream: AI
Depends on: T07-001, T03-002

Goal:
Make the agent drawer a generic Work OS assistant surface.

Inputs:
- Existing agent/chat UI
- Topbar and module layouts
- Mobile behavior requirements

Steps:
- Remove real-estate prompt examples from the drawer.
- Show current context record when opened from a detail page.
- Support proposed actions with clear confirm/cancel controls.
- Ensure drawer works on desktop and mobile.

Traps:
- Do not add long explanatory content.
- Do not execute writes from chat without confirmation policy.

Acceptance:
- Agent drawer feels native to Work OS modules.
- It can operate with dashboard, record, and global context.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- Browser QA for drawer from dashboard and one record detail page.

Completion note:

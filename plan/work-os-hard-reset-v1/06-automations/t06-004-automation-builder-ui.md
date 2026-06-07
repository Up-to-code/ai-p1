# T06-004 - Automation Builder UI

Status: [ ]
Workstream: Automations
Depends on: T06-001, T06-002, T06-003, T03-003

Goal:
Build the automation rule constructor UI.

Inputs:
- Trigger, condition, and action models
- Existing automations placeholder route

Steps:
- Build automation list with enabled state and last run state.
- Build create/edit builder for trigger, conditions, and actions.
- Validate incomplete rules before save.
- Keep UI compact and operational.

Traps:
- Do not expose unsupported triggers/actions.
- Do not write long instructional content into the page.

Acceptance:
- Users can create, edit, enable, disable, and inspect automation rules.
- Builder uses generic Work OS labels.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- Browser QA for automation builder.

Completion note:

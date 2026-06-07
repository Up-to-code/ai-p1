# T05-003 - Custom Field Form Rendering

Status: [ ]
Workstream: Custom Fields
Depends on: T05-001, T05-002, T03-003

Goal:
Render custom fields in record create/edit forms.

Inputs:
- Record forms
- Field definitions and values
- Validation model

Steps:
- Add a generic renderer for each allowed field type.
- Place custom fields after core fields in forms.
- Validate required custom fields.
- Preserve typed values on edit.

Traps:
- Do not hard-code real-estate custom fields.
- Do not let custom fields break fixed form layout on mobile.

Acceptance:
- At least two record forms render custom fields through the same Module.
- Required and optional values behave correctly.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- Form unit tests for required, optional, select, and date fields.

Completion note:

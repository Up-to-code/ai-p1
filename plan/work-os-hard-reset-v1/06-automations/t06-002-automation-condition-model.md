# T06-002 - Automation Condition Model

Status: [ ]
Workstream: Automations
Depends on: T06-001, T05-002

Goal:
Define automation conditions for core and custom fields.

Inputs:
- Trigger model
- Custom field value model
- Record contracts

Steps:
- Define operators by field type.
- Define AND/OR grouping limits for V1.
- Define missing value behavior.
- Define condition evaluation errors.

Traps:
- Do not allow arbitrary code execution.
- Do not create unlimited nested condition trees in V1.

Acceptance:
- Conditions can be evaluated predictably for core and custom fields.
- Unsupported conditions fail safely.

Tests:
- `npm --workspace @qentrah/domain-contracts test`

Completion note:

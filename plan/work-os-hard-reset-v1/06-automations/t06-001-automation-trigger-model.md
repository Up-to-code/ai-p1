# T06-001 - Automation Trigger Model

Status: [x]
Workstream: Automations
Depends on: T01-008

Goal:
Define supported automation triggers.

Inputs:
- Automation domain model
- Record taxonomy

Steps:
- Define trigger types: record created, field changed, stage changed, due date reached, status changed.
- Define trigger payload shape.
- Define which record types support each trigger.
- Define disabled or unsupported trigger handling.

Traps:
- Do not merge AI suggestions with deterministic triggers.
- Do not create industry-specific triggers.

Acceptance:
- Trigger model is generic and testable.
- Downstream builder and execution tasks have stable trigger inputs.

Tests:
- `npm --workspace @qentrah/domain-contracts test`

Completion note:
- Completed on 2026-06-06.
- Evidence: [flexible-layer-spec.md](../flexible-layer-spec.md) defines common
  trigger fields, supported trigger types, supported record types, unsupported
  V1 triggers, payload shapes, disabled handling, and unsupported handling.
- This completes only the trigger model. Conditions, actions, builder UI,
  execution, and logs remain separate pending tasks T06-002 through T06-006.

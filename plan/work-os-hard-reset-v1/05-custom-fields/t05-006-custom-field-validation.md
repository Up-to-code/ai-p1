# T05-006 - Custom Field Validation

Status: [ ]
Workstream: Custom Fields
Depends on: T05-001, T05-002, T05-003

Goal:
Validate custom field values consistently on server and UI.

Inputs:
- Field definitions
- Value model
- Record validation schemas

Steps:
- Validate type-specific value channels.
- Validate required fields.
- Validate select options.
- Add tests for invalid type, missing required, stale option, and archived field.

Traps:
- Do not trust UI validation alone.
- Do not accept multiple typed value channels for one value.

Acceptance:
- Invalid custom field payloads are rejected before persistence.
- UI and server validation agree on error states.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains`
- `npm --workspace @qentrah/domain-contracts test`

Completion note:

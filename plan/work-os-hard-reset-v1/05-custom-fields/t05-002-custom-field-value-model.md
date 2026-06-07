# T05-002 - Custom Field Value Model

Status: [ ]
Workstream: Custom Fields
Depends on: T05-001

Goal:
Define storage for typed custom field values.

Inputs:
- Custom field definition model
- Convex schema
- Domain contracts

Steps:
- Define record type, record id, field definition id, and typed value channels.
- Ensure exactly one typed channel carries a value.
- Define value deletion when a field is archived.
- Define query needs for detail views and filters.

Traps:
- Do not store all values as untyped strings.
- Do not duplicate field metadata in every value row.

Acceptance:
- Custom values are type-safe enough for forms, filters, AI context, and connectors.
- Values link cleanly to definitions and records.

Tests:
- `npm --workspace @qentrah/domain-contracts test`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

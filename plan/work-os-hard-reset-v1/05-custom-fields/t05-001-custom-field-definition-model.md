# T05-001 - Custom Field Definition Model

Status: [x]
Workstream: Custom Fields
Depends on: T01-001

Goal:
Define the custom field definition model used by templates and records.

Inputs:
- `CONTEXT.md`
- Domain contracts
- Convex schema

Steps:
- Define key, label, type, required state, options, applicable record types, template id, order, archived state.
- Define allowed types: text, number, currency, date, select, multi-select, boolean, user, URL.
- Define uniqueness rules for keys per template and record type.
- Define default display behavior.

Traps:
- Do not use custom fields to avoid defining core required fields.
- Do not make real-estate fields global defaults.

Acceptance:
- Custom field definitions are generic and template-scoped.
- Record modules can render them without industry assumptions.

Tests:
- `npm --workspace @qentrah/domain-contracts test`
- `rg -n "customField|custom field" CONTEXT.md packages/domain-contracts/src apps/workspace/convex/schema.ts`

Completion note:
- Completed on 2026-06-06.
- Evidence: [flexible-layer-spec.md](../flexible-layer-spec.md) defines custom
  field definition fields, allowed field types, option rules, `appliesTo`
  record ids, uniqueness, display settings, and guardrails.
- This completes only the definition model. Value storage, form rendering, table
  columns, filtering, and validation remain separate pending tasks T05-002
  through T05-006.

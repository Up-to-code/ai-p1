# T01-001 - Work OS Record Taxonomy

Status: [x]
Workstream: Domain Model
Depends on: T00-003

Goal:
Lock the Work OS core record taxonomy before schema, UI, AI, MCP, and connectors use it.

Inputs:
- `CONTEXT.md`
- [Glossary](../glossary.md)
- [Current state audit](../current-state-audit.md)

Steps:
- Define the allowed core record ids and display names.
- Define which records can link to which other records.
- Define which records support custom fields, automations, AI actions, and connector access.
- Update downstream tasks if a record type is missing.

Traps:
- Do not introduce industry-specific records as core records.
- Do not keep property or unit as synonyms.

Acceptance:
- One taxonomy is used by contracts, schema, UI, AI, MCP, and connectors.
- Real estate is classified only as a workspace template.

Tests:
- `rg -n "Work OS core records|Workspace template|Record link|Automation rule" CONTEXT.md plan/work-os-hard-reset-v1`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines the
  allowed core record ids, common fields, capabilities, record links, and the
  real-estate-as-template rule.
- Evidence command:
  - `rg -n "Work OS core records|Workspace template|Record link|Automation rule" CONTEXT.md plan/work-os-hard-reset-v1`
- Downstream tasks should use the domain interface spec as the record Interface
  for schema, UI, AI, MCP, connectors, and tests.

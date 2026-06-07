# T01-009 - Record Link Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001

Goal:
Define Record Link as the generic relationship model between core records.

Inputs:
- Current client-unit and project-asset linkage patterns
- Work OS core record taxonomy

Steps:
- Define source record, target record, link type, label, created by, and timestamps.
- Define allowed link types: related, owns, depends on, blocks, created from, attached to.
- Define link display rules for detail views and AI context.
- Define deletion behavior for linked records.

Traps:
- Do not add direct foreign keys for every possible relationship.
- Do not preserve unit-link as a special core relationship.

Acceptance:
- Cross-record relationships use one generic model.
- UI, AI, MCP, and connectors can reason over links consistently.

Tests:
- `rg -n "unitLink|linkedUnit|recordLinks|record link" apps/workspace packages/domain-contracts/src`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines the
  Record link fields, allowed link types, and deletion behavior.
- The model replaces pair-specific links such as client-unit with one generic
  relationship Interface for UI, AI, MCP, and connectors.

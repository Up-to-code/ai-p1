# T01-002 - Client Record Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001

Goal:
Define the generic Client record model.

Inputs:
- Existing client schemas and forms
- Client pipeline code
- Competitor benchmark needs for CRM-style records

Steps:
- Define required fields: name, type, owner, status, source, contact, tags.
- Define optional fields: company, email, phone, website, notes, custom fields.
- Define linked records: opportunities, projects, tasks, events, assets.
- Define allowed AI and automation actions.

Traps:
- Do not encode buyer, tenant, broker, or unit-link assumptions.
- Do not keep viewing as a pipeline status.

Acceptance:
- Client model supports any industry client relationship.
- Downstream form, table, detail, API, and MCP tasks have clear fields.

Tests:
- `rg -n "viewing|unitLink|unit link|broker" apps/workspace/src/domains/clients apps/workspace/src/server/domains/clients`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines the
  Client purpose, fields, statuses, views, AI actions, automation triggers, and
  linked records.
- The model explicitly excludes buyer, tenant, broker, unit-link, and viewing
  assumptions from the core Client Interface.

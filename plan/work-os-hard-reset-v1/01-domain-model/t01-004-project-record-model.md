# T01-004 - Project Record Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001

Goal:
Define the generic Project record model.

Inputs:
- Existing project schemas, forms, and view models
- Project task and asset links

Steps:
- Define fields: name, client, owner, team, status, health, start date, end date, budget, description, tags.
- Define linked records: opportunities, tasks, events, assets, clients.
- Define default statuses: planned, active, paused, completed, archived.
- Define project health: on track, at risk, blocked.

Traps:
- Do not keep developer, REGA, project inventory, unit count, bedrooms, or bathrooms.
- Do not make Project an asset container only.

Acceptance:
- Project represents coordinated work for any industry.
- Inventory-specific concepts are removed or moved to optional template custom fields.

Tests:
- `rg -n "developer|REGA|inventory|unit|bedroom|bathroom" apps/workspace/src/domains/projects apps/workspace/src/server/domains/projects`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines the
  Project purpose, fields, statuses, health values, views, AI actions,
  automation triggers, and linked records.
- The model excludes developer, REGA, inventory, units, bedrooms, and bathrooms
  from the core Project Interface.

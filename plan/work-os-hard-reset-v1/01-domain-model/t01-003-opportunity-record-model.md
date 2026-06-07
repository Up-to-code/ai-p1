# T01-003 - Opportunity Record Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001

Goal:
Define the generic Opportunity record model.

Inputs:
- Placeholder opportunity route
- Client pipeline concepts
- Benchmark pipeline and CRM patterns

Steps:
- Define fields: title, client, stage, value, owner, source, priority, close date, next step, tags.
- Define linked records: client, project, tasks, events, assets.
- Define default stages: new, qualified, proposal, negotiation, won, lost.
- Define board grouping by stage and table columns by owner, value, date, status.

Traps:
- Do not call opportunities leads, deals, listings, requests, units, or viewings in core language.
- Do not require a project before opportunity creation.

Acceptance:
- Opportunity is a generic pipeline item independent of industry.
- It can become or link to a Project.

Tests:
- `rg -n "lead|deal|listing|viewing|unit" apps/workspace packages/domain-contracts/src`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines the
  Opportunity purpose, fields, default stages, views, AI actions, automation
  triggers, and record links.
- The model explicitly avoids lead, deal, listing, request, unit, and viewing
  as core opportunity language.

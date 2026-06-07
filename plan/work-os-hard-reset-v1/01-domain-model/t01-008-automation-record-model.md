# T01-008 - Automation Record Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001

Goal:
Define Automation Rule as a Work OS core record.

Inputs:
- Placeholder automations route
- Existing agent and workflow concepts

Steps:
- Define fields: name, description, enabled, trigger, conditions, actions, owner, last run state.
- Define supported triggers: record created, field changed, stage changed, due date reached, status changed.
- Define supported actions: create task, schedule event, update field, notify, link record.
- Define audit and failure state requirements.

Traps:
- Do not merge automations with AI actions; AI may suggest rules but automation executes deterministic rules.
- Do not make automation industry-specific.

Acceptance:
- Automation model is clear enough for schema, UI builder, execution service, MCP, and connector tasks.

Tests:
- `rg -n "automation|trigger|condition|action" apps/workspace packages/domain-contracts/src`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines
  Automation rule purpose, fields, trigger families, action families, views, and
  AI actions.
- The model separates deterministic automations from AI suggestion/planning.

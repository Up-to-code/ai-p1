# T04-002 - Opportunities List Board Form Detail

Status: [ ]
Workstream: Records
Depends on: T01-003, T02-004, T03-003

Goal:
Build Opportunity list, pipeline board, form, and detail workflows.

Inputs:
- Opportunity domain model
- Existing placeholder route
- Client link model

Steps:
- Implement opportunity queries and mutations if missing.
- Build table view with stage, value, owner, client, close date, next step.
- Build board view grouped by stage.
- Build create/edit form and detail view with linked tasks/events/assets/project.

Traps:
- Do not use lead, deal, listing, unit, or viewing language.
- Do not block opportunity creation when no client exists; allow later linking if product supports it.

Acceptance:
- Opportunity pipeline works as a first-class module.
- Opportunity can link to a client and become linked to a project.

Tests:
- `npm --workspace @qentrah/workspace test -- src/domains/opportunities apps/workspace/convex/opportunities`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

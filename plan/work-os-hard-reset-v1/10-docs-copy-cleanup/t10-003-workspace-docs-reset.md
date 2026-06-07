# T10-003 - Workspace Docs Reset

Status: [ ]
Workstream: Docs Copy Cleanup
Depends on: T02-002, T08-010, T09-006

Goal:
Reset Workspace technical docs to Work OS records and integrations.

Inputs:
- `apps/workspace/docs`
- Workspace schema and MCP tasks
- Connector tasks

Steps:
- Replace property data model docs with Work OS record docs.
- Update MCP implementation docs.
- Update partner resource docs to assets/tasks/projects/clients/opportunities where needed.
- Classify old compliance docs as removed, retained, or future-template-only.

Traps:
- Do not delete security/auth docs because they mention partner apps.
- Do not keep stale property docs linked from docs indexes.

Acceptance:
- Workspace docs reflect active Work OS infrastructure.

Tests:
- `rg -n "property|unit|broker|developer|REGA|viewing" apps/workspace/docs apps/workspace/src/app/[locale]/docs`

Completion note:

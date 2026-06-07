# T02-004 - Validation Schemas

Status: [x]
Workstream: Backend Schema
Depends on: T02-001, T02-002

Goal:
Replace old validation schemas with generic Work OS validation.

Inputs:
- Workspace server validation folders
- Domain contract schemas
- UI form requirements

Steps:
- Create or update validation for each core record.
- Ensure required fields match record task files.
- Remove real-estate-only requirements.
- Add tests for valid and invalid payloads.

Traps:
- Do not let UI-only labels become backend field names.
- Do not keep client-only task validation.

Acceptance:
- Server validation accepts Work OS payloads and rejects invalid shapes.
- Validation tests no longer encode real-estate fields.

Tests:
- `npm --workspace @qentrah/workspace test -- src/server/domains`

Completion note:
Completed for server-side validation. Workspace server validation now accepts Work OS payloads for clients, projects, assets, calendar events, and tasks, normalizes optional blank text where appropriate, and rejects invalid shapes without encoding real-estate-only fields. Agent tool input and orchestrator tests were updated to Work OS client payloads.

Scope note:
Some frontend form schemas still carry temporary compatibility fields for unfinished record screens. Those are not backend validation contracts and should be removed in the later record UI tasks (`T04-*`) when the screens are converted away from the old property/card forms.

Evidence:
- `npm --workspace @qentrah/workspace test -- src/server/domains`
- `npm --workspace @qentrah/workspace run typecheck`
- `git diff --check -- apps/workspace/src/server/domains apps/workspace/src/domains/convex/query-load-guard.test.ts apps/workspace/convex/assets/read.ts plan/work-os-hard-reset-v1/02-backend-schema/t02-003-index-and-query-plan.md plan/work-os-hard-reset-v1/02-backend-schema/t02-004-validation-schemas.md plan/work-os-hard-reset-v1/tasks.md`

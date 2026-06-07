# T02-005 - Seed And Fixture Reset

Status: [ ]
Workstream: Backend Schema
Depends on: T02-004

Goal:
Replace real-estate fixtures with industry-neutral Work OS sample data.

Inputs:
- Convex seeds
- Test fixtures
- UI view model fixtures

Steps:
- Remove villa, unit, listing, REGA, and viewing examples.
- Add generic sample clients, opportunities, projects, tasks, events, assets, and automations.
- Keep examples concise and operational.
- Update snapshots or tests that depend on old fixture names.

Traps:
- Do not create fake marketing copy inside operational screens.
- Do not introduce a new industry-specific default.

Acceptance:
- Sample data demonstrates Work OS across multiple generic workflows.
- Tests do not depend on real-estate fixtures.

Tests:
- `rg -n "villa|unit|listing|REGA|viewing|bedroom|bathroom" apps/workspace packages`
- `npm --workspace @qentrah/workspace test`

Completion note:
- 2026-06-06 progress:
  - Converted local sample data in calendar, assets, clients, projects, dashboard threads, UI view-model fixtures, and selected package fixtures to industry-neutral Work OS examples.
  - Converted the AG UI project create draft from broker/rooms/bathrooms sample data to owner/workspace/budget/timeline/resources sample data.
  - Verified focused workspace seed/form/view-model tests: `npm --workspace @qentrah/workspace test -- src/domains/clients/client-view-model.test.ts src/domains/assets/asset-view-model.test.ts src/domains/assets/asset-form.schema.test.ts src/domains/projects/project-view-model.test.ts src/domains/projects/project-form.schema.test.ts src/domains/dashboard/dashboard-view-model.test.ts src/server/domains/clientTasks/validation/client-task.schema.test.ts src/server/domains/agents/policies/risk-policy.test.ts src/server/domains/organization/handlers/workspace-read-surface.test.ts`.
  - Verified touched package fixtures: `npm --workspace @qentrah/base-logic test -- src/text.test.ts && npm --workspace @qentrah/market-logic test -- src/normalizers.test.ts && npm --workspace @qentrah/domain-contracts test -- src/domain-contracts.test.ts && npm --workspace @qentrah/ui test -- src/ui.test.tsx`.
  - Verified workspace typecheck: `npm --workspace @qentrah/workspace run typecheck`.
  - Kept this task open because the broad legacy scan still finds structural UI/schema/product references, including asset `bedrooms`/`bathrooms`, client `viewing` pipeline states, calendar `site-viewing`, project offering type enums, domain-contract project fields, and market normalizer patterns. Those need their own domain/UI reset tasks instead of being hidden inside seed cleanup.

# T02-001 - Domain Contracts Reset

Status: [x]
Workstream: Backend Schema
Depends on: T01-001

Goal:
Replace shared real-estate-shaped contracts with Work OS contracts.

Inputs:
- `packages/domain-contracts/src`
- Domain model task files

Steps:
- Export Work OS record contracts from the package interface.
- Remove property/unit first-class contracts from active exports.
- Replace broker/developer audience defaults with workspace/business-neutral values.
- Add tests for each core record contract.

Traps:
- Do not leave old contracts exported for compatibility unless explicitly classified.
- Do not let shared packages import app-specific Convex APIs.

Acceptance:
- Shared contracts describe Work OS records only.
- Domain contract tests cover generic clients, opportunities, projects, tasks, events, assets, automations, custom fields, links, and templates.

Tests:
- `npm --workspace @qentrah/domain-contracts test`
- `npm --workspace @qentrah/domain-contracts run build`

Completion note:
- Completed on 2026-06-06.
- Implemented a deeper Work OS contract Interface in
  `packages/domain-contracts/src/workOs.ts`:
  - core record type schemas for clients, opportunities, projects, tasks,
    calendar events, and assets
  - typed custom field definitions and values
  - record links
  - workspace templates
  - automation triggers, conditions, actions, and rules
- Updated `packages/domain-contracts/src/workspace.ts` and
  `packages/workspace-logic/src/zones.ts` so workspace audience and zones are
  Work OS neutral instead of broker/developer UI modes.
- Removed obvious old record subpath exports from
  `packages/domain-contracts/package.json`: deals, offers, projects, assets,
  market, and inbox. Also removed `market` from the root barrel export.
- Added domain-contract tests for generic Work OS core records, typed custom
  fields, record links, workspace templates, and automation rules.
- Legacy broker/RED owner-context mapping remains in `workspace.ts` as a storage
  seam until organization schema reset tasks handle it. It is no longer the
  workspace audience model.
- Verification:
  - `npm --workspace @qentrah/domain-contracts test`: passed, 2 files and 19
    tests.
  - `npm --workspace @qentrah/domain-contracts run build`: passed.
  - `npm --workspace @qentrah/workspace-logic test`: passed.
  - `npm --workspace @qentrah/workspace-logic run build`: passed.

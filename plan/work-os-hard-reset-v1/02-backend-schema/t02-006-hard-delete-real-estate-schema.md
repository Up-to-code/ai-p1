# T02-006 - Hard Delete Real Estate Schema

Status: [x]
Workstream: Backend Schema
Depends on: T02-001, T02-002, T02-004, T02-005

Goal:
Remove first-class real-estate schema and code paths after replacements exist.

Inputs:
- Forbidden-term audit
- Domain contracts reset
- Convex table reset
- Validation reset

Steps:
- Delete old property/unit schema files if still present.
- Remove active exports and imports of old resource contracts.
- Remove tests that only prove deleted real-estate behavior.
- Classify any remaining matches as allowed exceptions.

Traps:
- Do not delete partner authorization or unrelated organization concepts by name similarity.
- Do not leave broken imports hidden in untested packages.

Acceptance:
- Active schema no longer has property/unit as first-class resources.
- Typecheck catches no stale imports.

Tests:
- `npm run typecheck --workspaces --if-present`
- `rg -n "properties|property|unit|units" apps packages`

Completion note:
- Completed 2026-06-06.
- Deleted the dead, unexported legacy contract files `packages/domain-contracts/src/assets.ts` and `packages/domain-contracts/src/projects.ts`.
- Removed stale partner tsconfig aliases for `@qentrah/domain-contracts/assets` and `@qentrah/domain-contracts/projects`.
- Renamed the Convex data-security deleted-flag backfill target from `propertiesDeletedFlag` to `assetsDeletedFlag` across target adapters, validators, and schema.
- Renamed lingering Convex asset presenter internals from `safeProperty` to `safeAsset`.
- Renamed the UploadThing asset endpoint from `propertyMedia` to `assetMedia` and updated the media upload caller.
- Updated stale source tests and fixtures from unit/property naming to asset naming.
- Required scan result: `rg -n "propertyMedia|propertiesDeletedFlag|safeProperty|project-unit|unit_" apps/workspace/convex apps/workspace/src packages/domain-contracts/src apps/partners/tsconfig.json --glob '*.{ts,tsx,json,md}'` only reports Tamara `unit_price`, which is an external payment API field and not a property/unit resource.
- Validation:
  - `npm --workspace @qentrah/workspace test -- convex/workspace/dashboardOverview.test.ts src/domains/projects/project-asset-history-source.test.ts`
  - `npm --workspace @qentrah/domain-contracts test -- src/domain-contracts.test.ts`
  - `npm run typecheck --workspaces --if-present`

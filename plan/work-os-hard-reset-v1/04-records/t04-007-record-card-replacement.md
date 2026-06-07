# T04-007 - Record Card Replacement

Status: [ ]
Workstream: Records
Depends on: T01-001, T03-003

Goal:
Replace property/unit cards with generic Work OS record cards.

Inputs:
- Existing `PropertyCard`, `AssetCard`, project unit selectors, AG UI cards
- Record domain models

Steps:
- Remove property-specific card exports.
- Create generic card patterns for client, opportunity, project, task, event, asset, and automation.
- Show title, status, owner, linked record, date/value/priority, and tags where relevant.
- Update imports across workspace and shared UI packages.

Traps:
- Do not create one giant card with every possible prop.
- Do not preserve bedrooms/bathrooms as card metadata.

Acceptance:
- No active UI imports property/unit cards.
- Cards are compact and reusable without leaking old domain assumptions.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- `npm --workspace @qentrah/ui test`
- `rg -n "PropertyCard|ProjectUnit|bedroom|bathroom" apps packages`

Completion note:

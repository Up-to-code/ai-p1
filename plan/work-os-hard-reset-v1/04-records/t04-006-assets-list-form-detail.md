# T04-006 - Assets List Form Detail

Status: [ ]
Workstream: Records
Depends on: T01-007, T02-004, T03-003

Goal:
Complete generic Assets list, form, and detail workflows.

Inputs:
- Asset domain model
- Existing media/upload APIs
- Existing asset placeholder work

Steps:
- Remove property-card fields from asset UI and validation.
- Build list/table with type, status, owner, linked records, updated date.
- Build create/edit form for files, URLs, resources, deliverables, and metadata.
- Build detail view with preview, links, notes, and activity.

Traps:
- Do not make Asset a renamed property listing.
- Do not require media upload for URL/link assets.

Acceptance:
- Assets work as generic resources across records.
- Old bedrooms/bathrooms/listing fields are gone.

Tests:
- `npm --workspace @qentrah/workspace test -- src/domains/assets src/server/domains/assets`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

# T01-007 - Asset Record Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001

Goal:
Define Asset as a generic resource, file, document, media item, link, or deliverable.

Inputs:
- Existing media and asset schemas
- Existing property card replacement work

Steps:
- Define fields: name, type, status, owner, file id or URL, description, tags, metadata.
- Define linked records: clients, opportunities, projects, tasks, events.
- Define default types: file, document, image, video, link, deliverable, note.
- Define card and table presentation.

Traps:
- Do not keep bedrooms, bathrooms, price, unit status, or listing fields as asset fields.
- Do not make Asset a renamed Property.

Acceptance:
- Asset can represent any reusable work resource.
- Property-style fields are not required by contracts, UI, API, or MCP tools.

Tests:
- `rg -n "bedroom|bathroom|listing|property|unit" apps/workspace/src/domains/assets apps/workspace/src/server/domains/assets packages/domain-contracts/src/assets.ts`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines Asset
  as a generic resource/file/document/media/link/deliverable with fields, types,
  statuses, views, AI actions, automation triggers, and links.
- The model excludes bedrooms, bathrooms, price, unit status, listing fields,
  and property-as-asset assumptions from the core Asset Interface.

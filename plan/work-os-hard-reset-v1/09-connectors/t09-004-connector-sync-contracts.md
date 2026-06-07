# T09-004 - Connector Sync Contracts

Status: [ ]
Workstream: Connectors
Depends on: T09-002, T09-003

Goal:
Define how connectors sync external data with Work OS records.

Inputs:
- Existing partner workspace sync package
- Workspace resource APIs
- Record link model

Steps:
- Define inbound, outbound, and bidirectional sync shapes.
- Define external id mapping.
- Define conflict handling and canonical owner.
- Define idempotency requirements.

Traps:
- Do not create a custom sync engine if existing partner resource access already supplies the seam.
- Do not make external system fields core Work OS fields.

Acceptance:
- Sync contracts are explicit and testable.
- Connector sync can be implemented without contaminating core records.

Tests:
- `npm --workspace @qentrah/partner-workspace-sync test`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

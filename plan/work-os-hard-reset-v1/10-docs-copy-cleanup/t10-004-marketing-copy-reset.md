# T10-004 - Marketing Copy Reset

Status: [ ]
Workstream: Docs Copy Cleanup
Depends on: T01-001

Goal:
Reset marketing copy from real estate to Work OS.

Inputs:
- `apps/marketing`
- Workspace public landing components
- Product docs

Steps:
- Replace real-estate positioning with Work OS positioning.
- Remove broker/developer/property references.
- Keep copy concise and product-specific.
- Update SEO metadata where needed.

Traps:
- Do not create a generic buzzword landing page.
- Do not mention modules that are not in V1 unless clearly framed as roadmap.

Acceptance:
- Public copy markets Qentrah as a Work OS.

Tests:
- `npm --workspace @qentrah/marketing run typecheck`
- `rg -n "real estate|property|unit|broker|developer|REGA" apps/marketing apps/workspace/src/components/landing`

Completion note:

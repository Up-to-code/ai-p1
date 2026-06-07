# T10-002 - Product Docs Reset

Status: [ ]
Workstream: Docs Copy Cleanup
Depends on: T01-001

Goal:
Reset product docs from real estate to Work OS.

Inputs:
- `docs/product`
- Benchmark map
- Domain model tasks

Steps:
- Replace real-estate positioning with Work OS positioning.
- Update feature source of truth.
- Keep benchmark study as roadmap input.
- Remove or archive stale property/unit product docs.

Traps:
- Do not leave docs saying Qentrah is a real-estate operating system.
- Do not overpromise V2 capabilities as V1 complete.

Acceptance:
- Product docs match the Work OS hard reset.

Tests:
- `rg -n "real estate|property|unit|broker|developer|REGA" docs/product`

Completion note:

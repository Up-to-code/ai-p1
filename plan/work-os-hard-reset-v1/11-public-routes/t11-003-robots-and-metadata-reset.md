# T11-003 - Robots And Metadata Reset

Status: [ ]
Workstream: Public Routes
Depends on: T11-001, T11-002

Goal:
Reset robots, manifest, metadata, and SEO structured data to Work OS routes.

Inputs:
- `apps/workspace/src/app/robots.ts`
- Manifests and metadata files
- SEO JSON-LD components

Steps:
- Remove old broker/developer/property route entries.
- Update product metadata to Work OS.
- Validate generated metadata does not include stale routes.
- Update tests if present.

Traps:
- Do not remove security/legal routes.
- Do not leave SEO JSON-LD describing real estate.

Acceptance:
- Public metadata matches the Work OS product.

Tests:
- `npm --workspace @qentrah/workspace run typecheck`
- `rg -n "real estate|property|broker|developer|REGA" apps/workspace/src/app apps/workspace/src/components/seo-json-ld.tsx`

Completion note:

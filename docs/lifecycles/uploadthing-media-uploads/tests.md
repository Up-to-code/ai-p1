# Tests

## Existing Checks

- Workspace typecheck covers route and uploader imports.

## Added/Expected Checks

- Unit tests for UploadThing token normalization:
  - quoted token values are sanitized
  - valid tokens hydrate legacy env aliases
  - missing token is tolerated for non-upload paths
  - malformed token reports invalid configuration
- Production env check validates `UPLOADTHING_TOKEN` shape.

## 2026-05-16 Checks Run

- `npm --workspace @qentrah/workspace test -- src/server/uploadthing/config.test.ts`
- `npm --workspace @qentrah/workspace run typecheck`
- `npm --workspace @qentrah/workspace run build`
- `cd apps/workspace && node scripts/check-production-env.mjs` validates UploadThing shape, but currently still reports unrelated missing `ADMIN_CONVEX_SERVICE_TOKEN` and `WORKSPACE_CONVEX_BRIDGE_SECRET` in local `.env.production`.

## Manual Checks

- In production, upload an organization logo from `/ar/settings/organization`.
- Confirm no error says `Invalid token`.

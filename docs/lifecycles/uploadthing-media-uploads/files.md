# Files

- `apps/workspace/src/server/uploadthing/config.ts`: normalizes and validates UploadThing env before the library reads `UPLOADTHING_TOKEN`.
- `apps/workspace/src/server/uploadthing/router.ts`: creates the UploadThing file router for authenticated image/media uploads.
- `apps/workspace/src/server/domains/media/services/media.ts`: uses `UTApi` for server-side media cleanup and must share the same config normalization.
- `apps/workspace/src/lib/uploadthing.ts`: browser uploader client pointing at `/api/uploadthing`.
- `apps/workspace/src/domains/organization/components/organization-logo-uploader.tsx`: production logo upload UI where the invalid-token error surfaced.
- `apps/workspace/scripts/check-production-env.mjs`: production env shape check for deploy readiness.

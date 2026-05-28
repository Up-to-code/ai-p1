# Files

- `apps/workspace/src/server/uploadthing/config.ts`: normalizes and validates UploadThing env before the library reads `UPLOADTHING_TOKEN`.
- `apps/workspace/src/server/uploadthing/router.ts`: creates the UploadThing file router for authenticated image/media uploads.
- `apps/workspace/src/server/uploadthing/intake.ts`: Upload intake Module for target policy, signed-in checks, organization media permissions, Agent attachment permissions, and upload completion mapping.
- `apps/workspace/convex/media/resourcePolicy.ts`: shared Convex media resource policy Module for permission resource mapping, resource existence checks, folder ownership, cover reset behavior, and folder asset detachment.
- `apps/workspace/convex/media/data.ts`: shared Convex media data Module for bounded resource media/folder reads, media/folder ordering, and cover selection.
- `apps/workspace/src/server/domains/media/services/media.ts`: uses `UTApi` for server-side media cleanup and must share the same config normalization.
- `apps/workspace/convex/media/attachment.ts`: internal media attachment Module for resource checks, folder ownership, cover handling, visibility rules, and audit writes.
- `apps/workspace/convex/media/write.ts`: stable Convex mutation facade for Hono media writes.
- `apps/workspace/src/lib/uploadthing.ts`: browser uploader client pointing at `/api/uploadthing`.
- `apps/workspace/src/domains/media/api/media.ts`: browser Media API wrapper for UploadThing attachment, cover/delete/share/folder mutations, and resource media Convex reads.
- `apps/workspace/src/domains/media/document-view-model.ts`: Media document view-model Module for local file type labels, pending upload intake and queue commands, pending upload names, share URLs, clipboard copying, and renamed `File` construction.
- `apps/workspace/src/domains/media/media-upload-view-model.ts`: Resource media upload view-model Module for default labels, accepted file rules, queue item creation, queue transition commands, user-facing upload errors, accept strings, queue status presentation, uploader constraint state, upload preview file-size labels, and pending-file removal.
- `apps/workspace/src/domains/media/media-browser-view-model.ts`: Resource media browser view-model Module for mode-specific allowed kinds, gallery cover ordering, preview windows, overflow counts, and viewer index movement.
- `apps/workspace/src/domains/media/components/client-documents-manager.tsx`: client document upload and sharing UI.
- `apps/workspace/src/domains/organization/components/organization-logo-uploader.tsx`: production logo upload UI where the invalid-token error surfaced.
- `apps/workspace/scripts/check-production-env.mjs`: production env shape check for deploy readiness.

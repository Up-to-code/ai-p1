# Changes

## 2026-05-28 Media Upload Preview Depth

- Deepened the Resource media upload view-model Module with upload preview file-size labels.
- Preserved displayed KB rounding, minimum one-KB fallback, queue state transitions, and UploadThing request behavior while removing queue presentation formatting from the component.

## 2026-05-28 Resource Media Queue Command Depth

- Deepened the Resource media upload view-model Module with upload queue transition commands for append, lookup, uploading, uploaded, failed, batch-failed, removal, and retry selection.
- Preserved immediate upload behavior, retry/removal semantics, UploadThing attachment calls, preview URL cleanup, and visible queue states while removing queue transition mapping from the component.

## 2026-05-28 Media Folder Detachment Depth

- Deepened the Convex media resource policy Module with folder asset selection and folder assignment clearing.
- Preserved media folder delete behavior, audit fields, soft-delete patching, and asset detachment while keeping the mutation facade unchanged.

## 2026-05-28 Client Document Queue Depth

- Deepened the Media document view-model Module with pending upload intake and queue command helpers for rename, edit-state, and removal behavior.
- Preserved Client document upload validation, queued-file rendering, rename behavior, and UploadThing attachment payloads while removing queue mutation logic from the screen.

## 2026-05-28 Media Read Ordering Depth

- Deepened `convex/media/data.ts` so resource media ordering, folder ordering, and cover image selection live behind one data Module Interface.
- Kept `convex/media/read.ts` exported query names, permission checks, resource media order, folder order, and cover fallback behavior stable.

## 2026-05-28 Resource Media Uploader State

- Deepened `domains/media/media-upload-view-model.ts` so Resource Media Uploader visible-media selection, existing video count, queued image count, pending video count, and pending-file removal live behind one view-model seam.
- Preserved UploadThing request behavior, accepted-file validation, immediate upload behavior, labels, and existing media rendering while moving branch-heavy UI state out of the component.

## 2026-05-16 Production Token Normalization

- Created lifecycle documentation for Workspace UploadThing media uploads.
- Recorded the production failure where image upload reported an invalid `UPLOADTHING_TOKEN` shape.
- Planned a focused fix in the UploadThing config helper and production env checker without changing the UI upload flow.
- Updated the UploadThing config helper to strip copied `.env` quotes, validate the base64 JSON token shape, write the sanitized token back to `process.env.UPLOADTHING_TOKEN`, and hydrate legacy `UPLOADTHING_SECRET`/`UPLOADTHING_APP_ID` aliases.
- Added focused tests for UploadThing token parsing and env hydration.
- Updated the production env checker and environment docs to catch malformed UploadThing token values before deploy.

## 2026-05-28 Media Attachment Depth

- Extracted Convex media attachment behavior into `convex/media/attachment.ts` so resource existence checks, folder validation, cover clearing, public visibility checks, and audit writes live behind one Module.
- Kept `convex/media/write.ts` function names and validators stable as the Hono-facing mutation facade.

## 2026-05-28 Upload Intake Depth

- Added `server/uploadthing/intake.ts` as the Upload intake Module for file policies, signed-in checks, organization resource permission checks, Agent attachment checks, and upload completion mapping.
- Kept the UploadThing router targets and route handler behavior stable while making `router.ts` a target declaration facade.

## 2026-05-28 Media Resource Policy Depth

- Added `convex/media/resourcePolicy.ts` so media reads and writes share one resource permission, existence, folder ownership, and cover reset Interface.
- Kept the stable media read/write Convex exports unchanged.

## 2026-05-28 Media Document View-Model Depth

- Added `domains/media/document-view-model.ts` so client document upload and sharing UI no longer owns local file kind inference, file labels, share URL construction, clipboard copying, pending upload names, or renamed `File` construction.
- Preserved UploadThing targets, media attachment requests, and document sharing behavior.

## 2026-05-28 Resource Media Upload View-Model Depth

- Added `domains/media/media-upload-view-model.ts` so resource media upload UI no longer owns accepted file rules, default labels, UploadThing error shaping, accept strings, or queue status labels inline.
- Preserved pending upload behavior, immediate queue retry/removal behavior, cover/delete actions, UploadThing attachment behavior, and localized labels.
- Added focused tests for accept strings, limit filtering, unsupported-file errors, UploadThing setup errors, and queue status presentation.

## 2026-05-28 Resource Media Browser View-Model Depth

- Added `domains/media/media-browser-view-model.ts` so resource media browsing no longer owns allowed-kind selection, gallery cover ordering, preview windows, overflow counts, or viewer index movement inline.
- Preserved gallery/document modes, upload modal behavior, cover/delete actions, and existing media read hooks.

## 2026-05-28 Media Browser Request Depth

- Moved browser Media API mutations onto the shared organization request Module for route segment encoding, JSON request construction, and error fallback behavior.
- Preserved Media API exported function names, UploadThing attachment payloads, cover/delete/share/folder mutation methods, and Convex read hooks.
- Added focused tests for attachment payloads, encoded media/folder routes, and missing upload URL validation.

## 2026-05-28 Media Data Read Depth

- Made `convex/media/data.ts` the explicit bounded read Module for resource media and folders.
- Replaced the unbounded folder `.collect()` with a named resource-folder limit while preserving folder duplicate checks and folder list behavior for normal resource sizes.

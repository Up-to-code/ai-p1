# Changes

## 2026-05-16 Production Token Normalization

- Created lifecycle documentation for Workspace UploadThing media uploads.
- Recorded the production failure where image upload reported an invalid `UPLOADTHING_TOKEN` shape.
- Planned a focused fix in the UploadThing config helper and production env checker without changing the UI upload flow.
- Updated the UploadThing config helper to strip copied `.env` quotes, validate the base64 JSON token shape, write the sanitized token back to `process.env.UPLOADTHING_TOKEN`, and hydrate legacy `UPLOADTHING_SECRET`/`UPLOADTHING_APP_ID` aliases.
- Added focused tests for UploadThing token parsing and env hydration.
- Updated the production env checker and environment docs to catch malformed UploadThing token values before deploy.

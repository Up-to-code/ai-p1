# UploadThing Media Uploads

## Purpose

Workspace uses UploadThing for organization logos, profile pictures, and resource media. This lifecycle tracks the production upload flow and the environment variables needed before the UploadThing server runtime initializes.

## Owner

- App: `apps/workspace`
- Main routes: `/api/uploadthing`
- Main UI entrypoints: organization logo/profile uploaders and resource media uploaders

## Current Status

Production UploadThing v7 requires `UPLOADTHING_TOKEN` to be a base64 encoded JSON object with `apiKey`, `appId`, and `regions`. Workspace normalizes quoted `.env`/Vercel values before creating the UploadThing route handler or `UTApi`.

# Marketing Payload CMS

## Purpose

Documents the Payload CMS integration that powers editable marketing content for the public Qentrah marketing app.

## Owner

- App: `apps/marketing`
- Package: `@qentrah/marketing`

## Entrypoints

- Payload Admin UI: `apps/marketing/app/(payload)/admin/[[...segments]]/page.tsx`
- Payload REST API: `apps/marketing/app/(payload)/api/[...slug]/route.ts`
- Payload GraphQL API: `apps/marketing/app/(payload)/graphql/route.ts`
- Public content readers: `apps/marketing/lib/payload-api.ts`
- Root Payload wrapper: `apps/marketing/app/layout.tsx`

## Actor/System Flow

- Marketing editors authenticate through the Payload admin collection configured in `collections/Users.ts`.
- Payload stores CMS content in the SQLite database configured by `payload.config.ts`.
- Public blog, sitemap, and future CMS-backed sections read content through local Payload accessors.

## Current Status

Payload is embedded in the Next.js marketing app via `@payloadcms/next`. The app declares Payload runtime dependencies directly in `apps/marketing/package.json`, including `graphql`, which is required by the generated GraphQL route.

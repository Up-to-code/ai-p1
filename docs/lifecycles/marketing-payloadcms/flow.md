# Flow

## Build/runtime dependency flow

1. Next.js loads `apps/marketing/next.config.ts`.
2. `withPayload` wires Payload aliases such as `@payload-config` into the marketing app build.
3. The generated Payload app routes import `@payloadcms/next` route/view helpers.
4. The GraphQL route imports `@payloadcms/graphql`, which imports the `graphql` package at build time.
5. The marketing app must declare `graphql` as a direct workspace dependency so isolated workspace/Vercel installs can resolve it.

## Public content flow

1. Localized public pages call functions from `apps/marketing/lib/payload-api.ts`.
2. `payload-api.ts` calls `getPayloadClient()` from `apps/marketing/lib/payload.ts`.
3. Payload loads `payload.config.ts`, collections, localization, and SQLite adapter.
4. Public readers request published/localized content and map Payload documents to marketing-facing types.
5. Pages that can tolerate missing CMS data catch failures and render empty/static fallbacks where implemented.

## Admin/API flow

1. Editors use `/admin` handled by generated Payload admin pages.
2. Payload routes are under the `(payload)` route group and load `@payloadcms/next/css` from `app/(payload)/layout.tsx`.
3. Public marketing pages are under the `(site)` route group and load `globals.css` from `app/(site)/layout.tsx`, so marketing Tailwind/global rules do not cascade into Payload admin.
4. REST calls hit `/api/[...slug]` and dispatch to Payload REST handlers.
5. GraphQL calls hit `/graphql` and dispatch to Payload GraphQL handlers.
6. The root app layout provides Payload server functions/import map for admin UI behavior without marketing-specific document styling.

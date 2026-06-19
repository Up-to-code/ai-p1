# Tests

## Existing commands

- `npm --workspace @qentrah/marketing run typecheck`
- `npm --workspace @qentrah/marketing run build`

## Checks run

- 2026-06-19: `npm --workspace @qentrah/marketing run typecheck` passed before dependency change.
- 2026-06-19: `npm --workspace @qentrah/marketing run build` failed before dependency change because `@payloadcms/graphql` could not resolve `graphql`.
- 2026-06-19: `npm --workspace @qentrah/marketing run typecheck` passed after adding `graphql`.
- 2026-06-19: `npm --workspace @qentrah/marketing run build` passed after adding `graphql`.
- 2026-06-19: `npm --workspace @qentrah/marketing run typecheck` passed after importing Payload admin CSS.
- 2026-06-19: `npm --workspace @qentrah/marketing run build` passed after importing Payload admin CSS.
- 2026-06-19: `npm --workspace @qentrah/marketing run typecheck` passed after isolating marketing CSS into `(site)`.
- 2026-06-19: `npm --workspace @qentrah/marketing run build` passed after isolating marketing CSS into `(site)`.
- 2026-06-19: `npm --workspace @qentrah/marketing run typecheck` passed after CMS foundation implementation (locales, workspace links, blocks, fields, collections).
- 2026-06-19: `npm --workspace @qentrah/marketing run typecheck` passed after frontend CMS renderer implementation (page renderer, all block renderers).
- 2026-06-19: `npm --workspace @qentrah/marketing run typecheck` passed after connecting public pages to CMS (pricing, about, contact, docs with SEO).

## Missing coverage

- No automated route-level tests currently verify `/admin`, `/api/[...slug]`, or `/graphql`.
- No CMS fixture test verifies blog rendering against seeded Payload data.

## Manual checks

- For admin/API changes, run the marketing app locally and check `/admin`, `/api/blog-posts`, and `/graphql` if the database and `PAYLOAD_SECRET` are configured.

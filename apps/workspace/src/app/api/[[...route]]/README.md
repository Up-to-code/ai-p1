# Hono Catch-All Route

## Purpose
Delegates all `/api/*` requests from Next.js to the Hono application.

## What Belongs Here
- Minimal `hono/vercel` adapter exports.

## What Must Not Live Here
- Route definitions.
- Domain handlers.
- Validation logic.
- Auth or permission checks.
- Credentials.

## Public Export Expectations
Export only HTTP methods backed by `handle(app)`.

## Agent And Programmer Rules
- Keep this file boring.
- Hono owns API routing.
- Domains own business boundaries.

## Future Implementation Notes
Future API work should start in `src/server/routing/v1` and domain folders, not in this adapter.

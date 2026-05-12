# API Adapter Boundary

## Purpose
This folder exists only to let Next.js host the Hono adapter for `/api/*`.

## What Belongs Here
- Catch-all adapter folders required by Next.js.
- Adapter documentation.

## What Must Not Live Here
- Business route handlers.
- Native Next.js API logic.
- Auth, authorization, service, database, Convex, or provider code.

## Public Export Expectations
The catch-all route exports HTTP methods from `hono/vercel` only.

## Agent And Programmer Rules
- Do not add feature endpoints here.
- Do not import `NextRequest` or `NextResponse` for API business logic.
- Add backend routes in `src/server/routing` and `src/server/domains`.

## Future Implementation Notes
If a new HTTP method is needed, add it to the adapter only after the Hono app supports it.

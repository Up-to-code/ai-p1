# Middleware

## Purpose
Backend middleware boundary for the Hono server architecture. Middleware here will eventually compose request lifecycle concerns before domain handlers run.

## What Belongs Here
- Request id, timing, logging, error-boundary, and tracking middleware placeholders
- Security middleware placeholders for CORS, secure headers, origin guards, host checks, and referrer checks
- Operational middleware placeholders for request size, bandwidth, cache control, checker context, and rate limits
- Future one-file-per-function implementation units

## What Must Not Live Here
- Domain business logic
- Direct database, Convex, Better Auth, Auth0, queue, or cache provider calls
- Cross-domain internals
- Credentials or provider secrets

## Public Export Expectations
Export only explicit contracts or stable composition entrypoints. Empty `index.ts` files are allowed during initialization.

## Agent And Programmer Rules
- Keep middleware domain-neutral and reusable.
- Do not read full request bodies by default; loader and request-size checks must define limits before reading.
- Checkers should return decisions through contracts and should not throw by default.
- When implementation begins, use one function per file.
- Do not add real behavior in this initialization pass.

## Future Implementation Notes
Expected Hono middleware order:

1. Request id
2. Timing
3. Secure headers
4. CORS, origin, host, and referrer checks
5. Request loader, body-size, and bandwidth checks
6. IP tracking
7. Cache checker
8. Auth and session
9. Authorization
10. Route handlers
11. Error boundary and tracking

Prefer Hono-native middleware where appropriate: `hono/cors` for CORS, `hono/secure-headers` for security headers, and `hono/cache` only when the runtime supports the Web Cache API.

# Middleware / Cache Control

## Purpose
Hono middleware readiness boundary for cache-control.

## What Belongs Here
- Middleware contracts
- Future Hono middleware factories
- Ordering notes and dependency expectations

## What Must Not Live Here
- Live middleware behavior in this initialization pass
- Domain business logic
- Provider SDK wiring
- Secrets or environment-specific allowlists

## Public Export Expectations
Export middleware factories only when implemented later. Keep initialization exports empty.

## Agent And Programmer Rules
- Middleware order matters.
- Keep request id and timing first.
- Keep security checks before auth and handlers.
- Keep error tracking vendor-neutral.

## Future Implementation Notes
Future order: request id, timing, secure headers, CORS/origin/host/referrer checks, loader/body/bandwidth checks, IP tracking, cache checker, auth, authorization, route handlers, error tracking.

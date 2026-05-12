# Security

## Purpose
Backend security checker boundary for domain-neutral request safety decisions.

## What Belongs Here
- Origin, CORS, referrer, headers, CSRF, host, content-type, method, and bot checker contracts
- Policy shape definitions with no environment values
- Future composable checker implementations

## What Must Not Live Here
- Domain business rules
- Hard-coded origin, host, IP, tenant, or user allowlists
- Credentials, provider secrets, tokens, cookies, or request bodies
- Cross-domain internals

## Public Export Expectations
Export explicit security contracts only. Live checker composition belongs in middleware once implementation is requested.

## Agent And Programmer Rules
- Checkers must be composable and domain-neutral.
- Checkers return contract decisions; they do not throw by default.
- Sensitive request data must be redacted before observability events are emitted.
- When implementation begins, use one function per file.
- Do not add real behavior in this initialization pass.

## Future Implementation Notes
Future security checks should run before auth/session work where possible, then pass sanitized context to auth guards and domain services.

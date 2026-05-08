# Cache / Read Through

## Purpose
Cache sub-boundary for read-through.

## What Belongs Here
- Type-only cache contracts
- Placeholder policy notes
- Future provider-neutral helpers

## What Must Not Live Here
- Live persistence
- Provider SDKs
- Hard-coded keys
- Business logic

## Public Export Expectations
Export scoped cache contracts only.

## Agent And Programmer Rules
- Keep cache keys explicit and sanitized.
- Keep per-user and per-checker scopes separate.
- Do not cache authorization decisions without a dedicated policy.

## Future Implementation Notes
Implement after TTL, invalidation, and data-sensitivity rules are approved.

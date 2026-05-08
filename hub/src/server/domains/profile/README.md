# Profile Backend Domain

## Purpose
Owns backend contracts and future Hono implementation units for the profile bounded context.

## What Belongs Here
- Domain route placeholders
- Thin handler placeholders
- Domain services and service contracts
- Domain/subdomain validation
- Domain/subdomain types and interfaces
- Domain policies, access checks, events, audit notes, and data contracts

## What Must Not Live Here
- UI components
- Frontend Zustand stores
- Other domain internals
- Shared auth implementation details
- Database/provider code before a dedicated integration task

## Public Export Expectations
Only `index.ts` is public. Other backend domains may import from this domain root only, not from nested folders.

## Agent And Programmer Rules
- Keep one future function per file.
- Keep validation close to the action/subdomain it validates.
- Keep handlers thin and HTTP-focused.
- Put orchestration in services.
- Put access decisions in access/policies/permissions.
- Put audit event contracts in audit/events.

## Future Implementation Notes
When profile endpoints are implemented, start in routing, delegate to handlers, validate input through validators/validation, check access through access/policies, then call services.

# Auth / Guards

## Purpose
Reserved boundary for guards in the WorkOS, session, access, and authorization architecture.

## What Belongs Here
- Provider-neutral contracts
- Future WorkOS integration boundaries
- Future OIDC mapping documentation
- Session, role, policy, permission, or access-check placeholders

## What Must Not Live Here
- Raw WorkOS initialization outside provider seams
- Raw WorkOS client IDs, secrets, issuers, or tenant values
- Database adapters or Convex calls
- HTTP route handlers with auth logic inline

## Public Export Expectations
Future exports should be public auth contracts only. Route handlers should consume guards or services, never private auth internals.

## Agent And Programmer Rules
- Auth decisions live in guards, policies, and access-control services.
- Organization and team checks must be explicit.
- Audit-sensitive changes must define audit events before implementation.
- Never leak provider-specific details into domain services.

## Future Implementation Notes
When WorkOS integration expands, wire provider/session config here first, then expose typed guards for Hono middleware and domain policies.

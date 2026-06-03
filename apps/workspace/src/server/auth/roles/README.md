# Auth / Roles

## Purpose
Reserved boundary for roles in the Better Auth, Auth0, session, access, and authorization architecture.

## What Belongs Here
- Provider-neutral contracts
- Future Better Auth integration boundaries
- Future Auth0/OIDC mapping documentation
- Session, role, policy, permission, or access-check placeholders

## What Must Not Live Here
- Real Better Auth initialization code in this pass
- Auth0 client IDs, secrets, issuers, or tenant values
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
When Better Auth is introduced, wire provider/session config here first, then expose typed guards for Hono middleware and domain policies.

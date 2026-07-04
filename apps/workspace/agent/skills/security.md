# Security Guidelines

## Auth Isolation
- `organizationId` is read from `ctx.session.auth.current.attributes.organizationId` — never from user input
- Tools pass `organizationId` to every Convex query/mutation as a scoping parameter
- Convex functions independently verify organization membership

## Never Trust User Input for Identity
- The `requireOrgId()` helper extracts org ID from the authenticated session, not from tool arguments
- User-provided IDs (e.g., `clientId`, `projectId`) are only used as resource identifiers, never as auth scoping parameters

## Audit Trail
- All mutation operations record audit events via `recordOrganizationAction()`
- Audit events include: action type, target ID, summary, and organization ID
- Sensitive operations (member changes, role changes) always generate audit entries

## Data Validation
- All tool inputs are validated with Zod schemas before execution
- Database fields (`_id`, `_creationTime`, `organizationId`, etc.) are stripped from update payloads
- String inputs are trimmed; lengths are enforced via Zod

## Environment
- `CLERK_SECRET_KEY` and `CONVEX_DEPLOYMENT` environment variables must be set server-side
- The `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be set for client-side Clerk operations

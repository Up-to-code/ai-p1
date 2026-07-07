# Tests

## Existing tests that may need updates
- `src/domains/auth/hooks/use-headless-clerk-auth.test.ts` — Rewrite for Better Auth
- `src/domains/auth/hooks/use-account-context.test.ts` — Depends on Clerk hooks
- `src/domains/auth/auth-handoff.test.ts` — May no longer be needed
- `src/domains/auth/auth-route-source.test.ts` — Route protection tests
- `src/domains/auth/auth-callback-url.test.ts` — Callback URL logic
- `src/domains/auth/organization-selection.test.ts` — Org selection logic
- `src/domains/auth/workspace-status.test.ts` — Workspace status derivation
- `src/server/auth/clerk-convex.test.ts` — Deleted (Clerk-specific)
- `src/server/domains/organization/services/access-policy.test.ts` — Access policy
- `src/server/domains/organization/services/actions.test.ts` — Org actions

## Manual verification steps
1. Sign up with email/password → verify email flow
2. Sign in with email/password → session persists
3. Social sign-in (Google, Apple) → redirect-back flow
4. Create organization → org appears in org switcher
5. Invite member → email sent → accept invitation
6. Accept invite link → member added
7. Protected routes redirect to sign-in
8. MCP client connects with token → tools work
9. Eve agent chat → authenticated requests
10. Convex queries/mutations with auth identity work

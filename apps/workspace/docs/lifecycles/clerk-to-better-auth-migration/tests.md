# Tests

## Automated coverage
- `src/server/auth/auth-request.test.ts` — Hono token forwarding, Next.js fallback, request isolation, normalized failures
- `convex/auth-jwks-config.test.ts` — JWT algorithm alignment and internal key
  rotation configuration
- `src/domains/auth/hooks/use-account-context.test.ts` — Depends on Clerk hooks
- `src/domains/auth/auth-handoff.test.ts` — May no longer be needed
- `src/domains/auth/auth-route-source.test.ts` — Route protection tests
- `src/domains/auth/auth-callback-url.test.ts` — Callback URL logic
- `src/domains/auth/workspace-auth-entry.test.ts` — Same-origin workspace root
  routing for signed-in and signed-out users
- `src/domains/auth/organization-selection.test.ts` — Org selection logic
- `src/domains/auth/workspace-status.test.ts` — Workspace status derivation
- `src/server/domains/organization/services/access-policy.test.ts` — Access policy
- `src/server/domains/organization/services/actions.test.ts` — Org actions
- `src/server/config/platform-admin.test.ts` — normalized Platform Administration allowlist behavior
- `src/server/utils/organization/access-checker-source.test.ts` — fail-closed Convex Adapter and source-import guard
- `packages/auth/src/platform-admin.test.ts` — pure shared policy behavior

## Environment verification steps
1. Sign up with email/password → verify email flow
2. Sign in with email/password → session persists
3. Social sign-in (Google, Apple) → redirect-back flow
4. Create organization → org appears in org switcher
5. Invite member → email sent → accept invitation
6. Accept invite link → member added
7. Protected routes redirect to sign-in
8. Workspace root redirects signed-out users to the same-origin localized
   sign-in route, never to marketing
9. MCP client connects with token → tools work
10. Eve agent chat → authenticated requests
11. Convex queries/mutations with auth identity work
12. After an EdDSA-to-RS256 migration, run `npx convex run auth:rotateKeys`
    once and verify `/api/auth/get-session` returns 200

## Convex package-source verification

Run `npm --workspace @qentrah/workspace run codegen:convex` after changing a
shared policy imported by Convex. TypeScript alone does not prove that the
Convex bundler can resolve the runtime dependency.

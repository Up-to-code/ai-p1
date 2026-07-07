# Flow (Before → After)

## Current flow (Clerk):
1. `clerkMiddleware` in `proxy.ts` verifies session → sets auth
2. Page routes use `auth.protect()` for protected routes
3. Hono routes use `runWithAuthHeaders` to inject request into `AsyncLocalStorage`
4. Hono handlers call `getClerkSession` which reads `AsyncLocalStorage` → calls `getAuth()`
5. Convex queries/mutations use `fetchAuthQuery`/`fetchAuthMutation` with Clerk Convex token
6. Convex `auth.ts` extracts identity from Clerk JWT claims (`org_id`, `org_role`)
7. Client uses `@clerk/nextjs` hooks (`useAuth`, `useUser`, `useOrganization`)
8. MCP uses `@clerk/mcp-tools` for token verification
9. Eve agent uses `@clerk/backend` to authenticate requests

## New flow (Better Auth):
1. `src/middleware.ts` checks Better Auth session cookie directly
2. Page routes check cookie for protected routes
3. Hono routes use `auth.api.getSession({ headers })` — no AsyncLocalStorage needed
4. Hono handlers call `org-service.ts` which uses `auth.api.*` directly
5. Convex uses `@convex-dev/better-auth` component — session cookie read automatically
6. Convex `auth.ts` uses `betterAuth.getAuthUser(ctx)` instead of Clerk JWT claims
7. Client uses `better-auth/react` hooks (`authClient.useSession()`, etc.)
8. MCP uses `auth.api.getSession()` to verify bearer tokens
9. Eve agent calls `/api/auth/get-session` to validate session

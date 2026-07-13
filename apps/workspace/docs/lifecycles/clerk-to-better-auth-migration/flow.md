# Flow (Before → After)

## Former flow (Clerk)
1. `clerkMiddleware` in `proxy.ts` verifies session → sets auth
2. Page routes use `auth.protect()` for protected routes
3. Hono routes use `runWithAuthHeaders` to inject request into `AsyncLocalStorage`
4. Hono handlers call `getClerkSession` which reads `AsyncLocalStorage` → calls `getAuth()`
5. Convex queries/mutations use `fetchAuthQuery`/`fetchAuthMutation` with Clerk Convex token
6. Convex `auth.ts` extracts identity from Clerk JWT claims (`org_id`, `org_role`)
7. Client uses `@clerk/nextjs` hooks (`useAuth`, `useUser`, `useOrganization`)
8. MCP uses `@clerk/mcp-tools` for token verification
9. Eve agent uses `@clerk/backend` to authenticate requests

## Current flow (Better Auth)
1. `src/proxy.ts` classifies routes and detects the Better Auth session cookie.
2. Server pages resolve authentication through `auth-request.ts`.
3. Hono middleware scopes the incoming headers with `runWithAuthHeaders`; the scope is isolated by `AsyncLocalStorage`.
4. Hono services use the same `auth-request.ts` Interface for Better Auth HTTP operations and authenticated Convex calls.
5. The Interface exchanges the scoped session for a Convex token; code outside Hono delegates to the private Next.js adapter.
6. Convex `auth.ts` uses `betterAuth.getAuthUser(ctx)` instead of Clerk JWT claims
7. The browser client uses Better Auth's same-origin `/api/auth` default; it is
   not pinned to a public deployment URL, so local and preview authentication
   remain on their current origin.
8. The localized workspace root resolves authentication through
   the edge-safe route policy before React renders: signed-in users enter
   `/{locale}/ws`, while signed-out users enter `/{locale}/sign-in` with a
   local workspace callback. The destination page still validates the session
   server-side; marketing is never used as an authentication fallback.
9. MCP resolves Better Auth-backed OAuth grants before scoped execution.
10. Eve authenticates through `better-auth-channel.ts` and constructs a canonical Workspace Actor.

## JWT key compatibility

1. The OAuth-provider JWT plugin and Convex auth provider both use RS256.
2. During migration, the Convex plugin retries token generation after deleting
   an incompatible legacy JWKS record.
3. If a legacy key prevents the session hook from reaching that retry path, an
   operator runs the internal `auth:rotateKeys` action once. Browser and API
   clients cannot invoke key rotation.

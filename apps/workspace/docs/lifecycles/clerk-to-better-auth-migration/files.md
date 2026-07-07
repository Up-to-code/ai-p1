# Files Involved

## Files created
- `src/lib/auth.ts` — Better Auth server instance
- `src/app/api/auth/[...all]/route.ts` — Better Auth HTTP handler
- `src/app/api/mcp-token/route.ts` — MCP token generation
- `src/server/auth/auth-context.ts` — Server session helpers
- `src/server/domains/organization/services/org-service.ts` — Org CRUD via Better Auth API
- `src/domains/auth/hooks/use-auth-flow.ts` — Auth flow hook
- `agent/auth/better-auth.ts` — Eve auth handler

## Files rewritten
- `src/lib/auth-client.ts` — Better Auth client instead of Clerk wrapper
- `src/domains/auth/auth-identity.ts` — `authClient.useSession()` instead of `useAuth()`/`useUser()`
- `src/domains/auth/organization-context.ts` — Better Auth hooks instead of Clerk
- `src/components/providers/backend-providers.tsx` — `ConvexProviderWithBetterAuth` instead of `ConvexProviderWithClerk`
- `src/proxy.ts` — Better Auth session cookie instead of Clerk middleware
- `src/server/security/request-safety.ts` — No more `runWithAuthHeaders` (AsyncLocalStorage)
- `src/app/mcp/[transport]/route.ts` — Better Auth `verifyToken` instead of Clerk
- `convex/auth.ts` — `@convex-dev/better-auth` binding instead of Clerk JWT identity
- `convex/auth.config.ts` — Deleted (no JWT provider config needed)
- `agent/channels/eve.ts` — Import `betterAuthEve` instead of `clerkAuth`

## Files deleted
- `src/server/auth/clerk-convex.ts` — AsyncLocalStorage Clerk hack
- `src/server/domains/organization/services/clerk-organization-proxy.ts` — Clerk SDK proxy
- `src/server/domains/organization/services/actions.ts` — Clerk org actions
- `src/server/domains/organization/services/invite-links.ts` — Clerk invite-link service
- `agent/auth/clerk-auth.ts` — Clerk Eve auth handler
- `agent/lib/clerk-org.ts` — Clerk org helper
- `scripts/eve-esm-loader.mjs` — Clerk ESM compatibility hack
- `scripts/eve-esm-init.mjs` — Loader init
- `src/domains/auth/hooks/use-headless-clerk-auth.ts` — Clerk sign-in/up hooks

## Convex schema
- `convex/schema.ts` — Add `authTables` from `@convex-dev/better-auth`
- `convex/betterAuth.ts` — Already exists (Better Auth Convex component binding)

# Files Involved

## Active implementation
- `convex/auth.ts` — Better Auth server configuration, shared RS256 JWT
  algorithm, automatic mismatch recovery, and operator-only key rotation
- `convex/betterAuth.ts` — Convex component binding
- `convex/platform/access.ts` — fail-closed Platform Administration Adapter; imports the pure policy source directly so Convex development does not depend on a stale package build
- `packages/auth/src/platform-admin.ts` — pure shared Platform Administration allowlist policy used by Next.js and Convex Adapters
- `src/app/api/auth/[...all]/route.ts` — Better Auth HTTP handler
- `src/server/auth/auth-request.ts` — request-aware session, token forwarding, and normalized errors
- `src/server/auth/nextjs-auth-adapter.ts` — private Next.js adapter
- `src/server/domains/organization/services/better-auth-organization-service.ts` — organization operations
- `src/domains/auth/hooks/use-auth-flow.ts` — Auth flow hook
- `agent/lib/better-auth-channel.ts` — Eve auth handler
- `convex/auth-jwks-config.test.ts` — guards JWT algorithm alignment and the
  internal rotation seam

## Files rewritten
- `src/lib/auth-client.ts` — Better Auth client instead of Clerk wrapper
- `src/domains/auth/auth-identity.ts` — `authClient.useSession()` instead of `useAuth()`/`useUser()`
- `src/domains/auth/organization-context.ts` — Better Auth hooks instead of Clerk
- `src/components/providers/backend-providers.tsx` — `ConvexProviderWithBetterAuth` instead of `ConvexProviderWithClerk`
- `src/proxy.ts` — Better Auth session cookie instead of Clerk middleware
- `src/server/security/request-safety.ts` — scopes incoming headers to the asynchronous Hono request
- `convex/auth.ts` — `@convex-dev/better-auth` binding instead of Clerk JWT identity
- `agent/channels/eve.ts` — uses the Better Auth channel

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
- `src/server/auth/auth-context.ts` — superseded server wrapper
- `src/server/auth/convex-auth.ts` — superseded re-export wrapper
- `src/server/auth/auth-request-store.ts` — superseded request-store wrapper

Historical filenames above are migration evidence, not active dependencies.

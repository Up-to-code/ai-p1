# Clerk → Better Auth Migration

**Purpose:** Replace all Clerk authentication infrastructure with Better Auth (`better-auth` + `@convex-dev/better-auth`) across the workspace app.

**Owner app:** `apps/workspace`

**Current status:** Runtime migration complete; production credential flows still require environment-level smoke testing.

**Entrypoints:**
- `src/proxy.ts` — Next.js middleware (Clerk → Better Auth session cookie)
- `src/lib/auth-client.ts` — Client-side auth interface (Clerk → Better Auth client)
- `src/server/auth/auth-request.ts` — sole request-aware server identity, token-forwarding, and Better Auth HTTP Interface
- `src/server/auth/nextjs-auth-adapter.ts` — private framework Adapter used by the server Interface
- `src/server/domains/organization/services/better-auth-organization-service.ts` — organization membership and role operations
- `convex/auth.ts` — Convex identity extraction (rewritten)
- `agent/lib/better-auth-channel.ts` — Eve request authentication
- `convex/mcp/oauthGrants.ts` — MCP grant authentication and revocation

**Actor/System flow:** Next.js middleware → Better Auth server (session cookie) → Convex (`@convex-dev/better-auth` component) for auth identity in queries/mutations. Includes org management, invitations, email/password, social OAuth.

Clerk names and imports are forbidden in runtime source. Historical migration documentation may retain the provider name when describing the transition.

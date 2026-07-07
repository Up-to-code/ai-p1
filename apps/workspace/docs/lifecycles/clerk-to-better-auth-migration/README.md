# Clerk → Better Auth Migration

**Purpose:** Replace all Clerk authentication infrastructure with Better Auth (`better-auth` + `@convex-dev/better-auth`) across the workspace app.

**Owner app:** `apps/workspace`

**Current status:** In progress (Wave 0/8)

**Entrypoints:**
- `src/proxy.ts` — Next.js middleware (Clerk → Better Auth session cookie)
- `src/lib/auth-client.ts` — Client-side auth interface (Clerk → Better Auth client)
- `src/server/auth/clerk-convex.ts` — Server-side Convex token threading (deleted)
- `src/server/domains/organization/services/clerk-organization-proxy.ts` — Clerk SDK proxy (deleted)
- `convex/auth.ts` — Convex identity extraction (rewritten)
- `agent/auth/clerk-auth.ts` — Eve agent auth handler (rewritten)
- `src/app/mcp/[transport]/route.ts` — MCP auth verification (rewritten)

**Actor/System flow:** Next.js middleware → Better Auth server (session cookie) → Convex (`@convex-dev/better-auth` component) for auth identity in queries/mutations. Includes org management, invitations, email/password, social OAuth.

**Execution order:** Wave 0 → Wave 1 → Wave 2 → test sign-in works → Wave 3 → test full auth flow → Wave 4 → test org creation + invite → Wave 5 → test route protection → Wave 6 → test MCP authorized access → Wave 7 → test Eve agent chat → Wave 8 → cleanup + verify 0 Clerk imports

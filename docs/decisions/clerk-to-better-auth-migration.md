# Migration Plan: Clerk → Better Auth + Authorized MCP

**Status:** Approved for execution  
**Date:** 2026-07-07  
**Scope:** `apps/workspace` only — the workspace Next.js app + Convex backend  
**Why:** Clerk fights every custom-UI decision in this codebase. Invitation acceptance is broken (stub returns no real member), custom roles require a Clerk version upgrade, every request requires `AsyncLocalStorage` plumbing just to get a session token, and the ESM loader workaround exists entirely because of Clerk's `@clerk/nextjs` dist format. Better Auth + `@convex-dev/better-auth` gives full control, no hosted UI, same Convex data model, and a clean organization/member plugin.

---

## What gets deleted

The following is "dark garbage" — all of it goes:

| File / Directory | Why |
|---|---|
| `src/server/auth/clerk-convex.ts` | AsyncLocalStorage session threading hack for Clerk |
| `src/server/domains/organization/services/clerk-organization-proxy.ts` | Entire Clerk Backend SDK proxy (500 lines of workarounds) |
| `src/server/domains/organization/services/invite-links.ts` | Re-implemented using Better Auth org invitations |
| `src/server/domains/organization/services/actions.ts` | Re-implemented using Better Auth org actions |
| `agent/auth/clerk-auth.ts` | Clerk Eve auth handler |
| `agent/lib/clerk-org.ts` | Clerk org helper used by agent tools |
| `scripts/eve-esm-loader.mjs` | Existed only to fix Clerk ESM incompatibility |
| `scripts/eve-esm-init.mjs` | Loader init — same reason |
| `convex/auth.config.ts` | Clerk JWT provider config |
| `convex/auth.ts` | Clerk identity shim for Convex |
| `src/lib/auth-client.ts` | Full Clerk shim — replaced with Better Auth client |
| `src/domains/auth/hooks/use-headless-clerk-auth.ts` | Clerk sign-in/up hooks — replaced with Better Auth |
| `src/domains/auth/components/` (Clerk components) | Any component using `useClerk`, `useSignIn`, `useSignUp` |
| `src/components/providers/backend-providers.tsx` | `ConvexProviderWithClerk` — replaced with Better Auth equivalent |
| Env vars: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_FRONTEND_API_URL` | Remove after migration |

**npm packages to remove:**
- `@clerk/nextjs`
- `@clerk/backend` (indirect via clerk-org-proxy)
- `@clerk/mcp-tools`
- `@clerk/shared` (root override also removed)

---

## Architecture after migration

```
Better Auth Server  ←→  Convex (@convex-dev/better-auth adapter)
     ↕                        ↕
Next.js API route           authTables in Convex schema
  /api/auth/[...all]        (users, sessions, accounts, organizations, members, invitations)
     ↕
Better Auth Client (createAuthClient)
  - useSession()
  - signIn.email / signIn.social (Google, Apple)
  - signUp.email
  - organization.create / setActive / invite / acceptInvitation
```

The `authClient` shape in `src/lib/auth-client.ts` is already compatible with Better Auth's API — only the implementation changes, not the interface consumed by the rest of the app.

---

## Wave 0 — Package and Schema Setup

**Estimated effort:** 2 hours  
**Goal:** Better Auth is installed, Convex has auth tables, nothing is broken yet

### Step 0.1 — Install packages

```bash
# In apps/workspace
npm install better-auth@^1.6.9  # already installed
npm install @convex-dev/better-auth@^0.12.2  # already installed
npm install @better-fetch/fetch

# Remove Clerk packages
npm uninstall @clerk/nextjs @clerk/mcp-tools
# @clerk/backend is a transitive dep — it will go away when clerk-org-proxy is removed
```

### Step 0.2 — Create `convex/betterAuth.ts`

```ts
import { BetterAuth } from "@convex-dev/better-auth";
import { components } from "./_generated/api";

export const betterAuth = new BetterAuth(components.betterAuth, {
  // plugins registered here must match the server auth.ts plugins
});
```

### Step 0.3 — Add auth tables to `convex/schema.ts`

```ts
import { authTables } from "@convex-dev/better-auth";

export default defineSchema({
  ...authTables,          // ← adds users, sessions, accounts, verifications + org tables
  ...organizationTables,  // keep existing org profile / invite-link tables
  ...billingTables,
  // ... rest unchanged
});
```

### Step 0.4 — Run Convex codegen

```bash
npx convex codegen
```

---

## Wave 1 — Better Auth Server

**Estimated effort:** 3 hours  
**Goal:** A working `/api/auth/[...all]` route that handles sign-in, sign-up, social OAuth, organization management, and invitations

### Step 1.1 — Create `src/lib/auth.ts` (server)

```ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "@convex-dev/better-auth";
import { organization } from "better-auth/plugins";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export const auth = betterAuth({
  database: convexAdapter(fetchQuery, fetchMutation, api),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      // Call your email service here (Resend/Postmark/etc.)
      await sendEmail({ to: user.email, subject: "Reset your password", resetUrl: url });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    organization({
      // Invitations sent via email
      sendInvitationEmail: async ({ invitation, invitedByUser, organization }) => {
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/en/accept-invite?token=${invitation.id}`;
        await sendEmail({
          to: invitation.email,
          subject: `${invitedByUser.name} invited you to join ${organization.name}`,
          inviteUrl,
        });
      },
    }),
  ],

  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
  secret: process.env.BETTER_AUTH_SECRET!,
});

export type Auth = typeof auth;
```

### Step 1.2 — Create `src/app/api/auth/[...all]/route.ts`

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Step 1.3 — Environment variables (add to `.env.local`)

```
BETTER_AUTH_SECRET=<generate with: openssl rand -hex 32>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Wave 2 — Convex Auth Integration

**Estimated effort:** 2 hours  
**Goal:** Convex authenticates via Better Auth sessions instead of Clerk JWTs

### Step 2.1 — Replace `convex/auth.ts`

Delete the Clerk shim. Replace with the `@convex-dev/better-auth` binding:

```ts
// convex/auth.ts
import { betterAuth } from "./betterAuth";

export const { auth, signIn, signOut, store } = betterAuth;
```

### Step 2.2 — Replace `convex/auth.config.ts`

Delete. Better Auth uses session cookies, not JWKS/JWT provider config.

### Step 2.3 — Replace `ConvexProviderWithClerk` in `backend-providers.tsx`

```tsx
// src/components/providers/backend-providers.tsx
import { ConvexProviderWithBetterAuth } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

export function BackendProviders({ children }) {
  return (
    <ConvexProviderWithBetterAuth client={convex} authClient={authClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConvexProviderWithBetterAuth>
  );
}
```

### Step 2.4 — Replace `clerk-convex.ts`

Delete `AsyncLocalStorage` threading. Create `src/server/auth/auth-context.ts`:

```ts
// src/server/auth/auth-context.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getServerSessionOrThrow() {
  const session = await getServerSession();
  if (!session?.user) throw new Error("Authentication required.");
  return session;
}

// For Convex mutations/queries from server:
export async function getConvexToken() {
  // @convex-dev/better-auth provides a server token via the session
  const session = await getServerSession();
  return session?.convexToken ?? null;
}
```

---

## Wave 3 — Auth Client + React Hooks

**Estimated effort:** 3 hours  
**Goal:** `src/lib/auth-client.ts` uses Better Auth client. All client-side auth hooks work.

### Step 3.1 — Replace `src/lib/auth-client.ts`

```ts
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  plugins: [organizationClient()],
});

export const {
  useSession,
  useActiveOrganization,
  useListOrganizations,
  signIn,
  signUp,
  signOut,
} = authClient;
```

The rest of the app already consumes `authClient.useSession()`, `authClient.useActiveOrganization()`, `authClient.organization.setActive()`, `authClient.organization.create()` — these are all native Better Auth API methods. The interface shape in `auth-session.ts` doesn't change.

### Step 3.2 — Rewrite `src/domains/auth/auth-identity.ts`

Remove `useAuth`, `useUser` from `@clerk/nextjs`. Use `authClient.useSession()`.

```ts
export function useAuthIdentity(): AuthIdentity {
  const { data: session, isPending } = authClient.useSession();
  const userProfile = useQuery(
    api.userProfiles.read.getCurrent,
    session ? {} : "skip"
  );
  // ... same shape, different data source
}
```

### Step 3.3 — Rewrite `src/domains/auth/organization-context.ts`

Remove `useAuth().orgId` and `useUser().organizationMemberships`. Use:
- `authClient.useActiveOrganization()` → active org
- `authClient.useListOrganizations()` → membership list

### Step 3.4 — Delete `use-headless-clerk-auth.ts`, create `use-auth-flow.ts`

Better Auth's client-side API is simpler:

```ts
// src/domains/auth/hooks/use-auth-flow.ts
export function useAuthFlow({ mode, callbackURL, locale }) {
  const submitCredentials = async ({ email, password, name }) => {
    if (mode === "sign-up") {
      await authClient.signUp.email({ email, password, name, callbackURL });
    } else {
      await authClient.signIn.email({ email, password, callbackURL });
    }
  };

  const signInWithSocial = async (provider: "google" | "apple") => {
    await authClient.signIn.social({ provider, callbackURL });
  };

  return { submitCredentials, signInWithSocial, ... };
}
```

No `useSignIn`/`useSignUp` from Clerk. No multi-step `phase` state machine needed for basic flows — Better Auth handles the redirect loop.

### Step 3.5 — Rewrite sign-in/sign-up page components

Replace `useHeadlessClerkAuth` with `useAuthFlow`. The UI (forms, buttons, layout) doesn't change. Only the hook changes.

---

## Wave 4 — Organization Management

**Estimated effort:** 4 hours  
**Goal:** Create/list/switch org, invite members, accept invitations — all via Better Auth organizations plugin

### Step 4.1 — Delete the entire Clerk proxy layer

Delete:
- `src/server/domains/organization/services/clerk-organization-proxy.ts`
- `src/server/domains/organization/services/actions.ts`
- `src/server/domains/organization/services/invite-links.ts`
- `src/server/auth/clerk-convex.ts`

### Step 4.2 — New `src/server/domains/organization/services/org-service.ts`

Better Auth's organization plugin exposes a full server-side API:

```ts
import { auth } from "@/lib/auth";
import { getServerSessionOrThrow } from "@/server/auth/auth-context";

export async function createOrganization(name: string, slug: string) {
  const session = await getServerSessionOrThrow();
  return auth.api.createOrganization({
    headers: await headers(),
    body: { name, slug, userId: session.user.id },
  });
}

export async function inviteMember(organizationId: string, email: string, role: string) {
  return auth.api.inviteMember({
    headers: await headers(),
    body: { organizationId, email, role },
  });
}

export async function acceptInvitation(invitationId: string) {
  return auth.api.acceptInvitation({
    headers: await headers(),
    body: { invitationId },
  });
}

export async function listMembers(organizationId: string) {
  return auth.api.getFullOrganization({
    headers: await headers(),
    query: { organizationId },
  });
}
```

### Step 4.3 — Simplify `choose-organization-client.tsx`

```ts
// Remove all Clerk-specific casting via (user as unknown as ...)
const { data: organizations } = authClient.useListOrganizations();

async function selectOrganization(orgId: string) {
  await authClient.organization.setActive({ organizationId: orgId });
  router.replace("/ws");
}

async function createOrganization(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const result = await authClient.organization.create({ name, slug });
  await authClient.organization.setActive({ organizationId: result.data.id });
  router.replace("/onboarding");
}
```

### Step 4.4 — Simplify `accept-invite-screen.tsx`

```ts
// No stabilization delay needed, no clerk.setActive race condition
async function acceptInvitation() {
  const result = await authClient.organization.acceptInvitation({ invitationId });
  await authClient.organization.setActive({ organizationId: result.data.organizationId });
  router.replace(`/${locale}/ws`);
}
```

The `inviteToken` (custom link flow) path can stay as-is in Convex — you can keep custom invite links as a layer on top of Better Auth's invitation IDs, or unify them.

### Step 4.5 — Keep Convex `organizationInviteLinks` table

Your custom invite-link system (SHA-256 token → Convex record) can coexist with Better Auth's invitations. Custom links generate a token → server looks it up → calls `auth.api.inviteMember` or directly creates membership. This gives you share-link-style invites without email required.

### Step 4.6 — Rewrite Hono organization routes

The `organizationSubRouter` routes stay the same paths. The handlers call `org-service.ts` instead of `actions.ts`/`clerk-organization-proxy.ts`. No `AsyncLocalStorage` needed — `headers()` from `next/headers` works directly.

---

## Wave 5 — Middleware Replacement

**Estimated effort:** 1 hour  
**Goal:** Next.js middleware uses Better Auth session cookies instead of Clerk JWT verification

### Step 5.1 — Replace `src/proxy.ts`

```ts
// src/proxy.ts (or middleware.ts at Next.js root)
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import * as Sentry from "@sentry/nextjs";

const intlMiddleware = createMiddleware(routing);

const publicPaths = ["/sign-in", "/sign-up", "/sso-callback", "/accept-invite", "/api/auth"];
const bypassPaths = ["/eve/", "/_eve_internal/", "/mcp/", "/.well-known/", "/api/"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass paths — no auth, no i18n
  if (bypassPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Localized Eve rewrite
  const eveMatch = pathname.match(/^\/(ar|en)(\/(?:eve|_eve_internal)\/.*)$/);
  if (eveMatch) {
    const url = request.nextUrl.clone();
    url.pathname = eveMatch[2];
    return NextResponse.rewrite(url);
  }

  // Auth routes — pass through to next-intl
  if (publicPaths.some((p) => pathname.includes(p))) {
    return intlMiddleware(request);
  }

  // Protected routes — check Better Auth session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token")?.value;
  if (!sessionCookie && isProtectedPath(pathname)) {
    const locale = pathname.startsWith("/ar") ? "ar" : "en";
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)"],
};
```

Note: Sentry metrics can stay. `clerkMiddleware` and `auth.protect()` are removed.

---

## Wave 6 — MCP: Authorized Mode

**Estimated effort:** 2 hours  
**Goal:** MCP server validates Better Auth sessions instead of Clerk OAuth tokens

The current `src/app/mcp/[transport]/route.ts` already uses `withMcpAuth` (authorized mode) via `@clerk/mcp-tools`. The MCP protocol doesn't care who validates the token — you just swap the `verifyToken` function.

### Step 6.1 — Replace `verifyToken` in `src/app/mcp/[transport]/route.ts`

```ts
import { auth } from "@/lib/auth";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { fetchAction } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { mcpToolCatalog } from "@/server/protocols/mcp/tools/catalog";

async function verifyToken(req: Request, bearerToken?: string) {
  if (!bearerToken) return undefined;

  // Better Auth: validate the bearer token as a session token
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${bearerToken}`,
      Cookie: req.headers.get("cookie") ?? "",
    }),
  });

  if (!session?.user) return undefined;

  // Fetch Convex token for this session
  const convexToken = await auth.api.getConvexToken({
    headers: new Headers({ Authorization: `Bearer ${bearerToken}` }),
  });

  return {
    token: bearerToken,
    clientId: session.user.id,
    extra: { convexToken, userId: session.user.id },
  };
}

// Rest of the file stays exactly the same — withMcpAuth, createMcpHandler, tool registration
```

Remove `@clerk/mcp-tools` import. Keep `withMcpAuth`, `createMcpHandler`, and all tool registrations unchanged.

### Step 6.2 — MCP token generation

MCP clients need a token to call your server. Better Auth can issue API keys or you can use session tokens. The cleanest approach for MCP:

```ts
// New API route: src/app/api/mcp-token/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  
  // Create an API key scoped for MCP use
  const apiKey = await auth.api.createApiKey({
    headers: await headers(),
    body: { name: "MCP Access", expiresIn: 60 * 60 * 24 * 30 }, // 30 days
  });
  
  return Response.json({ token: apiKey.key });
}
```

The MCP settings UI (wherever you display the connection string) calls this endpoint to generate a token the user copies into their MCP client config.

---

## Wave 7 — Eve Agent Auth

**Estimated effort:** 1 hour  
**Goal:** Eve's auth handler validates Better Auth sessions, passes the Convex token

### Step 7.1 — Replace `agent/auth/clerk-auth.ts`

```ts
// agent/auth/better-auth.ts
import type { AuthFn } from "eve/channels/auth";
import type { SessionAuthContext } from "eve/context";

export const betterAuthEve: AuthFn = async (event) => {
  try {
    const cookieHeader = event.headers.get("cookie") ?? "";
    const authHeader = event.headers.get("authorization") ?? "";

    // Call the Better Auth session endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/get-session`, {
      headers: { cookie: cookieHeader, authorization: authHeader },
    });

    if (!res.ok) return null;
    const session = await res.json();
    if (!session?.user?.id) return null;

    const userId = session.user.id;
    const organizationId = session.session?.activeOrganizationId ?? "";

    // X-Organization-Id header validation
    const headerOrgId = event.headers.get("x-organization-id");
    if (headerOrgId && organizationId && headerOrgId !== organizationId) return null;

    // Fetch Convex token
    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/convex-token`, {
      headers: { cookie: cookieHeader, authorization: authHeader },
    });
    const convexToken = tokenRes.ok ? (await tokenRes.json()).token : "";

    return {
      principalId: userId,
      principalType: "user",
      authenticator: "better-auth",
      attributes: {
        userId,
        organizationId,
        role: session.session?.orgRole ?? "member",
        convexToken,
      },
    } satisfies SessionAuthContext;
  } catch {
    return null;
  }
};
```

Update `agent/channels/eve.ts` to import `betterAuthEve` from `../auth/better-auth`.

### Step 7.2 — Remove ESM loader

Delete `scripts/eve-esm-loader.mjs` and `scripts/eve-esm-init.mjs`. Remove `NODE_OPTIONS="--import..."` from all npm scripts in `package.json`. The loader only existed because `@clerk/nextjs` dist breaks in Node 24 ESM — Better Auth has no such problem.

---

## Wave 8 — Cleanup

**Estimated effort:** 2 hours

### Step 8.1 — Remove Clerk packages

```bash
npm uninstall @clerk/nextjs @clerk/mcp-tools
# Also remove from root package.json overrides: @clerk/shared
```

### Step 8.2 — Remove env vars from `.env.local`

```
# Delete:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_FRONTEND_API_URL
```

### Step 8.3 — Clean up remaining Clerk imports

Run a codebase-wide search for any remaining `@clerk/nextjs`, `@clerk/backend`, `useClerk`, `useSignIn`, `useSignUp`, `useOrganization`, `useOrganizationList`, `ConvexProviderWithClerk`. Each should be zero after migration.

### Step 8.4 — Update AGENTS.md

Record the completed migration. Remove all Clerk-related entries from "Relevant Files".

---

## Files created (summary)

| New file | Purpose |
|---|---|
| `src/lib/auth.ts` | Better Auth server instance (email, Google, Apple, org plugin) |
| `src/app/api/auth/[...all]/route.ts` | Better Auth HTTP handler |
| `src/app/api/mcp-token/route.ts` | MCP token generation endpoint |
| `src/server/auth/auth-context.ts` | Server session helpers (replaces `clerk-convex.ts`) |
| `src/server/domains/organization/services/org-service.ts` | Org CRUD via Better Auth API (replaces proxy + actions) |
| `src/domains/auth/hooks/use-auth-flow.ts` | Auth flow hook (replaces `use-headless-clerk-auth.ts`) |
| `agent/auth/better-auth.ts` | Eve auth handler (replaces `clerk-auth.ts`) |
| `convex/betterAuth.ts` | Better Auth Convex component binding |

---

## Files deleted (summary)

| Deleted file | Reason |
|---|---|
| `src/server/auth/clerk-convex.ts` | AsyncLocalStorage Clerk hack |
| `src/server/domains/organization/services/clerk-organization-proxy.ts` | 500-line Clerk SDK proxy |
| `src/server/domains/organization/services/actions.ts` | Clerk org actions |
| `src/server/domains/organization/services/invite-links.ts` | Clerk invite-link service |
| `agent/auth/clerk-auth.ts` | Clerk Eve auth handler |
| `agent/lib/clerk-org.ts` | Clerk org helper |
| `scripts/eve-esm-loader.mjs` | Clerk ESM compatibility hack |
| `scripts/eve-esm-init.mjs` | Loader init |
| `convex/auth.config.ts` | Clerk JWT provider config |
| `convex/auth.ts` | Clerk identity shim |
| `src/lib/auth-client.ts` | Clerk client shim (rewritten, not deleted) |
| `src/domains/auth/hooks/use-headless-clerk-auth.ts` | Clerk sign-in/up hooks |

---

## Risk / dependencies

| Risk | Mitigation |
|---|---|
| Google / Apple OAuth credentials needed | Already have Apple account per conversation; get Google credentials from Google Cloud Console |
| Better Auth `@convex-dev/better-auth` v0.12.2 + Better Auth v1.6.9 already installed | Confirmed in `package.json` — no new installs needed beyond removing Clerk |
| Convex schema migration — adding `authTables` | `authTables` adds new tables; existing organization/user tables are untouched; run `convex codegen` after |
| Email sending not wired | Wire Resend (or existing email provider) for password reset + invitation emails in Wave 1 |
| `organizationInviteLinks` Convex table | Keep as-is; custom invite links can call `auth.api.inviteMember` server-side after token validation |
| Eve ESM loader removal | Safe once `@clerk/nextjs` is gone — Node 24 ESM issue was Clerk-specific |

---

## Execution order

```
Wave 0 → Wave 1 → Wave 2 → test sign-in works
         → Wave 3 → test full auth flow
         → Wave 4 → test org creation + invite
         → Wave 5 → test route protection
         → Wave 6 → test MCP authorized access
         → Wave 7 → test Eve agent chat
         → Wave 8 → cleanup + verify 0 Clerk imports
```

Each wave is independently testable. You don't need to delete Clerk until Wave 8 — the two systems can coexist during the migration (different routes, different providers).

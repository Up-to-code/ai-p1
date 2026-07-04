# Changes

## 2026-07-04 — Auth fix pass (all bits completed)

### Bit 1: Fix Google OAuth redirect URLs
**Files:** `use-headless-clerk-auth.ts`, `use-headless-clerk-auth.test.ts`
- Added proper destructuring of `useSignIn()` and `useSignUp()` (Clerk v5 returns `{ signIn, errors, fetchStatus }`, not the resource directly)
- Changed `redirectUrl` from `window.location.href` to absolute `window.location.origin + /{locale}/sso-callback`
- Changed `redirectUrlComplete` from relative path to absolute URL using `window.location.origin`
- Created 5 tests covering: redirect URL correctness (sign-in/sign-up modes), callbackURL passthrough, isLoaded behavior, authenticateWithRedirect invocation

### Bit 2: Fix proxy.ts middleware
**Files:** `proxy.ts`
- Replaced manual `const { userId } = await auth()` + redirect pattern with Clerk v5 `auth.protect()` for auto-redirect
- Cleaned up Sentry metric collection in finally block

### Bit 3: Connect Convex permissions to real Clerk API
**Files:** `convex/auth.ts`, `convex/permissions/index.ts`, `convex/organizations/profile/access.ts`
- Added `orgId` and `orgRole` to `ClerkAuthUser` type and `identityToUser()` output (extracted from JWT claims)
- Removed stubbed `clerkOrganizationApi` (no longer needed — org info comes from JWT)
- Updated `getOrganizationRole()` to extract `orgId`/`orgRole` from Clerk identity JWT claims instead of always returning "admin"
- Validates the role matches one of `["owner", "admin", "member"]`
- Only returns a role when the token's `orgId` matches the requested `organizationId`
- Replaced `getCapabilities()` all-true stub with real role-based permission matrix

### Bit 4: Fix org context
**Files:** `organization-context.ts`, `workspace-context.ts`
- Removed `useOrganization()` dependency (had 8-second timeout hack)
- Primary org ID source is now `auth.orgId` from `useAuth()`, available immediately
- Org metadata (name, logo, slug) derived from Clerk user's `organizationMemberships` list
- Removed `useEffect`, `useState` imports no longer needed
- Simplified `isConvexAuthPending` from `!convexAuth.isLoading ? false : convexAuth.isLoading` to just `convexAuth.isLoading`

### Bit 5: Fix Eve agent auth channel (convexToken propagation)
**Files:** `agent/auth/clerk-auth.ts`
- `clerkAuth` previously set `convexToken: ""` (empty string)
- This caused all agent `fetchAuthQuery`/`fetchAuthMutation` calls to Convex to go unauthenticated (`getTokenFromContext` returns `null` for empty tokens)
- Added `session.getToken()` call to retrieve the raw Clerk JWT from the authenticated session
- Passed the real JWT as `convexToken`, so Convex can verify the user identity via `getUserIdentity(ctx)`
- Used `"getToken" in session` type guard to handle `SignedOutAuthObject` (no `getToken`)

### Pre-existing test fixes
**Files:** `workspace-status.test.ts`, `auth-route-source.test.ts`
- Fixed `workspace-status.test.ts` to expect marketing site redirect (matches current code)
- Fixed `auth-route-source.test.ts` to check `dashboard-authenticated-shell.tsx` instead of `dashboard-app-wrapper.tsx` for `getWorkspaceAuthRedirect`
- Fixed `auth-route-source.test.ts` to check for `GoogleMark` instead of removed `id="clerk-captcha"`

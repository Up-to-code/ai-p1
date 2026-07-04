# Current Flow

## Sign-In (Email/Password)

```
User → /sign-in → server-auth-routing checks auth → redirects if signed in
       → AuthEntryClient → AuthAccessScreen (form) → useHeadlessClerkAuth
       → signIn.create({ identifier, password })
       → Clerk sets session cookie → finalizeCallback → /ws
```

## Sign-In (Google OAuth)

```
User → /sign-in → AuthAccessScreen → Google button → useHeadlessClerkAuth
       → signIn.authenticateWithRedirect({
           strategy: "oauth_google",
           redirectUrl: window.location.href,  // BUG: should be absolute /sso-callback
           redirectUrlComplete: "/en/ws"        // BUG: should be absolute URL
         })
       → Clerk redirects to Google → Google → Clerk → ???? (broken redirect)
```

## Problems

1. **Google OAuth redirects are relative, not absolute** — Clerk v5 requires absolute URLs for `redirectUrl` and `redirectUrlComplete`
2. **SSO callback page just calls finalizeCallback** — doesn't handle Clerk's OAuth callback URL params
3. **proxy.ts uses manual auth() check** — should use `auth.protect()` (Clerk v5 pattern)
4. **Convex org API is stubbed** — `clerkOrganizationApi.hasPermission` always returns `{ success: true }`
5. **getOrganizationRole always returns "admin"** — no actual role lookup
6. **getCapabilities returns all-true** — permission system not connected
7. **8-second timeout for organization.isLoaded** — hack, should use `auth.orgId` directly
8. **No org sync in middleware** — `organizationSyncOptions` not configured

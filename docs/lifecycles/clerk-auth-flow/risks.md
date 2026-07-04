# Risks

## Auth Breakage
- Changing redirect URL patterns could break OAuth flow if Clerk Dashboard has whitelisted specific callback URLs
- The Clerk Dashboard's "redirect URLs" whitelist must include `http://localhost:3000/*` and the production origin

## Stubbed Permissions
- All Convex permission checks currently return `true` — any user can do anything
- If we connect real permissions, existing users might lose access they previously had
- Need backward-compatible migration: default to allowing all until roles are explicitly assigned

## Organization Readiness
- Changing from `useOrganization().isLoaded` to `auth.orgId` changes the loading behavior
- `auth.orgId` is available immediately but might not reflect latest org changes
- Need to handle the case where user has no org memberships

## Middleware Changes
- `auth.protect()` auto-redirects to sign-in, which is the same behavior as current manual check
- But `auth.protect()` also throws if the route has org-level protection and org doesn't match

## SSO Callback
- Clerk's OAuth callback adds URL params (`__clerk_status`, `__clerk_synced`, etc.)
- Current SSO callback page ignores these and just redirects
- Clerk SDK on the page should handle these automatically, but we need to verify

## Rollback
- Revert any file changes if tests fail
- Keep all stubbed code paths as fallbacks during transition

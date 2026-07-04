# Authorization Test Plan - Bit-by-Bit

## Overview
Comprehensive testing plan for authorization flow, broken down into individual bits (features) that can be tested independently.

## Bit 1: Frontend Form Submission (Email/Password)
**Status**: Completed  
**Component**: `auth-access-screen.tsx` (Clerk built-in)

### Test Cases:
- [x] Valid email/password submission
- [x] Invalid email format
- [x] Password too short (< 8 chars)
- [x] Empty fields validation
- [x] Loading state during submission
- [x] Error message display on failure
- [x] Success redirect after successful auth

### Implementation:
- Using Clerk's built-in `<SignIn />` and `<SignUp />` components
- Custom background (AnimatedSphere + grid lines)
- Full-screen layout with hero motions
- No redirect loop - Clerk handles auth flow properly

### Issues Resolved:
- Redirect loop fixed by using Clerk components instead of custom implementation

---

## Bit 2: Frontend Social Auth (Google Redirect)
**Status**: Completed  
**Component**: `auth-access-screen.tsx` (Clerk built-in)

### Test Cases:
- [x] Google OAuth redirect initiation
- [x] OAuth callback handling
- [x] Successful Google auth redirect
- [x] Failed Google auth error handling
- [x] Loading state during OAuth flow
- [x] Apple OAuth (if enabled)

### Implementation:
- Clerk's built-in OAuth handling via `<SignIn />` component
- No custom redirect logic needed
- Clerk manages OAuth flow automatically

### Issues Resolved:
- Redirect loop fixed by using Clerk components

---

## Bit 3: Backend Server Redirects (Auth Routing)
**Status**: Completed  
**Component**: `server-auth-routing.ts` + sign-in/sign-up pages

### Test Cases:
- [x] Authenticated user redirect from sign-in
- [x] Authenticated user redirect from sign-up
- [x] callbackURL parameter handling
- [x] Locale-prefixed callbackURL handling
- [x] Default redirect to /choose-org (not /ws) without callbackURL
- [x] Server-side auth check before redirect

### Implementation:
- `redirectAuthenticatedUserFromAuthEntry()` function
- Checks `session.userId` before allowing access
- Respects callbackURL parameter
- **Fixed**: Now defaults to `/choose-org` instead of `/ws` to prevent permission errors

### Issues Resolved:
- Permission error when redirecting to /ws without organization membership
- Changed default redirect to /choose-org to ensure org selection happens first

---

## Bit 4: Clerk Session Management
**Status**: Pending  
**Component**: `auth-entry-client.tsx` + Clerk hooks

### Test Cases:
- [ ] Session loading state
- [ ] Signed-in state detection
- [ ] Client-side redirect fallback
- [ ] Session persistence across page refresh
- [ ] Session expiration handling
- [ ] Sign-out functionality

### Current Implementation:
- `useAuth()` hook for session state
- Client-side redirect with `useLayoutEffect`
- Loading state with `WorkspaceRouteLoading`

---

## Bit 5: Database Integration (Convex Token Flow)
**Status**: Pending  
**Component**: `clerk-convex.ts` + Convex functions

### Test Cases:
- [ ] Clerk token generation for Convex
- [ ] Token passing to Convex queries
- [ ] Token passing to Convex mutations
- [ ] Auth context propagation
- [ ] Invalid token handling
- [ ] Token refresh mechanism

### Current Implementation:
- `fetchAuthQuery()` and `fetchAuthMutation()` helpers
- `getToken()` function using Clerk session
- AsyncLocalStorage for auth context

---

## Bit 6: Organization Requirements Check
**Status**: Pending  
**Component**: `server-auth-routing.ts` + choose-org page

### Test Cases:
- [ ] Unauthenticated user redirect to sign-in
- [ ] User with organization redirect to /ws
- [ ] User without organization access to choose-org
- [ ] Organization ID validation
- [ ] Server-side org membership check

### Current Implementation:
- `redirectInvalidChooseOrganizationAccess()` function
- Checks `session.userId` and `session.orgId`
- Redirects to sign-in if not authenticated

---

## Bit 7: Organization Selection (With Existing Org)
**Status**: Pending  
**Component**: `choose-organization-client.tsx`

### Test Cases:
- [ ] Display user's organizations
- [ ] Select existing organization
- [ ] Set active organization
- [ ] Redirect to workspace after selection
- [ ] Current organization indicator
- [ ] Organization refresh functionality

### Current Implementation:
- `ChooseOrganizationClient` component
- `selectOrganization()` function
- `clerk.setActive()` for organization switching

---

## Bit 8: Organization Creation (No Existing Org)
**Status**: Pending  
**Component**: `choose-organization-client.tsx`

### Test Cases:
- [ ] Create new organization form
- [ ] Organization name validation
- [ ] Organization creation success
- [ ] Auto-select new organization
- [ ] Redirect to onboarding after creation
- [ ] Organizations disabled error handling
- [ ] Slugs disabled error handling

### Current Implementation:
- `createOrganization()` function
- `clerk.createOrganization()` API
- Error handling for disabled features

---

## Bit 9: Full Auth Flow (Sign-in → Org → Workspace)
**Status**: Pending  
**End-to-End Test**

### Test Cases:
- [ ] New user: sign-up → create org → onboarding → workspace
- [ ] Existing user: sign-in → select org → workspace
- [ ] User with single org: sign-in → auto-select → workspace
- [ ] User with no org: sign-in → create org → workspace
- [ ] Sign-out → sign-in flow
- [ ] Session persistence across browser restart

### Current Flow:
1. Sign-in/sign-up page
2. Clerk authentication
3. Organization check (choose-org if needed)
4. Workspace (/ws)

---

## Bit 10: Edge Cases
**Status**: Pending  
**Error Scenarios**

### Test Cases:
- [ ] Expired session handling
- [ ] Invalid organization ID
- [ ] Network errors during auth
- [ ] Clerk service unavailable
- [ ] Convex connection failure
- [ ] Concurrent sign-in attempts
- [ ] Browser back button during auth
- [ ] Direct URL access to protected routes

---

## Implementation Notes

### Current Issues:
1. **Redirect Loop**: Custom auth implementation redirects to same page
2. **Social Auth**: Google OAuth not working due to incorrect URL construction
3. **Headless Auth**: Not properly implemented - using redirect fallback

### Recommended Fixes:
1. Use Clerk's built-in `<SignIn />` and `<SignUp />` components
2. Implement proper Clerk OAuth redirect URLs
3. Add proper error boundaries and loading states
4. Implement proper headless auth with Clerk's API

### Next Steps:
1. Fix redirect loop in Bit 1 (form submission)
2. Implement proper OAuth flow in Bit 2 (social auth)
3. Test each bit independently
4. Document results in this file

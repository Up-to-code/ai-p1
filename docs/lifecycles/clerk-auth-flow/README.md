# Clerk Auth Flow

**Purpose:** Complete authentication and authorization flow for Qentrah workspace users, including sign-in, sign-up, Google OAuth, organization selection, workspace readiness, and permission enforcement.

**Owner app:** `apps/workspace`
**Auth provider:** Clerk (v5 via `@clerk/nextjs`)
**Convex integration:** `convex/auth.ts` + `clerkAuthComponent`
**Status:** In progress — fixing stubbed permissions, OAuth redirect URLs, middleware patterns, and org readiness

## Entrypoints

| Entrypoint | Type | Description |
|---|---|---|
| `/sign-in` | Page | Custom sign-in form (email/password + Google OAuth) |
| `/sign-up` | Page | Custom sign-up form (email/password + Google OAuth) |
| `/sso-callback` | Page | OAuth callback handler for social sign-in |
| `/choose-org` | Page | Organization selection/creation after auth |
| `/ws` | Page | Main workspace — requires org + convex auth |
| `proxy.ts` | Middleware | Route protection via `clerkMiddleware` |

## Actor/System Flow

1. **User visits protected route** → `proxy.ts` clerkMiddleware checks session
2. **No session** → redirect to `/sign-in`
3. **User signs in** → `useHeadlessClerkAuth` creates sign-in via Clerk API
4. **Success** → Clerk sets session cookie, redirect to `/choose-org` or `/ws`
5. **Choose org** → `ChooseOrganizationClient` selects/creates org
6. **Org set** → `clerk.setActive({ organization })`, handoff written, redirect to `/ws`
7. **Workspace loads** → `AuthSessionProvider` → `OrganizationProvider` → `WorkspaceProvider`
8. **Ready** → `dashboard-authenticated-shell.tsx` renders sidebar + content
9. **Convex queries** → `clerkAuthComponent.getAuthUser()` validates identity
10. **Permission checks** → `convex/permissions/` checks org/space/project access

# Changes

## 2026-06-04 Clerk Workspace Auth

- Replaced the temporary dev-only Workspace identity with Clerk-owned session and organization identity.
- Wired Clerk's Next.js provider and middleware into the localized Workspace routes, with protected app routes redirecting to localized Clerk sign-in.
- Added Convex JWT validation through `convex/auth.config.ts` using `CLERK_FRONTEND_API_URL` and the `convex` application ID from Clerk's Convex integration guide.
- Replaced the plain Convex provider with Clerk-backed Convex auth so browser and server Convex calls use Clerk-issued Convex tokens.

## 2026-06-04 Dev-Only Auth Purge

- Removed Workspace customer session auth ownership from local dev code paths while the auth system is being rebuilt.
- Replaced browser, Hono, and Convex-facing Workspace identity reads with the temporary dev identity: `dev-user`, `dev-org`, role `owner`.
- Removed Convex Better Auth route/component ownership from Workspace local codegen and bypassed customer authorization checks for Workspace CRUD during this dev-only phase.
- This state is explicitly not production-ready and must not be deployed as the long-term auth model.

## 2026-06-02 WorkOS Organization Adapter Migration

- Replaced the Better Auth organization HTTP proxy with the WorkOS organization Adapter for members, invitations, custom roles, and role permission slugs.
- Kept the Hono and browser organization Interfaces stable while moving WorkOS SDK details behind one service Module.
- Preserved Qentrah owner-retention policy, Convex permission enforcement, and audit writes.

## 2026-05-16

- Created lifecycle docs for Workspace organization member management.
- Documented that member removal should rely on organization `member:delete` permission plus Qentrah removal policy, not the platform-admin email allowlist.
- Removed the platform-admin allowlist gate from `removeOrganizationMember`.
- Added a regression test proving member removal uses organization permission and does not call `requirePlatformAdmin`.

## 2026-05-28 Action Workflow Depth

- Added an organization action workflow Module for repeated permission assertion, organization list access, action execution, and audit recording.
- Kept Hono handlers and exported service functions stable while moving duplicated workflow mechanics out of individual action implementations.

## 2026-05-28 Access Policy Owner Retention Depth

- Deepened the organization access-policy Module with one owner-retention Interface shared by member removal and member role changes.
- Preserved existing self-removal, missing-member, assignable-role, built-in-role, and last-owner error behavior.

## 2026-06-03 Auth Organization Selection Redirects

- Hardened Workspace `choose-org` so organization APIs mount only after Better Auth session hydration confirms the user is signed in.
- Normalized app-shell auth callbacks at the dashboard boundary, sign-in/sign-up entry pages, Next Better Auth adapter, and Convex Better Auth plugin so `/dashboard` cannot become the post-OAuth destination before active organization selection.
- Centralized Mobile post-auth route decisions in the auth navigation Module so social sign-in and OAuth callback return through the Workspace gate instead of hard-coding home.
- Required Mobile app and auth layouts to resolve active Workspace identity before opening the app shell, so a signed-in user without an active organization lands on create/select workspace instead of home or app content.
- Fixed Mobile invite sign-in to target the actual auth entry route and preserve the invite callback path.
- Renamed the Mobile account-switch handler so React hook linting does not misclassify it as a hook.
- Deployed Workspace Convex production `stoic-monitor-13` and Vercel production `dpl_AQymbfMmf7qKmbemWv8zTrvAQTpZ` after the backend callback normalization.

## 2026-06-04 Hono-Owned Auth Runtime

- Moved Workspace Better Auth HTTP ownership to the Hono auth runtime Module while keeping organization selection and invite callbacks normalized before OAuth state creation.
- Replaced Convex-hosted Better Auth routes with a service-token protected Convex storage Adapter seam, so Convex remains the auth table store but no longer serves `/api/auth/*`.
- Repointed Convex JWT validation to the Workspace/Hono JWKS URL so business queries keep using `ctx.auth.getUserIdentity()` with Hono-issued tokens.
- Superseded locally by the dev-only auth purge above; do not treat this as the active local development auth shape.

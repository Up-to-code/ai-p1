# Partners App

Standalone developer environment for Partner Programmers creating Anan authorization apps.

The `apps/partners` workspace is the canonical Partners app. It owns its own
Convex deployment, partner auth session, app lifecycle data, review state, and
portal events. Anan workspace access goes through explicit integration
contracts instead of direct imports from Anan's generated Convex API.

Partners uses one independent Convex database configured only by Partners env vars:
`CONVEX_DEPLOYMENT`, `CONVEX_URL`, `CONVEX_SITE_URL`, `NEXT_PUBLIC_CONVEX_URL`,
and `NEXT_PUBLIC_CONVEX_SITE_URL`.

## Local Development

- Default local URL: `http://localhost:3002`
- `npm run dev:partners` from the monorepo root starts on `3002`, or the next open port when `3002` is busy.
- `/signup` creates a Partner Programmer account and a programmer organization for app review work.
- `/dashboard/account` manages the developer profile and programmer organization.
- `npm --workspace @anan/partners run convex:dev` runs the Partners Convex backend.

## Portal Architecture

- `server/` repositories are the boundary for server-side Convex calls.
- `hooks/` contains client hooks for account, organization, avatar, app form, and access checkpoint state.
- `stores/` contains Zustand UI stores for portal chrome, account snapshots, and app permission checkpoints.
- `types/`, `utilities/`, and `validation/` hold shared contracts, pure helpers, and Zod schemas.
- `security/`, `trust/`, and `rate-limits/` are only used where runtime wrappers need production checks, trusted auth headers, or sensitive-route throttling.

## Account And Avatar

- Partners owns developer identity, profile display name, and programmer organization records.
- The dashboard topbar reads real account and organization data from the Partners backend.
- Avatars are generated from initials and a stable auth-subject color. Uploads, remote images, and storage are intentionally out of scope for this pass.

## App Permissions

- App creation uses access checkpoints instead of a raw scope-only textarea.
- Common permissions are grouped in the UI, and advanced custom scopes remain available for future Anan platform capabilities.
- The server payload still persists `allowedScopes: string[]` for OAuth mirror compatibility.

## Signup Bridge

Email/password sign-up is routed through `/api/partner-signup` so the raw Better Auth sign-up endpoint stays gated.

- Local development uses a built-in partner bridge secret.
- Production should set `PARTNER_SIGNUP_BRIDGE_SECRET` on the partners app and Convex deployment.
- `ADMIN_SIGNUP_BRIDGE_SECRET` is accepted only as a fallback for shared local/bootstrap environments.

## Production Environment Checklist

- `CONVEX_URL` or `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_SITE_URL` or `NEXT_PUBLIC_CONVEX_SITE_URL`
- `BETTER_AUTH_SECRET`
- `PARTNER_SIGNUP_BRIDGE_SECRET`
- `ANAN_PLATFORM_SERVICE_TOKEN`
- `PARTNERS_REVIEW_CALLBACK_TOKEN`
- `ANAN_HUB_API_URL`

## Anan Integration Boundary

- Partners publishes app registration, workspace capability discovery, authorization status, and event delivery payloads from `lib/anan-integration/contracts.ts`.
- Anan remains the source of truth for workspace permissions, consent, and workspace-side execution.
- Do not import `anan/convex/_generated/api` from this app.

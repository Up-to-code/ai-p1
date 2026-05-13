# Anan Monorepo Deployment

This repository is an npm-workspaces monorepo. Product apps live under `apps/*`, shared packages live under `packages/*`, and documentation lives under `docs`.

```txt
apps/workspace
apps/partners
apps/admin
apps/demo-partner-app
docs
packages
```

## Local Development

Install once from the repository root:

```bash
npm install
```

Run each app from the root:

```bash
npm run dev:workspace       # http://localhost:3000
npm run dev:partners  # http://localhost:3002
npm run dev:admin     # http://localhost:3003
npm run dev:demo      # http://localhost:3004
```

Run checks across workspaces:

```bash
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
npm run build --workspaces --if-present
```

You can also target one app:

```bash
npm --workspace @anan/workspace run build
npm --workspace @anan/partners run typecheck
npm --workspace @anan/admin-review run test
npm --workspace @anan/demo-partner-app run build
```

## Vercel Projects

Deploy each app as its own Vercel project. Use the same Git repository and set the Vercel Root Directory per project:

| Vercel project | Root Directory | Domain |
| --- | --- | --- |
| Workspace | `apps/workspace` | `app.<root-domain>` |
| Partners | `apps/partners` | `partners.<root-domain>` |
| Admin | `apps/admin` | `admin.<root-domain>` |
| Demo partner app | `apps/demo-partner-app` | `demo.<root-domain>` |

Environment variables stay per app. Do not share service tokens between Vercel projects unless that token is explicitly intended for that app boundary.

## Partner OAuth Configuration

For production, configure the app URLs consistently:

```txt
Workspace API:      https://app.<root-domain>
Partners:    https://partners.<root-domain>
Admin:       https://admin.<root-domain>
Demo:        https://demo.<root-domain>
Demo redirect URI:
https://demo.<root-domain>/api/auth/anan/callback
```

Partners submits app registrations to Workspace using `ANAN_WORKSPACE_API_URL` and `ANAN_PLATFORM_SERVICE_TOKEN`. Admin reviews through Workspace using `WORKSPACE_API_BASE_URL` and `WORKSPACE_ADMIN_SERVICE_TOKEN`. The demo app starts OAuth against Workspace with `ANAN_WORKSPACE_API_URL`, `ANAN_CLIENT_ID`, and `PARTNER_APP_URL`.

## Boundaries

- Workspace is the source of truth for approved partner apps, OAuth clients, organization consent, and partner resource APIs.
- Partners is the source of truth for developer drafts, submissions, and developer-facing setup state.
- Admin is a review console over Workspace service APIs.
- Demo partner app is a standalone reference implementation that calls Workspace Hono APIs only.
- Shared packages under `packages/*` may be imported by apps, but apps must not import another app's Convex generated internals.

# Qentrah

Qentrah is a multi-app real estate workspace and partner integration platform. The
monorepo contains the main Workspace product, the Partners developer portal, an
internal Admin Review console, a deployable partner OAuth demo, a marketing
site, shared packages, and repo-level documentation.

This README is the front door for rebuilding the project, finding the right app,
and understanding where configuration and architecture decisions live.

## Quick Start

Prerequisites:

- Node.js 20 or newer.
- npm with the checked-in lockfile.
- Convex for apps that use Convex.
- Vercel for production deployments.
- Optional service accounts for features that need them: Google OAuth,
  UploadThing, OpenRouter, Sentry, and Mapbox.

Install dependencies from the repository root:

```bash
npm install
```

Run local apps:

```bash
npm run dev:workspace  # http://localhost:3000
npm run dev:partners   # http://localhost:3002
npm run dev:admin      # http://localhost:3003
npm run dev:demo       # http://localhost:3004
npm run dev:marketing  # http://localhost:3005
```

Run validation:

```bash
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
npm run build --workspaces --if-present
```

Target one workspace:

```bash
npm --workspace @qentrah/workspace run typecheck
npm --workspace @qentrah/partners run test
npm --workspace @qentrah/admin-review run build
npm --workspace @qentrah/demo-partner-app run build
npm --workspace @qentrah/marketing run typecheck
```

## Apps

| App | Package | Local URL | Purpose |
| --- | --- | --- | --- |
| Workspace | `@qentrah/workspace` | `http://localhost:3000` | Main product, OAuth provider, resource APIs, organization workspace |
| Partners | `@qentrah/partners` | `http://localhost:3002` | Developer portal, app registration, docs, sandbox |
| Admin Review | `@qentrah/admin-review` | `http://localhost:3003` | Internal partner app review console |
| Demo Partner App | `@qentrah/demo-partner-app` | `http://localhost:3004` | Reference OAuth partner integration |
| Marketing | `@qentrah/marketing` | `http://localhost:3005` | Public marketing site |

Shared packages live in `packages/*`. Apps may import shared packages, but they
should not import another app's generated Convex internals.

## Documentation Map

- [Setup and configuration](./SETUP_AND_CONFIGURATION.md): deep local,
  production, environment, token, and troubleshooting guide.
- [Documentation index](./docs/README.md): repo-level documentation catalog.
- [Architecture](./docs/ARCHITECTURE.md): system boundaries, flows, data
  ownership, and integration shape.
- [Apps and packages](./docs/APPS.md): what each app and shared package is for.
- [Environment variables](./docs/ENVIRONMENT.md): canonical environment
  variable reference and external links.
- [Feature lifecycle](./docs/FEATURE_LIFECYCLE.md): how features move from idea
  to implementation, release, maintenance, and deprecation.
- [Agent guide](./docs/AGENT_GUIDE.md): guidance for AI agents and developers
  editing this repo safely.
- [Partner platform docs](./docs/partner-platform/README.md): partner platform
  flow and implementation guide.

App-level docs:

- [Workspace app](./apps/workspace/README.md)
- [Partners app](./apps/partners/README.md)
- [Admin Review app](./apps/admin/README.md)
- [Demo Partner App](./apps/demo-partner-app/README.md)
- [Marketing app](./apps/marketing/README.md)

## Configuration

Configuration is app-specific. Keep runtime values in local `.env.local` files,
Vercel project env, or Convex deployment env. Commit only examples and
documentation.

Important integration variables include:

- `QENTRAH_WORKSPACE_API_URL`
- `QENTRAH_CLIENT_ID`
- `QENTRAH_CLIENT_SECRET`
- `PARTNER_APP_URL`
- `SESSION_SECRET`
- `WORKSPACE_API_BASE_URL`
- `WORKSPACE_ADMIN_SERVICE_TOKEN`
- `PARTNERS_REVIEW_CALLBACK_TOKEN`

Secrets and production tokens must never be committed. Browser-exposed values
must use `NEXT_PUBLIC_`, and secret values must stay server-side.

## Development Boundaries

- Workspace owns organizations, consent, OAuth authorization, resource APIs, and
  Workspace-side partner approval state.
- Partners owns developer accounts, draft apps, submission state, documentation,
  and sandbox flows.
- Admin Review calls Workspace service APIs and does not own the primary review
  data model.
- Demo Partner App is a reference implementation only; production partners
  should store OAuth tokens in a durable server-side token vault.
- Marketing is public content and should not depend on private Workspace or
  Partners runtime state.

## Validation Before Shipping

Run the narrowest checks for the files changed, then broaden if shared packages,
contracts, auth, routing, or docs generation were touched.

Useful checks:

```bash
npm --workspace @qentrah/workspace run typecheck
npm --workspace @qentrah/workspace test
npm --workspace @qentrah/partners run typecheck
npm --workspace @qentrah/partners test
npm --workspace @qentrah/partners run build
npm --workspace @qentrah/admin-review run typecheck
npm --workspace @qentrah/demo-partner-app test
npm --workspace @qentrah/marketing run typecheck
```

Partner MDX docs compile through the Partners build, so run
`npm --workspace @qentrah/partners run build` when changing
`apps/partners/content/docs/*` or docs components.

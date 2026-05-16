# Qentrah Workspace App

Workspace is the main Qentrah product and platform authority. It owns the
customer-facing workspace, organization auth, OAuth provider, partner resource
APIs, admin service APIs, Convex backend, and most Workspace domain logic.

## Local Development

From the repository root:

```bash
npm run dev:workspace
```

From this app folder:

```bash
npm run dev
```

Default local URL: `http://localhost:3000`.

The dev script starts Next.js and Convex together. Use
`npm run dev:next` or `npm run dev:convex` when debugging only one side.

## Main Responsibilities

- Authenticated Workspace product pages.
- Public localized pages and legal pages.
- Better Auth integration and organization-aware session handling.
- OAuth authorization code + PKCE provider for partner apps.
- Partner resource APIs under `/api/v1/partner`.
- Internal service APIs used by Partners and Admin Review.
- Upload, map, AI runtime, observability, permissions, and domain services.

## Important Routes

| Route area | Purpose |
| --- | --- |
| `src/app/[locale]/(app)` | Authenticated product pages: dashboard, activity, calendar, clients, integrations, organization, projects, properties, team |
| `src/app/[locale]/(auth)` | Sign-in, sign-up, invite acceptance, organization selection |
| `src/app/[locale]/(public)` | Public website and legal pages inside Workspace |
| `src/app/oauth/authorize` | OAuth authorization endpoint |
| `src/app/oauth/token` | OAuth token endpoint |
| `src/app/oauth/consent` | Consent page for partner access |
| `src/app/oauth/select-organization` | Organization selection for OAuth |
| `src/app/api/auth/[...all]` | Better Auth route handler |
| `src/app/api/[[...route]]` | Hono/API route entrypoint |

## Important Folders

| Folder | Purpose |
| --- | --- |
| `convex` | Workspace Convex schema, functions, auth bridge, generated clients |
| `src/app` | Next.js App Router pages, layouts, and route handlers |
| `src/components` | Workspace UI components |
| `src/lib` | App-level helpers and integrations |
| `src/server` | Server domains, auth, cache, protocols, routing, validation, observability |
| `docs` | Deep Workspace architecture, auth, data model, SDK, security, and visibility docs |
| `messages` | Locale message files |
| `public` | Static assets |

Do not edit generated folders by hand, including `.next` and
`convex/_generated`.

## Environment

See the canonical repo reference:

- [Setup and configuration](../../SETUP_AND_CONFIGURATION.md)
- [Environment variables](../../docs/ENVIRONMENT.md)

Common Workspace variables include:

- `NEXT_PUBLIC_SITE_URL`
- `SITE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `CONVEX_SITE_URL`
- `PARTNER_APPS_ENABLED`
- `PARTNERS_API_BASE_URL`
- `PARTNERS_PLATFORM_SERVICE_TOKEN`
- `PARTNER_OAUTH_ISSUER`
- `PARTNER_OAUTH_AUDIENCE`
- `WORKSPACE_ADMIN_SERVICE_TOKEN`
- `OPENROUTER_API_KEY`
- `UPLOADTHING_TOKEN`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `NEXT_PUBLIC_SENTRY_DSN`

Secret values belong in `.env.local`, Vercel, or Convex deployment env. Do not
commit real token values.

## Scripts

```bash
npm run dev
npm run dev:stack
npm run dev:next
npm run dev:convex
npm run build
npm run typecheck
npm run lint
npm run check:convex-runtime
npm test
npm run test:e2e
```

From the repository root:

```bash
npm --workspace @qentrah/workspace run typecheck
npm --workspace @qentrah/workspace test
npm --workspace @qentrah/workspace run test:e2e
```

## Testing

Workspace unit and source-guard tests run with Vitest:

```bash
npm --workspace @qentrah/workspace test
```

Browser flows run with Playwright:

```bash
npm --workspace @qentrah/workspace run test:e2e
```

For a focused smoke check across the main authenticated product flows, run:

```bash
npm --workspace @qentrah/workspace run test:e2e -- e2e/workspace-all-flows.spec.ts
```

The all-flow smoke spec signs in a fresh owner, creates representative
workspace data, and opens dashboard, projects, properties, clients, calendar,
activity, integrations, and organization settings for a ready organization.

## Documentation

- [Root README](../../README.md)
- [Repo architecture](../../docs/ARCHITECTURE.md)
- [Apps and packages](../../docs/APPS.md)
- [Workspace docs index](./docs/README.md)
- [Workspace server README](./src/server/README.md)
- [Workspace Convex README](./convex/README.md)

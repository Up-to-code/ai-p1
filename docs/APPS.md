# Apps And Packages

This document explains what each deployable app and shared package is for. Use
it when deciding where a change belongs.

## Deployable Apps

| App | Package | Path | Purpose |
| --- | --- | --- | --- |
| Workspace | `@anan/workspace` | `apps/workspace` | Main product, organization workspace, OAuth provider, partner resource APIs |
| Partners | `@anan/partners` | `apps/partners` | Developer portal, app registration, partner docs, sandbox |
| Admin Review | `@anan/admin-review` | `apps/admin` | Internal review console for partner app submissions |
| Demo Partner App | `@anan/demo-partner-app` | `apps/demo-partner-app` | Standalone OAuth integration example |
| Marketing | `@anan/marketing` | `apps/marketing` | Public marketing site |

## Workspace

Workspace is the core product and platform authority.

Important areas:

- `src/app/[locale]/(app)`: authenticated product pages such as dashboard,
  activity, calendar, clients, integrations, organization, projects,
  properties, and team.
- `src/app/[locale]/(auth)`: sign-in, sign-up, organization selection, and
  invite acceptance.
- `src/app/oauth`: OAuth authorization, organization selection, consent, and
  token routes.
- `src/app/api`: Hono/API route entrypoints and Better Auth route handlers.
- `convex`: schema, functions, auth bridge, and realtime backend.
- `src/server`: server-side domains, auth, cache, protocols, routing,
  middleware, validation, and observability.
- `docs`: detailed Workspace architecture and domain documentation.

Run:

```bash
npm run dev:workspace
npm --workspace @anan/workspace run typecheck
npm --workspace @anan/workspace test
npm --workspace @anan/workspace run test:e2e
```

## Partners

Partners is the developer-facing portal and docs site.

Important areas:

- `app/(marketing)`: public Partners landing, pricing, security, policies, and
  support pages.
- `app/(auth)`: partner sign-in and sign-up.
- `app/(portal)/dashboard`: developer account, app list, app detail, status,
  and dashboard shell.
- `app/docs`: Fumadocs route for MDX docs.
- `content/docs`: partner-facing documentation source.
- `components/docs`: MDX-renderable docs components, including copy cards.
- `convex`: Partners-owned app drafts, submissions, profile, and portal state.
- `server`: server-side repositories and integration boundaries.

Run:

```bash
npm run dev:partners
npm --workspace @anan/partners run typecheck
npm --workspace @anan/partners test
npm --workspace @anan/partners run build
```

## Admin Review

Admin Review is a small internal Next.js app for partner app approval work.

Important areas:

- `app/page.tsx`: review queue.
- `app/apps/[appId]/page.tsx`: app detail and review decision flow.
- `lib/workspace.ts`: Workspace admin service API client.
- `lib/config.ts`: required Workspace API URL and service token loading.

Run:

```bash
npm run dev:admin
npm --workspace @anan/admin-review run typecheck
npm --workspace @anan/admin-review test
```

## Demo Partner App

The demo is a deployable partner reference app. It demonstrates the integration
contract that outside partners should follow.

Important areas:

- `app/page.tsx` and `app/unlock/page.tsx`: setup-token gate.
- `app/dashboard/page.tsx`: authorized demo dashboard.
- `app/api/auth/anan/start`: starts OAuth with PKCE.
- `app/api/auth/anan/callback`: exchanges code server-side.
- `app/api/anan/*`: resource API proxy routes for organization, clients, and
  properties.
- `lib/oauth.ts`: PKCE and OAuth helpers.
- `lib/workspace-api.ts`: Workspace resource API client.

Run:

```bash
npm run dev:demo
npm --workspace @anan/demo-partner-app run typecheck
npm --workspace @anan/demo-partner-app test
```

## Marketing

Marketing is the public content app.

Important areas:

- `app/page.tsx`: default public homepage.
- `app/[locale]/page.tsx`: localized homepage.
- `app/privacy` and `app/terms`: public policy pages.
- `app/[locale]/privacy` and `app/[locale]/terms`: localized policy pages.

Run:

```bash
npm run dev:marketing
npm --workspace @anan/marketing run typecheck
npm --workspace @anan/marketing run build
```

## Shared Packages

| Package | Purpose |
| --- | --- |
| `packages/auth` | Shared OAuth/OIDC and authorization primitives |
| `packages/auth-client` | Better Auth client factories |
| `packages/auth-sdk` | SDK-facing auth package surface |
| `packages/authorization` | External organization authorization helpers |
| `packages/base-logic` | Base reusable domain logic |
| `packages/compliance-logic` | Compliance domain logic |
| `packages/crm-logic` | CRM domain logic |
| `packages/domain-contracts` | Shared DTO and schema contracts |
| `packages/location-map` | Map/location UI and helpers |
| `packages/market-logic` | Market domain logic |
| `packages/offers-logic` | Offers domain logic |
| `packages/platform-core` | Core errors, classnames, locale, and auth bridge utilities |
| `packages/testing` | Shared testing utilities |
| `packages/ui` | Shared React UI primitives |
| `packages/web-foundation` | Next/web helpers, providers, and media utilities |
| `packages/workspace-logic` | Workspace domain logic |

## Placement Rules

- Put app-only routes, env loading, and UI state inside the owning app.
- Put reusable schemas and DTOs in `packages/domain-contracts`.
- Put reusable auth logic in `packages/auth`, `packages/auth-client`, or
  `packages/authorization`.
- Put reusable visual primitives in `packages/ui`.
- Put partner-facing documentation in `apps/partners/content/docs`.
- Put Workspace deep domain documentation in `apps/workspace/docs`.

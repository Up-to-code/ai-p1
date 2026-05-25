# Qentrah

Qentrah is a multi-app real estate workspace and partner integration platform. The
monorepo contains the main Workspace product, the Partners developer portal, an
internal Admin Review console, a deployable partner OAuth demo, a marketing
site, an Expo mobile app, shared packages, and repo-level documentation.

This README is the front door for rebuilding the project, finding the right app,
and understanding where configuration and architecture decisions live.

Start with this file when you need orientation. Use the linked docs when you
need deeper flow details, environment setup, or app-specific implementation
notes.

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
npm --workspace @zane-ai/mobile run start
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
npm --workspace @zane-ai/mobile run typecheck
```

## Apps

| App | Package | Local target | Purpose |
| --- | --- | --- | --- |
| Workspace | `@qentrah/workspace` | `http://localhost:3000` | Main customer product, organization workspace, OAuth provider, partner resource APIs, Convex runtime |
| Partners | `@qentrah/partners` | `http://localhost:3002` | Developer portal, partner app registration, docs, sandbox OAuth, platform APIs |
| Admin Review | `@qentrah/admin-review` | `http://localhost:3003` | Internal console for reviewing partner app submissions |
| Demo Partner App | `@qentrah/demo-partner-app` | `http://localhost:3004` | Reference external partner implementation using OAuth with PKCE |
| Marketing | `@qentrah/marketing` | `http://localhost:3005` | Public marketing, localized homepage, privacy, and terms pages |
| Mobile | `@zane-ai/mobile` | Expo dev tools | Mobile property, assistant, voice, preferences, and listing flows |

Shared packages live in `packages/*`. Apps may import shared packages, but they
should not import another app's generated Convex internals.

## Repo Shape

Qentrah is organized around runtime ownership. Each app owns its routes, runtime
configuration, data adapters, and app-specific UI. Shared packages are for
contracts, pure logic, auth primitives, and reusable UI that truly cross app
boundaries.

```txt
apps/
  workspace/          Main product, OAuth provider, resource APIs, Convex
  partners/           Developer portal, app catalog, docs, sandbox, Prisma
  admin/              Internal partner review console
  demo-partner-app/   Reference partner OAuth implementation
  marketing/          Public marketing and legal pages
  mobile/             Expo mobile experience

packages/
  auth*/              Auth clients, SDK, OAuth/OIDC helpers, authorization
  domain-contracts/   Shared DTOs and schemas
  partner-workspace-sync/
                      Partners-to-Workspace OAuth projection contracts
  platform-core/      Core shared errors, utilities, locale, auth bridge helpers
  ui/, ag-ui/         Shared React UI and assistant UI primitives
  *-logic/            Pure domain logic packages
```

For a single visual map of the whole repo, use the
[all-in-one repo flow chart](./docs/ALL_IN_ONE_REPO_FLOW_CHART.md).

## Core Flows

**Partner app lifecycle**
Partner developers create apps in Partners, submit them for review, and internal
reviewers approve, reject, or suspend them through Admin Review. Partners owns
the app catalog and review state. Workspace receives only the minimal OAuth
runtime projection needed to enforce authorization.

**OAuth and partner resource APIs**
External partners redirect users to Workspace OAuth with PKCE. Workspace handles
authentication, organization selection, consent, token issuance, and partner
resource API enforcement. Resource APIs validate token claims, organization
partner grants, scopes, and resource/action permission before touching business
data.

**Workspace product runtime**
Workspace owns organizations, members, roles, customer resources, media,
billing, AI runtime configuration, MCP/API-key access, webhooks, and audit
state. Most business data is organization-scoped in Workspace Convex.

**Partners portal runtime**
Partners owns developer identity, partner organizations, app drafts, app review
history, sandbox organizations, sandbox OAuth codes/tokens, docs, and platform
catalog APIs. Partners uses Prisma/PostgreSQL for its canonical data model.

**Mobile runtime**
Mobile is an Expo app with screen routes under `apps/mobile/app`, state slices
under `apps/mobile/src/store`, conversation and voice logic under
`apps/mobile/src/conversation`, and listing/map decision logic under
`apps/mobile/src/decision`.

## Where To Work

| Change | Start here |
| --- | --- |
| Workspace page or route | `apps/workspace/src/app` |
| Workspace server API | `apps/workspace/src/server/routing`, `apps/workspace/src/server/domains` |
| Workspace Convex data or functions | `apps/workspace/convex` |
| OAuth provider, consent, token behavior | `apps/workspace/src/app/oauth`, `apps/workspace/src/server/auth` |
| Partner portal page | `apps/partners/app/(portal)/dashboard` |
| Partner app schema or review data | `apps/partners/prisma/schema.prisma`, `apps/partners/lib/schemas` |
| Partner platform API | `apps/partners/app/api/platform`, `apps/partners/app/api/admin` |
| Partner-facing docs | `apps/partners/content/docs`, `apps/partners/components/docs` |
| Admin review workflow | `apps/admin/src/app`, `apps/admin/src/lib` |
| Demo integration behavior | `apps/demo-partner-app/app/api/auth/qentrah`, `apps/demo-partner-app/app/api/qentrah` |
| Marketing pages | `apps/marketing/app`, `apps/marketing/components/marketing` |
| Mobile screens and state | `apps/mobile/app`, `apps/mobile/src/store`, `apps/mobile/src/conversation`, `apps/mobile/src/decision` |
| Shared contracts | `packages/domain-contracts`, `packages/partner-workspace-sync` |
| Shared auth logic | `packages/auth`, `packages/auth-client`, `packages/auth-sdk`, `packages/authorization`, `packages/partner-auth-core` |
| Shared UI | `packages/ui`, `packages/ag-ui`, `packages/location-map`, `packages/brand-identity` |

## Documentation Map

- [Setup and configuration](./SETUP_AND_CONFIGURATION.md): deep local,
  production, environment, token, and troubleshooting guide.
- [Documentation index](./docs/README.md): repo-level documentation catalog.
- [Architecture](./docs/ARCHITECTURE.md): system boundaries, flows, data
  ownership, and integration shape.
- [All-in-one repo flow chart](./docs/ALL_IN_ONE_REPO_FLOW_CHART.md): single
  Mermaid map of apps, data stores, shared packages, and cross-app flows.
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
npm --workspace @zane-ai/mobile run typecheck
npm --workspace @zane-ai/mobile test
```

Partner MDX docs compile through the Partners build, so run
`npm --workspace @qentrah/partners run build` when changing
`apps/partners/content/docs/*` or docs components.

Validation broadening guide:

- If you change shared contracts, run the package test/build plus the affected
  Workspace, Partners, Admin, Demo, or Mobile checks.
- If you change auth, OAuth, scopes, tokens, organization grants, service
  tokens, or platform APIs, validate both Workspace and Partners.
- If you change partner-facing docs, run the Partners build because the MDX docs
  compile through the app.
- If you change Convex schema or functions, run the owning app typecheck and
  tests before broader workspace checks.
- If you change mobile navigation, state, voice, map, or listing behavior, run
  the Mobile typecheck/tests and use Maestro flows when the native user journey
  changed.

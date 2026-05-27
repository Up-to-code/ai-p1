# Repo Flow Chart

This document maps the whole repository at a system-flow level. It complements
`docs/architecture/system-architecture.md` by showing how the deployable apps, shared packages,
data stores, and external actors move through Qentrah.

Generated folders and build outputs are intentionally excluded from this map:
`node_modules`, `.next`, `.source`, `dist`, `build`, `test-results`, and Convex
`_generated`.

## Whole Repo Runtime Map

```mermaid
flowchart LR
  subgraph Actors["External actors"]
    Visitor["Public visitor"]
    WorkspaceUser["Workspace customer user"]
    PartnerDev["Partner developer"]
    Reviewer["Internal reviewer"]
    PartnerProduct["External partner product"]
    MobileUser["Mobile user"]
  end

  subgraph Apps["Deployable apps"]
    Marketing["apps/marketing<br/>Public marketing site"]
    Workspace["apps/workspace<br/>Main product, OAuth provider, resource APIs"]
    Partners["apps/partners<br/>Developer portal, docs, sandbox, app catalog"]
    Admin["apps/admin<br/>Internal partner app review console"]
    Demo["apps/demo-partner-app<br/>Reference OAuth partner"]
    Mobile["apps/mobile<br/>Expo mobile experience"]
  end

  subgraph Data["Runtime data and services"]
    WorkspaceConvex["Workspace Convex<br/>organizations, grants, resources, billing, webhooks"]
    PartnersPostgres["Partners PostgreSQL via Prisma<br/>developer accounts, apps, reviews, sandbox"]
    BetterAuth["Better Auth<br/>sessions, OAuth provider, token verification"]
    MobilePersistence["Mobile local store plus Convex client surface"]
    Uploads["UploadThing media"]
    Observability["Sentry, metrics, logs"]
    AI["OpenRouter / AI SDK"]
    Maps["Mapbox"]
    Vercel["Vercel deployments"]
  end

  subgraph Shared["Shared packages"]
    Foundation["platform-core, brand-identity, web-foundation"]
    Contracts["domain-contracts, partner-workspace-sync"]
    Auth["auth, auth-client, auth-sdk, authorization, partner-auth-core"]
    UI["ui, ag-ui, location-map"]
    DomainLogic["workspace-logic, base-logic, market-logic, crm-logic, offers-logic, compliance-logic"]
    Testing["testing"]
    ConvexAdapters["convex-adapters"]
  end

  Visitor --> Marketing
  WorkspaceUser --> Workspace
  PartnerDev --> Partners
  Reviewer --> Admin
  PartnerProduct --> Demo
  PartnerProduct --> Workspace
  MobileUser --> Mobile

  Marketing --> Foundation

  Workspace --> WorkspaceConvex
  Workspace --> BetterAuth
  Workspace --> Uploads
  Workspace --> Observability
  Workspace --> AI
  Workspace --> Contracts
  Workspace --> Auth
  Workspace --> Foundation
  Workspace --> ConvexAdapters

  Partners --> PartnersPostgres
  Partners --> BetterAuth
  Partners --> Contracts
  Partners --> Auth
  Partners --> UI
  Partners --> Foundation

  Admin --> Partners
  Admin --> Workspace
  Admin --> Foundation

  Demo --> Auth
  Demo --> Workspace
  Demo --> Foundation

  Mobile --> MobilePersistence
  Mobile --> BetterAuth
  Mobile --> Maps

  UI --> Foundation
  DomainLogic --> Contracts
  Contracts --> Foundation
  Auth --> Foundation
  ConvexAdapters --> Foundation
  Testing --> Contracts

  Apps --> Vercel
```

## App Ownership

| App | Runtime role | Primary source paths | Primary data owner |
| --- | --- | --- | --- |
| Workspace | Customer product, OAuth provider, partner resource API, organization runtime | `apps/workspace/src/app`, `apps/workspace/src/server`, `apps/workspace/convex` | Workspace Convex and Better Auth runtime projection |
| Partners | Developer portal, app registration, docs, sandbox, app catalog | `apps/partners/app`, `apps/partners/server`, `apps/partners/prisma`, `apps/partners/content/docs` | Partners PostgreSQL via Prisma |
| Admin Review | Internal app submission review console | `apps/admin/src/app`, `apps/admin/src/lib` | Partners review APIs, with Workspace service calls where needed |
| Demo Partner App | Reference external partner implementation | `apps/demo-partner-app/app`, `apps/demo-partner-app/lib` | Demo session cookie and Workspace resource API calls |
| Marketing | Public content site | `apps/marketing/app`, `apps/marketing/components`, `apps/marketing/lib` | Static/public content only |
| Mobile | Expo mobile surface for property, conversation, voice, and preferences | `apps/mobile/app`, `apps/mobile/src` | Local Zustand state, mobile persistence adapters, Convex client surface |

## Partner Platform Flow

```mermaid
sequenceDiagram
  actor Dev as Partner developer
  participant Partners as apps/partners
  participant DB as Partners PostgreSQL
  participant Admin as apps/admin
  participant Workspace as apps/workspace
  participant Convex as Workspace Convex
  participant Product as Partner product or demo app

  Dev->>Partners: Sign up and create developer organization
  Partners->>DB: Store PartnerProfile and ProgrammerOrganization
  Dev->>Partners: Create app draft with redirect URIs and scopes
  Partners->>DB: Store PartnerApp in draft or submitted state
  Admin->>Partners: Read pending submissions through admin APIs
  Admin->>Partners: Approve, reject, or suspend app
  Partners->>DB: Store PartnerAppReview and status
  Partners->>Workspace: Publish minimal OAuth runtime projection
  Workspace->>Convex: Store organization partner grant on consent
  Workspace->>Workspace: Upsert Better Auth OAuth client state
  Product->>Workspace: Start OAuth authorization with PKCE
  Workspace->>Partners: Verify app, client, redirect URI, and scopes
  Workspace->>Product: Redirect with authorization code
  Product->>Workspace: Exchange code server-side
  Product->>Workspace: Call /api/v1/partner resource APIs
  Workspace->>Convex: Enforce organization grant, scopes, and resource access
```

The source of truth stays split on purpose:

- Partners owns app catalog, developer accounts, redirect URIs, scopes, review
  state, published catalog status, and sandbox data.
- Workspace owns organization grants, OAuth enforcement, product resources,
  resource API authorization, webhooks, billing, media, and customer runtime
  state.
- Admin Review is an operator console over service APIs. It does not own the
  review data model.

## Workspace Request Flow

```mermaid
flowchart TD
  Request["Browser, partner API client, webhook, or internal service"] --> Entry{"Workspace entrypoint"}
  Entry --> NextPages["Next App Router pages<br/>src/app/[locale]"]
  Entry --> OAuthRoutes["OAuth routes<br/>src/app/oauth"]
  Entry --> ApiRoutes["Hono and Next API routes<br/>src/app/api + src/server/routing"]

  NextPages --> Providers["Providers, layout, i18n, auth client"]
  Providers --> Domains["Client domains<br/>src/domains/*"]
  Domains --> ConvexClient["Convex React client"]

  OAuthRoutes --> BetterAuth["Better Auth OAuth provider"]
  OAuthRoutes --> Consent["Organization selection and consent"]
  Consent --> PartnerVerify["Verify partner app with Partners platform API"]
  Consent --> Grants["organizationPartnerConnections"]

  ApiRoutes --> Middleware["Server middleware<br/>origin, CORS, security headers, rate limit, logging"]
  Middleware --> Validation["Zod and route validators"]
  Validation --> DomainHandlers["Server domains<br/>organization, properties, clients, projects, agents, integrations"]
  DomainHandlers --> ResourceAuth["Resource auth and scope checks"]
  ResourceAuth --> ConvexFunctions["Convex read/write functions"]

  ConvexClient --> ConvexFunctions
  ConvexFunctions --> WorkspaceTables["Workspace Convex tables"]
  BetterAuth --> WorkspaceTables
  Grants --> WorkspaceTables
```

Key Workspace source areas:

- `apps/workspace/src/app/oauth`: OAuth authorize, consent, organization
  selection, and token routes.
- `apps/workspace/src/app/api`: API route entrypoints.
- `apps/workspace/src/server`: middleware, route adapters, security,
  validation, observability, and domain services.
- `apps/workspace/convex`: schema, auth bridge, resource functions, grants,
  billing, webhooks, agents, and MCP/API-key state.

## Partners Request Flow

```mermaid
flowchart TD
  Dev["Partner developer"] --> Public["Marketing and docs routes<br/>app/(marketing), app/docs"]
  Dev --> AuthRoutes["Auth routes<br/>app/(auth), app/api/auth"]
  Dev --> Portal["Portal dashboard<br/>app/(portal)/dashboard"]

  Portal --> Forms["Forms and portal components"]
  Forms --> Schemas["Zod schemas<br/>lib/schemas"]
  Schemas --> Prisma["Prisma repositories and Better Auth adapter"]
  Prisma --> Postgres["Partners PostgreSQL"]

  Portal --> PlatformApis["Platform APIs<br/>app/api/platform"]
  PlatformApis --> PublishedApps["published-apps"]
  PlatformApis --> VerifyAuth["verify-authorization"]

  Portal --> ReviewApis["Admin APIs<br/>app/api/admin/partner-apps"]
  ReviewApis --> Postgres

  Portal --> Sync["partner-workspace-sync contracts"]
  Sync --> Workspace["Workspace OAuth runtime projection"]

  Portal --> Sandbox["Sandbox OAuth and resources<br/>app/sandbox + server/sandbox"]
  Sandbox --> Postgres
```

Important Partners boundaries:

- `apps/partners/prisma/schema.prisma` owns developer profiles,
  organizations, app drafts, reviews, sandbox organizations, sandbox OAuth
  codes/tokens, request logs, and workspace links.
- `apps/partners/app/api/platform/*` exposes catalog and authorization checks
  to Workspace.
- `apps/partners/lib/qentrah-integration` keeps the Workspace integration
  contract for partner-facing flows.
- `packages/partner-workspace-sync` owns the minimal projection contract used
  between Partners and Workspace.

## External Partner OAuth Flow

```mermaid
flowchart TD
  Start["Partner product frontend"] --> Backend["Partner backend creates state and PKCE verifier"]
  Backend --> Authorize["Redirect user to Workspace /oauth/authorize"]
  Authorize --> WorkspaceAuth["Workspace authenticates user"]
  WorkspaceAuth --> SelectOrg["Select organization"]
  SelectOrg --> Consent["Approve requested scopes"]
  Consent --> Verify["Workspace verifies app and scopes with Partners"]
  Verify --> SaveGrant["Save organization partner grant"]
  SaveGrant --> Code["Redirect to partner callback with code"]
  Code --> Exchange["Partner backend exchanges code at /oauth/token"]
  Exchange --> TokenStore["Partner stores tokens server-side"]
  TokenStore --> ResourceApi["Call Workspace /api/v1/partner/*"]
  ResourceApi --> Enforce["Verify Better Auth claims, organization grant, scopes, and resource action"]
  Enforce --> Resources["Return organization-scoped resources"]
```

The demo app implements this flow in:

- `apps/demo-partner-app/app/api/auth/qentrah/start/route.ts`
- `apps/demo-partner-app/app/api/auth/qentrah/callback/route.ts`
- `apps/demo-partner-app/app/api/qentrah/*`
- `apps/demo-partner-app/lib/oauth.ts`
- `apps/demo-partner-app/lib/workspace-api.ts`

## Mobile Flow

```mermaid
flowchart TD
  MobileUser["Mobile user"] --> ExpoRouter["Expo Router screens<br/>apps/mobile/app"]
  ExpoRouter --> Providers["App providers, fonts, auth, theme"]
  Providers --> Zustand["Zustand store slices"]
  Providers --> Auth["Better Auth Expo client"]
  Providers --> Decision["Decision domain<br/>listings, filters, map, compare"]
  Providers --> Conversation["Conversation domain<br/>assistant turn rendering, composer, voice"]
  Decision --> Persistence["Convex persistence adapters and local state"]
  Conversation --> Voice["Expo speech adapter and voice composer"]
  Conversation --> Persistence
  Decision --> Mapbox["Mapbox runtime"]
  Persistence --> MobileData["Mobile runtime data"]
```

Mobile is not listed in the root README app table, but it is present as the
`@zane-ai/mobile` workspace. Treat it as a separate Expo runtime boundary.

## Shared Package Layers

```mermaid
flowchart BT
  Brand["brand-identity"] --> Apps["Apps"]
  Platform["platform-core"] --> Apps
  Platform --> UI["ui"]
  Platform --> WebFoundation["web-foundation"]
  Platform --> Auth["auth"]
  Platform --> Contracts["domain-contracts"]
  Platform --> ConvexAdapters["convex-adapters"]

  Brand --> UI
  Brand --> Auth
  Auth --> UI
  Auth --> Contracts

  PartnerAuthCore["partner-auth-core"] --> Workspace["workspace app"]
  PartnerAuthCore --> Partners["partners app"]

  PartnerSync["partner-workspace-sync"] --> Workspace
  PartnerSync --> Partners

  Contracts --> WorkspaceLogic["workspace-logic"]
  Contracts --> Testing["testing"]

  DomainPure["base-logic, market-logic, crm-logic, offers-logic, compliance-logic"] --> Apps
  LocationMap["location-map"] --> Apps
  AgUi["ag-ui"] --> UI
```

Package placement rules:

- Put cross-app schemas and DTOs in `packages/domain-contracts`.
- Put OAuth and partner authorization primitives in `packages/auth`,
  `packages/auth-client`, `packages/auth-sdk`, `packages/authorization`, or
  `packages/partner-auth-core`.
- Put Workspace and Partners projection contracts in
  `packages/partner-workspace-sync`.
- Put reusable UI in `packages/ui`, `packages/ag-ui`, or
  `packages/location-map`.
- Put app-only routing, secret loading, generated Convex APIs, and one-runtime
  UI state inside the owning app.

## Operational Validation Flow

```mermaid
flowchart LR
  Change["Code or docs change"] --> Scope{"Changed area"}
  Scope --> WorkspaceCheck["Workspace<br/>typecheck, test, e2e if routes/UI changed"]
  Scope --> PartnersCheck["Partners<br/>typecheck, test, build for docs/MDX"]
  Scope --> AdminCheck["Admin<br/>typecheck, test"]
  Scope --> DemoCheck["Demo<br/>typecheck, test"]
  Scope --> MarketingCheck["Marketing<br/>typecheck, build"]
  Scope --> MobileCheck["Mobile<br/>typecheck, tests, Maestro when native flow changed"]
  Scope --> SharedCheck["Shared package<br/>package test/build plus affected app checks"]
  SharedCheck --> RootCheck["Root workspace typecheck/test/build when contracts or shared layers changed"]
```

Use the narrowest validation first, then broaden when shared contracts, auth,
routing, data models, or cross-app flows changed.

## Fast Navigation Index

| Need | Start here |
| --- | --- |
| Product and organization runtime | `apps/workspace/src/app/[locale]/(app)`, `apps/workspace/src/domains` |
| OAuth provider behavior | `apps/workspace/src/app/oauth`, `apps/workspace/src/server/auth` |
| Partner resource APIs | `apps/workspace/src/server/routing/v1`, `apps/workspace/src/server/domains` |
| Workspace data model | `apps/workspace/convex/schema.ts`, `apps/workspace/convex/*` |
| Partner portal dashboard | `apps/partners/app/(portal)/dashboard`, `apps/partners/components/portal` |
| Partner app catalog and review state | `apps/partners/prisma/schema.prisma`, `apps/partners/app/api/platform`, `apps/partners/app/api/admin` |
| Partner docs | `apps/partners/content/docs`, `apps/partners/components/docs` |
| Admin review console | `apps/admin/src/app`, `apps/admin/src/lib` |
| External integration example | `apps/demo-partner-app/app/api/auth/qentrah`, `apps/demo-partner-app/app/api/qentrah` |
| Mobile screens and state | `apps/mobile/app`, `apps/mobile/src/store`, `apps/mobile/src/conversation`, `apps/mobile/src/decision` |
| Public marketing | `apps/marketing/app`, `apps/marketing/components/marketing` |
| Shared contracts | `packages/domain-contracts`, `packages/partner-workspace-sync` |
| Shared auth | `packages/auth`, `packages/auth-client`, `packages/auth-sdk`, `packages/authorization`, `packages/partner-auth-core` |
| Shared UI | `packages/ui`, `packages/ag-ui`, `packages/location-map`, `packages/brand-identity` |

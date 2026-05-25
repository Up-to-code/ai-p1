# All-In-One Repo Flow Chart

This is the single consolidated map for the repo. It puts the runtime apps,
external actors, data stores, shared packages, and the main product/partner
flows into one Mermaid chart.

```mermaid
flowchart LR
  subgraph Actors["People and external systems"]
    Visitor["Public visitor"]
    WorkspaceUser["Workspace customer user"]
    PartnerDeveloper["Partner developer"]
    Reviewer["Internal reviewer"]
    ExternalPartner["External partner product"]
    MobileUser["Mobile user"]
    WebhookConsumer["Partner webhook receiver"]
  end

  subgraph Apps["Deployable apps"]
    Marketing["apps/marketing<br/>Public marketing and legal pages"]
    Workspace["apps/workspace<br/>Main product, OAuth provider, partner APIs"]
    Partners["apps/partners<br/>Developer portal, docs, app catalog, sandbox"]
    Admin["apps/admin<br/>Internal review console"]
    Demo["apps/demo-partner-app<br/>Reference OAuth integration"]
    Mobile["apps/mobile<br/>Expo mobile property and assistant app"]
  end

  subgraph WorkspaceRuntime["Workspace runtime internals"]
    WorkspacePages["Next pages<br/>src/app/[locale]"]
    WorkspaceOAuth["OAuth authorize, consent, token<br/>src/app/oauth"]
    WorkspaceApi["Hono / Next APIs<br/>src/app/api + src/server/routing"]
    WorkspaceMiddleware["Security, CORS, rate limit, logging<br/>src/server/middleware"]
    WorkspaceDomains["Server and client domains<br/>organization, clients, properties, projects, agents, billing, integrations"]
    WorkspaceConvexFunctions["Convex functions<br/>read/write, auth bridge, webhooks, MCP, API keys"]
  end

  subgraph PartnersRuntime["Partners runtime internals"]
    PartnerMarketing["Marketing and docs routes<br/>app/(marketing), app/docs"]
    PartnerAuth["Partner auth<br/>app/(auth), app/api/auth"]
    PartnerPortal["Portal dashboard<br/>app/(portal)/dashboard"]
    PartnerPlatformApi["Platform APIs<br/>published-apps, verify-authorization"]
    PartnerAdminApi["Admin APIs<br/>partner-app review endpoints"]
    PartnerSandbox["Sandbox OAuth and resources<br/>app/sandbox, server/sandbox"]
    PartnerSchemas["Schemas and integration contracts<br/>lib/schemas, lib/qentrah-integration"]
  end

  subgraph DemoRuntime["Demo partner internals"]
    DemoStart["Start OAuth with PKCE"]
    DemoCallback["Callback and server-side token exchange"]
    DemoProxy["Resource API proxy routes<br/>clients, properties, projects, tasks, calendar, media, webhooks"]
    DemoCookie["Encrypted HttpOnly demo session cookie"]
  end

  subgraph MobileRuntime["Mobile runtime internals"]
    MobileScreens["Expo Router screens<br/>app/*"]
    MobileProviders["Providers<br/>auth, fonts, theme, boot state"]
    MobileStore["Zustand store slices<br/>session, property, conversation, voice, preferences"]
    MobileDecision["Decision domain<br/>listings, filters, map, compare"]
    MobileConversation["Conversation and assistant domain<br/>composer, turns, voice"]
    MobilePersistence["Persistence adapters<br/>Convex client surface, analytics, local state"]
  end

  subgraph DataServices["Data stores and external services"]
    WorkspaceConvex["Workspace Convex<br/>organizations, resources, grants, billing, webhooks, audit"]
    PartnersPostgres["Partners PostgreSQL / Prisma<br/>profiles, organizations, apps, reviews, sandbox, request logs"]
    BetterAuth["Better Auth<br/>sessions, OAuth provider, token validation"]
    UploadThing["UploadThing media"]
    OpenRouter["OpenRouter / AI SDK"]
    Sentry["Sentry, metrics, logs"]
    Mapbox["Mapbox"]
    Vercel["Vercel deployments"]
  end

  subgraph SharedPackages["Shared package layer"]
    Brand["brand-identity"]
    PlatformCore["platform-core"]
    WebFoundation["web-foundation"]
    Ui["ui, ag-ui, location-map"]
    AuthPackages["auth, auth-client, auth-sdk, authorization, partner-auth-core"]
    Contracts["domain-contracts, partner-workspace-sync"]
    Logic["workspace-logic, base-logic, market-logic, crm-logic, offers-logic, compliance-logic"]
    ConvexAdapters["convex-adapters"]
    Testing["testing"]
  end

  Visitor --> Marketing
  Marketing --> Brand
  Marketing --> Vercel

  WorkspaceUser --> Workspace
  Workspace --> WorkspacePages
  Workspace --> WorkspaceOAuth
  Workspace --> WorkspaceApi
  Workspace --> BetterAuth
  Workspace --> UploadThing
  Workspace --> OpenRouter
  Workspace --> Sentry
  Workspace --> Vercel
  WorkspacePages --> WorkspaceDomains
  WorkspaceApi --> WorkspaceMiddleware
  WorkspaceMiddleware --> WorkspaceDomains
  WorkspaceOAuth --> BetterAuth
  WorkspaceOAuth --> PartnerPlatformApi
  WorkspaceOAuth --> WorkspaceConvexFunctions
  WorkspaceDomains --> WorkspaceConvexFunctions
  WorkspaceConvexFunctions --> WorkspaceConvex

  PartnerDeveloper --> Partners
  Partners --> PartnerMarketing
  Partners --> PartnerAuth
  Partners --> PartnerPortal
  Partners --> PartnerPlatformApi
  Partners --> PartnerAdminApi
  Partners --> PartnerSandbox
  Partners --> BetterAuth
  Partners --> PartnersPostgres
  Partners --> Vercel
  PartnerPortal --> PartnerSchemas
  PartnerSchemas --> PartnersPostgres
  PartnerAuth --> PartnersPostgres
  PartnerPlatformApi --> PartnersPostgres
  PartnerAdminApi --> PartnersPostgres
  PartnerSandbox --> PartnersPostgres

  Reviewer --> Admin
  Admin --> PartnerAdminApi
  Admin --> WorkspaceApi
  Admin --> Vercel

  ExternalPartner --> Demo
  Demo --> DemoStart
  DemoStart --> WorkspaceOAuth
  WorkspaceOAuth --> DemoCallback
  DemoCallback --> DemoCookie
  DemoCookie --> DemoProxy
  DemoProxy --> WorkspaceApi
  Demo --> Vercel

  ExternalPartner --> WorkspaceOAuth
  ExternalPartner --> WorkspaceApi
  WorkspaceApi --> WorkspaceConvex
  WorkspaceConvexFunctions --> WebhookConsumer

  MobileUser --> Mobile
  Mobile --> MobileScreens
  MobileScreens --> MobileProviders
  MobileProviders --> MobileStore
  MobileProviders --> MobileDecision
  MobileProviders --> MobileConversation
  MobileDecision --> MobilePersistence
  MobileConversation --> MobilePersistence
  MobileDecision --> Mapbox
  MobileConversation --> OpenRouter
  MobilePersistence --> BetterAuth

  Partners -- "approved app projection" --> Contracts
  Contracts -- "OAuth runtime projection" --> WorkspaceOAuth
  WorkspaceOAuth -- "organization partner grant" --> WorkspaceConvex
  WorkspaceApi -- "token claims, grant, scope, resource action checks" --> BetterAuth
  WorkspaceApi -- "authorized resource reads/writes" --> WorkspaceConvex

  Brand --> Marketing
  Brand --> Workspace
  Brand --> Partners
  Brand --> Admin
  Brand --> Demo
  PlatformCore --> Workspace
  PlatformCore --> Partners
  PlatformCore --> Ui
  WebFoundation --> Partners
  Ui --> Partners
  AuthPackages --> Workspace
  AuthPackages --> Partners
  AuthPackages --> Demo
  Contracts --> Workspace
  Contracts --> Partners
  Logic --> Workspace
  Logic --> Mobile
  ConvexAdapters --> Workspace
  Testing --> Contracts
```

## Reading The Chart

- Left side starts with users and external systems.
- Middle area is the deployable app layer.
- Runtime subgraphs show the main internal route/domain paths for Workspace,
  Partners, Demo, and Mobile.
- Right side shows owned data stores and third-party services.
- Bottom package layer shows the shared code imported across apps.
- The thickest business path is:
  `Partners app draft -> Admin review -> runtime projection -> Workspace OAuth -> organization grant -> partner resource API`.

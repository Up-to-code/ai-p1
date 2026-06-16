# Qentrah

> AI-first Client Operations Platform for agencies and professional services firms

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)](https://vercel.com)
[![Built with Convex](https://img.shields.io/badge/Built_with-Convex-black)](https://convex.dev)
[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-000?logo=next.js)](https://nextjs.org)
[![License: Private](https://img.shields.io/badge/License-Private-red)](#)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Domain Model](#core-domain-model)
- [Application Flows](#application-flows)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## Overview

Qentrah unifies **Clients → Opportunities → Projects → Tasks** in a single workspace with AI-powered automation. The platform operates in two distinct modes:

```mermaid
graph LR
    A[User Login] --> B{Project Selected?}
    B -->|No| C[Global Workspace Mode]
    B -->|Yes| D[Project Mode]
    C --> E[Full Agency View]
    D --> F[Scoped Project View]
```

### Two Modes, One Workspace

| Mode | Scope | Sidebar | AI Context | Use Case |
|------|-------|---------|------------|----------|
| **Global** | All clients, projects, tasks | Full navigation | Organization-wide | Business health, forecasting |
| **Project** | Single project | Scoped navigation | Project-focused | Delivery, team coordination |

---

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Next.js Web App]
        MOB[Mobile App]
        DESKTOP[Electron Desktop]
    end

    subgraph "Auth Layer"
        WOS[WorkOS AuthKit]
        WKSP_AUTH[Workspace Auth]
        PARTNER_AUTH[Partner Auth]
    end

    subgraph "Backend Layer"
        CONVEX[Convex Functions]
        API[REST/Hono API]
        MCP[MCP Protocol]
    end

    subgraph "Data Layer"
        DB[(Convex Database)]
        STORAGE[File Storage]
    end

    subgraph "Integrations"
        DODO[DodoPayments]
        SENTRY[Sentry]
        UPLOADTHING[UploadThing]
    end

    WEB --> CONVEX
    WEB --> API
    MOB --> CONVEX
    DESKTOP --> CONVEX

    CONVEX --> WOS
    CONVEX --> DB
    CONVEX --> STORAGE

    API --> CONVEX
    MCP --> CONVEX

    CONVEX --> DODO
    CONVEX --> SENTRY
    CONVEX --> UPLOADTHING

    WOS --> WKSP_AUTH
    WOS --> PARTNER_AUTH
```

### Runtime Apps

```mermaid
graph LR
    subgraph "Qentrah Platform"
        WS[Workspace App]
        PART[Partners Portal]
        ADMIN[Admin Review]
        MKT[Marketing Site]
    end

    subgraph "External"
        DEMO[Demo Partner App]
        WOS[WorkOS]
        DODO[DodoPayments]
    end

    WS --> WOS
    WS --> DODO
    PART --> WOS
    ADMIN --> PART
    DEMO --> WS
```

| App | Package | Purpose | Deployed |
|-----|---------|---------|----------|
| [Workspace](apps/workspace) | `@qentrah/workspace` | Main product runtime — organizations, projects, tasks, billing | Vercel |
| [Marketing](apps/marketing) | `@qentrah/marketing` | Public landing page, no private data | Vercel |
| [Mobile](apps/mobile) | `@qentrah/mobile` | React Native companion app | TBD |
| Partners | `@qentrah/partners` | Developer portal for partner app lifecycle | Vercel |
| Admin Review | `@qentrah/admin-review` | Internal operator console for submissions | Vercel |
| Demo Partner App | `@qentrah/demo-partner-app` | Reference external partner product | Vercel |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | [Next.js 16](https://nextjs.org) (Turbopack) | App Router, Server Components, Turbopack builds |
| **UI** | [Tailwind CSS 4](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com), [Framer Motion](https://www.framer.com/motion/) | Utility-first styling, accessible primitives, animations |
| **Forms** | [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev) | Type-safe validation |
| **Backend** | [Convex](https://convex.dev) | Real-time database, serverless functions, reactive queries |
| **Auth** | [WorkOS AuthKit](https://workos.com/authkit) | SSO, organization management, partner API keys |
| **Payments** | [DodoPayments](https://dodopayments.com) | Per-user billing, subscriptions |
| **Monitoring** | [Sentry](https://sentry.io) | Error tracking, performance monitoring |
| **Storage** | [UploadThing](https://uploadthing.com) | File uploads, media management |
| **Runtime** | [Bun](https://bun.sh) | Fast package manager, script runner |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Desktop** | [Electron](https://www.electronjs.org) | Native desktop app wrapper |

---

## Project Structure

```
qentrah/
├── apps/
│   ├── workspace/           # Main product (Next.js + Convex)
│   │   ├── src/
│   │   │   ├── app/         # Next.js App Router
│   │   │   │   └── [locale]/
│   │   │   │       ├── (app)/       # Main app routes
│   │   │   │       │   ├── billing/
│   │   │   │       │   ├── calendar/
│   │   │   │       │   ├── clients/
│   │   │   │       │   ├── dashboard/
│   │   │   │       │   ├── projects/
│   │   │   │       │   ├── settings/
│   │   │   │       │   └── tasks/
│   │   │   │       └── auth/        # Auth routes
│   │   │   ├── components/  # React components
│   │   │   ├── domains/     # Domain-specific modules
│   │   │   └── server/      # Server-side logic
│   │   ├── convex/          # Convex backend
│   │   │   ├── billing/     # Billing functions
│   │   │   ├── schema.ts    # Database schema
│   │   │   └── *.ts         # Server functions
│   │   └── electron/        # Desktop app
│   ├── marketing/           # Marketing site (Next.js)
│   └── mobile/              # Mobile app (React Native)
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── auth/                # Auth logic
│   ├── auth-client/         # Client-side auth
│   ├── auth-sdk/            # Auth SDK
│   ├── authorization/       # Authorization rules
│   ├── base-logic/          # Base business logic
│   ├── brand-identity/      # Design tokens, brand assets
│   ├── compliance-logic/    # Compliance rules
│   ├── convex-adapters/     # Convex integration layer
│   ├── crm-logic/           # CRM business logic
│   ├── domain-contracts/    # Domain type contracts
│   ├── location-map/        # Location utilities
│   ├── market-logic/        # Marketplace logic
│   ├── offers-logic/        # Proposals/offers
│   ├── partner-auth-core/   # Partner auth core
│   ├── partner-workspace-sync/ # Partner sync
│   ├── platform-core/       # Platform core
│   ├── testing/             # Test utilities
│   ├── web-foundation/      # Web utilities
│   ├── workspace-logic/     # Workspace logic
│   └── ag-ui/               # AG UI components
├── scripts/                 # Build & utility scripts
├── docs/                    # Documentation
├── Brand/                   # Brand guidelines
├── CONTEXT.md               # Architecture context
├── PRODUCT_SPEC.md          # Product specification
├── package.json             # Root workspace config
├── vercel.json              # Vercel deployment config
└── bun.lock                 # Bun lockfile
```

---

## Core Domain Model

### Entity Relationship

```mermaid
erDiagram
    Organization ||--o{ Member : contains
    Organization ||--o{ Client : manages
    Organization ||--o{ Project : owns
    Organization ||--o{ Opportunity : tracks

    Client ||--o{ Project : commissions
    Client ||--o{ Opportunity : generates

    Project ||--o{ Task : contains
    Project ||--o{ CalendarEvent : schedules
    Project ||--o{ Asset : stores

    Task }o--|| Member : assigned_to
    CalendarEvent }o--|| Member : attended_by

    Opportunity ||--o{ RecordLink : connects
    Project ||--o{ RecordLink : connects

    Organization ||--o{ AutomationRule : defines
    Organization ||--o{ Template : customizes
```

### Core Records

| Record | Description | Key Fields |
|--------|-------------|------------|
| **Client** | Customer or prospect | name, status, industry, contacts, tags |
| **Opportunity** | Sales deal in pipeline | title, value, stage, probability, close_date |
| **Project** | Active engagement | name, budget, timeline, team, health |
| **Task** | Work item | title, status, priority, assignee, due_date |
| **CalendarEvent** | Scheduled occurrence | title, type, date, attendees |
| **Asset** | File or deliverable | name, type, project, version |

### Workspace Templates

Templates apply presets to core records:

```mermaid
graph LR
    T[Template] --> L[Labels]
    T --> S[Stages]
    T --> ST[Statuses]
    T --> V[Views]
    T --> CF[Custom Fields]
    T --> AR[Automation Recipes]

    CF --> CD[Custom Field Definition]
    CD --> CV[Custom Field Value]
```

---

## Application Flows

### Partner App Lifecycle

```mermaid
sequenceDiagram
    participant D as Developer
    participant P as Partners Portal
    participant A as Admin Review
    participant W as Workspace

    D->>P: Create App
    D->>P: Configure Redirect URIs & Scopes
    D->>P: Submit for Review
    P->>A: Submission Received
    A->>A: Review Code & Policy
    A->>P: Approve / Reject / Suspend
    P->>W: Publish Catalog State
    W->>W: Verify App in Marketplace
```

### Organization Authorization

```mermaid
sequenceDiagram
    participant U as User
    participant W as Workspace
    participant WOS as WorkOS AuthKit
    participant P as Partners

    U->>W: Connect Partner App
    W->>WOS: Authenticate User + Org
    WOS->>W: Identity Verified
    W->>P: Verify App/Client/Scopes
    P->>W: Scopes Approved
    W->>W: Store Organization Grant
    W->>W: Issue Partner API Key
```

### Partner API Request Flow

```mermaid
sequenceDiagram
    participant PP as Partner Product
    participant W as Workspace
    participant WOS as WorkOS
    participant C as Convex

    PP->>W: Send Partner API Key
    W->>WOS: Validate Key
    WOS->>W: Key Valid
    W->>C: Check keyProjection + orgGrant
    C->>W: Permissions Verified
    W->>W: Route to Resource Logic
    W->>PP: Return Data / Mutation Result
```

### Billing & Payments Flow

```mermaid
sequenceDiagram
    participant U as User
    participant W as Workspace
    participant D as DodoPayments
    participant C as Convex

    U->>W: Select Plan & Quantity
    W->>D: Create Checkout Session
    D->>U: Redirect to Checkout
    U->>D: Complete Payment
    D->>C: Webhook: Payment Success
    C->>C: Update Subscription Record
    C->>W: Unlock Features
```

### Project Mode Activation

```mermaid
graph TD
    A[User Clicks Project] --> B[Project Switcher]
    B --> C[URL Updates]
    C --> D[/workspace/org/project/id]
    D --> E[Context Provider Emits ProjectScope]
    E --> F[Components Re-query Data]
    F --> G[Sidebar Labels Update]
    G --> H[Breadcrumbs Update]
    H --> I[AI Context Scoped]
    I --> J[Project Overview Loads]

    style A fill:#4f46e5,color:#fff
    style J fill:#10b981,color:#fff
```

### Task Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Todo
    Todo --> InProgress : Start
    InProgress --> InReview : Submit
    InReview --> Todo : Request Changes
    InReview --> Done : Approved
    InProgress --> Todo : Block
    Done --> [*]

    InProgress : Working on task
    InReview : Awaiting review
    Todo : Ready to start
    Done : Completed
```

### Opportunity Pipeline

```mermaid
graph LR
    P[Prospecting] --> Q[Qualification]
    Q --> PR[Proposal]
    PR --> N[Negotiation]
    N --> W[Won]
    N --> L[Lost]

    P --> |Value: $50K| P
    Q --> |Value: $120K| Q
    PR --> |Value: $200K| PR
    N --> |Value: $80K| N
    W --> |Value: $150K| W
```

---

## Getting Started

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| [Bun](https://bun.sh) | v1.3+ | `curl -fsSL https://bun.sh/install \| bash` |
| [Node.js](https://nodejs.org) | v18+ | [Download](https://nodejs.org) |
| [Git](https://git-scm.com) | Latest | [Download](https://git-scm.com) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Up-to-code/qentrah.git
cd qentrah

# 2. Install dependencies
bun install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start development
npm run dev:ws
```

### Environment Variables

Environment variables are managed through the **Convex dashboard**:

```bash
# Open Convex dashboard
npx convex dashboard

# Required for billing
DODO_PAYMENTS_API_KEY=your_api_key
DODO_PAYMENTS_ENVIRONMENT=test_mode
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret
```

See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed billing setup.

---

## Development

### Available Scripts

```bash
# Development
npm run dev:ws              # Start workspace app + Convex
npm run dev:marketing       # Start marketing site
npm run dev:partners        # Start partners portal
npm run dev:admin           # Start admin review app

# Build
npm run build               # Build all workspaces
npm run build:workspace:desktop  # Build desktop app

# Quality
npm run test                # Run all tests
npm run typecheck           # Typecheck all packages
npm run lint                # Lint all packages

# Brand
npm run brand:assets        # Generate brand assets
npm run brand:sync          # Sync brand across packages
```

### Monorepo Structure

This project uses **npm workspaces** for monorepo management:

```mermaid
graph TB
    ROOT[Root package.json] --> APPS[apps/*]
    ROOT --> PKGS[packages/*]

    APPS --> WS[workspace]
    APPS --> MKT[marketing]
    APPS --> MOB[mobile]

    PKGS --> UI[ui]
    PKGS --> AUTH[auth]
    PKGS --> LOGIC[domain logic packages]

    WS --> UI
    WS --> AUTH
    WS --> LOGIC
```

### Package Dependency Graph

```mermaid
graph LR
    subgraph "App Layer"
        WS[workspace]
    end

    subgraph "Logic Layer"
        WLOG[workspace-logic]
        CLOG[crm-logic]
        MLOG[market-logic]
        OLOG[offers-logic]
    end

    subgraph "Foundation Layer"
        BC[base-logic]
        DC[domain-contracts]
        BI[brand-identity]
        UI[ui]
    end

    subgraph "Auth Layer"
        AUTH[auth]
        AC[auth-client]
        AS[auth-sdk]
        AZ[authorization]
    end

    subgraph "Integration Layer"
        CA[convex-adapters]
        PC[platform-core]
        PAS[partner-auth-core]
        PWS[partner-workspace-sync]
    end

    WS --> WLOG
    WS --> CLOG
    WS --> UI
    WS --> AUTH

    WLOG --> BC
    WLOG --> DC
    CLOG --> BC
    CLOG --> DC

    AUTH --> AC
    AUTH --> AS
    AUTH --> AZ

    CA --> PC
    PAS --> AUTH
    PWS --> PAS
```

---

## Deployment

### Vercel Configuration

```json
{
  "framework": "nextjs",
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "npm --workspace @qentrah/workspace run build",
  "ignoreCommand": "node scripts/vercel-ignore.mjs --workspace @qentrah/workspace"
}
```

### Deployment Flow

```mermaid
graph TD
    A[Push to main] --> B[Vercel Triggered]
    B --> C{Files Changed?}
    C -->|Only non-workspace| D[Skip Build]
    C -->|Workspace files| E[Install Dependencies]
    E --> F[Build Location Map Package]
    F --> G[Build Next.js App]
    G --> H[Type Check]
    H --> I{Types Valid?}
    I -->|No| J[Build Failed]
    I -->|Yes| K[Generate Manifest]
    K --> L[Deploy to Vercel]

    style A fill:#4f46e5,color:#fff
    style L fill:#10b981,color:#fff
    style J fill:#ef4444,color:#fff
```

### Build Optimization

The `vercel-ignore.mjs` script skips builds when only non-workspace files change:

```mermaid
graph LR
    A[Git Push] --> B[Check Changed Files]
    B --> C{Only docs/scripts?}
    C -->|Yes| D[Exit 0 = Skip]
    C -->|No| E[Exit 1 = Build]
```

---

## Documentation

### Core Documents

| Document | Purpose | Link |
|----------|---------|------|
| **CONTEXT.md** | Architecture context & domain language | [Read](CONTEXT.md) |
| **PRODUCT_SPEC.md** | Full product specification (1166 lines) | [Read](PRODUCT_SPEC.md) |
| **GETTING_STARTED.md** | Phase 1 billing setup guide | [Read](GETTING_STARTED.md) |
| **BILLING_QUICK_REFERENCE.md** | Developer cheat sheet | [Read](BILLING_QUICK_REFERENCE.md) |

### Architecture Docs

| Document | Purpose | Link |
|----------|---------|------|
| **AGENTS.md** | AI agent instructions | [Read](AGENTS.md) |
| **CLAUDE.md** | Claude AI context | [Read](CLAUDE.md) |
| **BUILDER_GUIDE.md** | Builder implementation guide | [Read](BUILDER_GUIDE.md) |
| **SEO_CHECKLIST.md** | SEO requirements | [Read](SEO_CHECKLIST.md) |

### Decision Records

Architecture decisions are tracked in `docs/decisions/`:

```
docs/
├── decisions/           # ADR (Architecture Decision Records)
├── lifecycles/          # Workflow lifecycle docs
│   └── conversation-thread-list/
└── agents/              # Agent skill documentation
```

### Package Documentation

Each package has its own README:

| Package | README |
|---------|--------|
| `packages/ui` | [packages/ui/README.md](packages/ui/README.md) |
| `packages/auth` | [packages/auth/README.md](packages/auth/README.md) |
| `packages/workspace-logic` | [packages/workspace-logic/README.md](packages/workspace-logic/README.md) |
| `packages/crm-logic` | [packages/crm-logic/README.md](packages/crm-logic/README.md) |
| `packages/convex-adapters` | [packages/convex-adapters/README.md](packages/convex-adapters/README.md) |

---

## Key Features

### AI Integration

```mermaid
graph TD
    U[User Input] --> AI{AI Router}
    AI -->|Global Mode| GB[Global Business Context]
    AI -->|Project Mode| PJ[Project Context]

    GB --> RESP[AI Response]
    PJ --> RESP

    RESP --> SUG[Suggestions]
    RESP --> INS[Insights]
    RESP --> AUTO[Automations]

    SUG --> |Approve| TASK[Create Task]
    SUG --> |Approve| EVENT[Schedule Event]
    SUG --> |Dismiss| NONE[No Action]
```

- **Global AI Chat**: Organization-wide recommendations, profitability analysis, team optimization
- **Project AI Chat**: Project-specific insights, risk detection, milestone tracking
- **AI Suggestions**: Auto-generate tasks, flag risks, suggest reassignments

### Custom Fields System

```mermaid
graph LR
    T[Template] --> CFD[Custom Field Definition]
    CFD --> K[Key]
    CFD --> L[Label]
    CFD --> TY[Type]
    CFD --> R[Required]
    CFD --> O[Options]

    TY --> TXT[Text]
    TY --> NUM[Number]
    TY --> DD[Dropdown]
    TY --> DT[Date]
    TY --> MS[Multi-select]
    TY --> RT[Rich Text]
    TY --> URL[URL]
```

### Real-Time Updates

All data is reactive through Convex subscriptions:

```mermaid
sequenceDiagram
    participant U as UI Component
    participant C as Convex Client
    participant S as Convex Server
    participant DB as Database

    U->>C: Subscribe to query
    C->>S: Register subscription
    S->>DB: Watch changes
    DB-->>S: Data changed
    S-->>C: Push update
    C-->>U: Re-render with new data
```

---

## Contributing

### Code Conventions

- **TypeScript**: Strict mode, no `any`
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes
- **State**: Convex queries/mutations + React hooks
- **Validation**: Zod schemas at API boundaries

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation only
style: code style changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

---

## License

Private & Proprietary — All rights reserved.

---

<div align="center">

**[Product Spec](PRODUCT_SPEC.md)** · **[Architecture](CONTEXT.md)** · **[Getting Started](GETTING_STARTED.md)** · **[Deployed App](https://qentrah.com)**

</div>

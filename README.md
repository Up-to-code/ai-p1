# Qentrah

> AI-first Client Operations Platform for agencies and professional services firms

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel)](https://vercel.com)
[![Built with Convex](https://img.shields.io/badge/Built_with-Convex-black)](https://convex.dev)
[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-000?logo=next.js)](https://nextjs.org)
[![License: Private](https://img.shields.io/badge/License-Private-red)](#)

---

## Overview

Qentrah unifies **Clients → Opportunities → Projects → Tasks** in a single workspace with AI-powered automation. The platform operates in two distinct modes:

| Mode | Scope | AI Context | Use Case |
|------|-------|------------|----------|
| **Global** | All clients, projects, tasks | Organization-wide | Business health, forecasting |
| **Project** | Single project | Project-focused | Delivery, team coordination |

### Key Features

- **AI-Powered Operations**: Context-aware AI chat with organization-wide and project-specific modes
- **Unified Workspace**: Clients, deals, projects, and tasks in one interface
- **Real-Time Collaboration**: Convex-powered reactive data across all users
- **Custom Workflows**: Template system with custom fields, automation rules, and pipeline stages
- **Partner Ecosystem**: Extensible platform with partner app marketplace and API

---

## Architecture

### Applications

| App | Package | Purpose | Deployed |
|-----|---------|---------|----------|
| **Workspace** | `@qentrah/workspace` | Main product — organizations, projects, tasks, billing | Vercel |
| **Marketing** | `@qentrah/marketing` | Public landing page | Vercel |
| **Partners** | `@qentrah/partners` | Developer portal for partner apps | Vercel |
| **Admin Review** | `@qentrah/admin-review` | Internal operator console | Vercel |
| **Mobile** | `@qentrah/mobile` | React Native companion app | TBD |

### System Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  Next.js Web • React Native • Electron Desktop          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Auth Layer                            │
│  WorkOS AuthKit • Organization Management • Partner API  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend Layer                          │
│  Convex Functions • REST/Hono API • MCP Protocol        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  Convex Database • File Storage • IndexedDB (client)     │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (Turbopack), React 18, TypeScript 5 |
| **UI** | Tailwind CSS 4, Radix UI, Framer Motion |
| **Forms** | React Hook Form, Zod |
| **Backend** | Convex (real-time database + serverless functions) |
| **Auth** | WorkOS AuthKit (SSO, organization management) |
| **Payments** | DodoPayments |
| **Monitoring** | Sentry |
| **Storage** | UploadThing, IndexedDB (client-side) |
| **Runtime** | Bun |
| **Desktop** | Electron |

---

## Project Structure

```
qentrah/
├── apps/
│   ├── workspace/           # Main product (Next.js + Convex)
│   ├── marketing/           # Marketing site
│   └── mobile/              # React Native app
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── auth/                # Auth logic & SDK
│   ├── authorization/       # Authorization rules
│   ├── domain-contracts/    # Domain type contracts
│   ├── workspace-logic/     # Workspace business logic
│   ├── crm-logic/           # CRM business logic
│   └── ...                  # Other domain packages
├── scripts/                 # Build & utility scripts
├── docs/                    # Documentation & ADRs
├── CONTEXT.md               # Architecture context
├── PRODUCT_SPEC.md          # Product specification
└── AGENTS.md                # AI agent instructions
```

---

## Core Domain Model

### Entity Hierarchy

```
Organization
├── Members (users with roles)
├── Spaces (organizational groupings)
├── Clients (CRM entities)
├── Projects (work containers)
│   └── Tasks (work items)
├── Deals (sales opportunities)
└── Calendar Events
```

### Key Entities

| Entity | Description |
|--------|-------------|
| **Organization** | Top-level tenant with members and spaces |
| **Space** | Organizational grouping with visibility settings |
| **Client** | Customer or prospect with pipeline stages |
| **Project** | Work container linked to spaces and clients |
| **Task** | Work item with status, priority, and assignee |
| **Deal** | Sales opportunity with value and stage |
| **CalendarEvent** | Scheduled events and meetings |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- [Node.js](https://nodejs.org) v18+
- [Git](https://git-scm.com)

### Installation

```bash
# Clone and install
git clone https://github.com/Up-to-code/qentrah.git
cd qentrah
bun install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development
npm run dev:ws
```

### Environment Variables

Configure environment variables through the Convex dashboard:

```bash
npx convex dashboard
```

Required variables:
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_ENVIRONMENT`
- `DODO_PAYMENTS_WEBHOOK_SECRET`

See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed setup.

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
```

### Monorepo

This project uses **npm workspaces** for monorepo management. The workspace app depends on shared packages for UI components, auth logic, domain contracts, and business logic.

---

## Deployment

### Vercel

The workspace app is deployed to Vercel with automatic builds on push to main. The `vercel-ignore.mjs` script skips builds when only non-workspace files change (docs, scripts, etc.).

### Configuration

```json
{
  "framework": "nextjs",
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "npm --workspace @qentrah/workspace run build",
  "ignoreCommand": "node scripts/vercel-ignore.mjs --workspace @qentrah/workspace"
}
```

---

## Documentation

### Core Documents

| Document | Purpose |
|----------|---------|
| [CONTEXT.md](CONTEXT.md) | Architecture context & domain language |
| [PRODUCT_SPEC.md](PRODUCT_SPEC.md) | Full product specification |
| [GETTING_STARTED.md](GETTING_STARTED.md) | Billing setup guide |
| [AGENTS.md](AGENTS.md) | AI agent instructions |

### Architecture Records

- **`docs/decisions/`** — Architecture Decision Records (ADRs)
- **`docs/lifecycles/`** — Workflow lifecycle documentation
- **`docs/agents/`** — Agent skill documentation

### Package Documentation

Each package includes its own README with detailed usage instructions.

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

**[Product Spec](PRODUCT_SPEC.md)** · **[Architecture](CONTEXT.md)** · **[Getting Started](GETTING_STARTED.md)**

</div>

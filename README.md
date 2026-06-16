# Qentrah

AI-first Client Operations Platform for agencies and professional services firms.

## Overview

Qentrah unifies **Clients → Opportunities → Projects → Tasks** in a single workspace with AI-powered automation. Two distinct modes share navigation but offer dramatically different contexts:

- **Global Workspace Mode**: Full agency/business view across all clients, opportunities, projects, and tasks
- **Project Mode**: Experience narrows to a single project with scoped data, sidebar, and AI context

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Backend**: Convex
- **Auth**: WorkOS AuthKit
- **Runtime**: Bun
- **Deployment**: Vercel
- **Payments**: DodoPayments
- **Language**: TypeScript

## Project Structure

This is a monorepo using npm workspaces.

### Apps

| App | Package | Description |
|-----|---------|-------------|
| `apps/workspace` | `@qentrah/workspace` | Main product runtime (deployed to Vercel) |
| `apps/marketing` | `@qentrah/marketing` | Public marketing site |
| `apps/mobile` | `@qentrah/mobile` | Mobile app |

### Packages

| Package | Description |
|---------|-------------|
| `packages/ui` | Shared UI components |
| `packages/auth` | Authentication logic |
| `packages/auth-client` | Client-side auth |
| `packages/auth-sdk` | Auth SDK |
| `packages/authorization` | Authorization logic |
| `packages/base-logic` | Base business logic |
| `packages/brand-identity` | Brand assets and design tokens |
| `packages/compliance-logic` | Compliance rules |
| `packages/convex-adapters` | Convex integration adapters |
| `packages/crm-logic` | CRM business logic |
| `packages/domain-contracts` | Domain type contracts |
| `packages/location-map` | Location mapping utilities |
| `packages/market-logic` | Marketplace logic |
| `packages/offers-logic` | Offers/proposals logic |
| `packages/partner-auth-core` | Partner auth core |
| `packages/partner-workspace-sync` | Partner-workspace sync |
| `packages/platform-core` | Platform core utilities |
| `packages/testing` | Test utilities |
| `packages/web-foundation` | Web foundation utilities |
| `packages/workspace-logic` | Workspace business logic |
| `packages/ag-ui` | AG UI components |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.3+)
- [Node.js](https://nodejs.org/) (v18+)

### Installation

```bash
# Clone the repo
git clone https://github.com/Up-to-code/qentrah.git
cd qentrah

# Install dependencies
bun install
```

### Development

```bash
# Start workspace app (main product)
npm run dev:ws

# Start marketing site
npm run dev:marketing

# Start all apps
npm run dev
```

### Build

```bash
# Build all workspaces
npm run build

# Build workspace app only
npm --workspace @qentrah/workspace run build
```

### Testing

```bash
# Run all tests
npm run test

# Typecheck all packages
npm run typecheck
```

## Environment Variables

Environment variables are managed through Convex dashboard for the workspace app. See `GETTING_STARTED.md` for billing-specific setup.

## Deployment

The workspace app is deployed to Vercel. The `vercel.json` configures:

- Install: `bun install --frozen-lockfile`
- Build: `npm --workspace @qentrah/workspace run build`
- Ignore script: `scripts/vercel-ignore.mjs` (skips builds when only non-workspace files change)

## Documentation

- `CONTEXT.md` - Architecture context and domain language
- `PRODUCT_SPEC.md` - Full product specification
- `GETTING_STARTED.md` - Phase 1 billing implementation guide
- `docs/` - Decision records and lifecycle documentation

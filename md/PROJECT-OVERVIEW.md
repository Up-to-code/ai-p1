# Qentrah — Project Overview

> **Last updated:** June 2026

---

## Executive Summary

Qentrah is a multi-tenant **Work OS / CRM platform** built for project-driven businesses (agencies, consultants, real estate, operations). It combines client management, project tracking, AI-powered workflows, and a partner integration ecosystem — all available across web, mobile, and desktop.

**Core differentiators:**
- **AI Agent System** — Built-in conversational AI with 40+ workspace tools, human-in-the-loop confirmations, and MCP protocol support
- **Partner App Platform** — Full OAuth2 provider with app registration, sandbox, webhook infrastructure, and developer SDK
- **Multi-channel** — Web (Next.js), mobile (Expo/React Native), desktop (Electron), all sharing a Convex backend

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Web) | Next.js 16 (Turbopack), React 19, Tailwind CSS, Zustand |
| Frontend (Mobile) | Expo / React Native, Zustand |
| Frontend (Desktop) | Electron wrapper |
| Backend | Convex (real-time DB + serverless functions) |
| API Layer | Hono (REST), MCP (Model Context Protocol) |
| Auth | WorkOS AuthKit (workspace), Better Auth (partners) |
| Payments | Tamara (buy-now-pay-later) |
| AI | OpenRouter (LLM orchestration), AG-UI protocol |
| Deployment | Vercel (web), EAS (mobile), Convex Cloud |
| Monitoring | Sentry |
| i18n | English, Arabic (RTL) |

---

## Applications

### 1. Workspace (`apps/workspace/`)
The main product. Next.js app serving authenticated users — dashboard, CRM, projects, tasks, calendar, billing, AI chat, and settings.

### 2. Mobile (`apps/mobile/`)
React Native / Expo companion app. Conversational AI interface with thread management, organization switching, notifications, and profile settings.

### 3. Partners (`apps/partners/`)
Developer portal for third-party integrations. App registration, OAuth sandbox, documentation, and MCP operator tools.

### 4. Marketing (`apps/marketing/`)
Public-facing marketing site with i18n (EN/AR). Landing pages, pricing, docs, legal, broker, and developer pages.

---

## Feature Inventory

### Authentication & Identity

| Feature | Description |
|---------|-------------|
| WorkOS AuthKit | Primary identity provider for workspace users |
| Better Auth | Identity provider for partner developers |
| SSO | Single sign-on with callback handling (web + mobile) |
| OAuth2 Provider | Full authorization server: authorize, consent, org selection, token exchange |
| Organization Invites | Token-based invite links + email invitations |
| API Key Auth | Organization-scoped API keys (create, rotate, revoke, validate) |
| Service Tokens | Server-to-server authentication tokens |
| Mobile Auth Gate | Auth flow gating with OAuth/SSO callback handlers |

---

### CRM — Client Management

| Feature | Description |
|---------|-------------|
| Client CRUD | Create, read, update, soft-delete clients |
| Pipeline Ordering | Drag-and-drop pipeline stage management |
| Client Form | Dynamic form with validation |
| Client Detail View | Full client profile with related records |
| PII Encryption | Client email/phone encrypted at rest |
| Custom Fields | Text, number, currency, date, select, boolean, URL fields |
| Record Links | Typed relationships between any core records |

---

### Project Management

| Feature | Description |
|---------|-------------|
| Project CRUD | Create, update, archive projects |
| Project Overview | Dashboard per project with stats |
| Project Tasks | Task list scoped to project |
| Project Files | Media/file attachments per project |
| Project Team | Team member assignment per project |
| Project Activity | Activity feed per project |
| Project Calendar | Calendar events scoped to project |
| Project Health | onTrack / atRisk / blocked status |
| Project Templates | Sales CRM, Agency/Marketing, Consulting, Operations, Real Estate, Custom |

---

### Task Management

| Feature | Description |
|---------|-------------|
| Task CRUD | Create, update, complete, soft-delete tasks |
| Task Status | todo, inProgress, waiting, done, canceled |
| Task Priority | low, normal, high, urgent |
| Task Assignment | Assign to workspace members |
| Due Dates | Date-based deadlines |
| Pipeline Ordering | Board/pipeline drag-and-drop |
| Custom Fields | Per-task custom field values |

---

### Calendar

| Feature | Description |
|---------|-------------|
| Event CRUD | Create, update, delete calendar events |
| Event Types | meeting, deadline, reminder, milestone, focusBlock |
| Recurrence | Daily, weekly, monthly with interval |
| Event Drawer | Nested modal for event details |
| Project Calendar | Events scoped to project |
| Notification Scheduling | Push notification reminders with quiet hours |

---

### Sales Pipeline — Opportunities

| Feature | Description |
|---------|-------------|
| Opportunity CRUD | Create, update, manage sales opportunities |
| Pipeline Stages | Configurable pipeline stages |
| Opportunity Detail | Full opportunity view with related records |
| Pipeline Ordering | Drag-and-drop stage management |

---

### Dashboard

| Feature | Description |
|---------|-------------|
| Dashboard View | Main landing screen with overview stats |
| AI Chat | Conversational AI interface in dashboard |
| AI Composer | Rich message composer with file attachments |
| Dashboard Stats | Business data aggregation |

---

### AI Agent System

| Feature | Description |
|---------|-------------|
| Agent Orchestrator | SSE-streaming AI chat with tool calling via OpenRouter |
| 40+ MCP Tools | Workspace tools for AI: create clients, projects, tasks, calendar events, media, billing, etc. |
| Tool Confirmations | Human-in-the-loop approval flow for high-risk actions |
| Risk Policy | Tool risk evaluation (read-only, write, destructive) |
| Tool Permissions | Per-connection tool/action permissions |
| Agent Memory | Thread-level memory: summaries, facts |
| Multi-language | Agent responses in English and Arabic |
| Thread Management | AI conversation threads with history |
| AG-UI Protocol | Agent-to-UI protocol with card renderers and orchestration |

---

### MCP — Model Context Protocol

| Feature | Description |
|---------|-------------|
| MCP Server | Full MCP implementation with tools, transports, authorization, sessions |
| Agent Link Transport | Stateless MCP endpoint using StreamableHTTP |
| Tool Catalog | 40+ tools with risk levels and approval requirements |
| Connection Management | Create, pause, revoke MCP connections |
| Connection Permissions | Per-connection resource/action permissions |
| MCP in Partners | Partner-specific MCP tools for app management |

---

### Notifications

| Feature | Description |
|---------|-------------|
| Push Notifications | Mobile push delivery via Expo |
| Scheduled Notifications | User-created reminders with daily/weekly/monthly recurrence |
| Notification Preferences | Per-user/org settings with quiet hours |
| Notification Categories | calendar, task, manual, organization |
| Device Registration | Push notification device management |
| Cron Recovery | Recover failed notification jobs every 5 minutes |

---

### Billing & Payments

| Feature | Description |
|---------|-------------|
| Subscription Management | Plan management and status tracking |
| Tamara Integration | Buy-now-pay-later payment processing |
| Credit Ledger | Track credit grants, usage, and adjustments |
| Credit Balances | Subscription + add-on credit pools |
| Credit Meters | ai_chat, agent_link_call, api_key_call, app_access |
| Payment Callbacks | Tamara success/failure/cancel callback pages |
| Webhook Processing | Payment webhook handling |

---

### Media & Assets

| Feature | Description |
|---------|-------------|
| File Upload | UploadThing integration for file uploads |
| Media Browser | Browse and manage uploaded files |
| Document Viewer | View attached documents |
| Resource Policies | Per-record file access control |
| Asset Management | Files attached to any core record |

---

### Organization & Settings

| Feature | Description |
|---------|-------------|
| Organization Profile | Name, logo, description (Convex-backed) |
| Organization Switching | Switch between organizations (web + mobile) |
| Team Management | Member list, roles, invitations |
| Custom Permissions | Granular permission management |
| Organization Settings | Full settings panel |
| Active Org Badge | Visual indicator for active organization |
| Audit Events | Organization-level audit trail |

---

### Integrations & Web Apps

| Feature | Description |
|---------|-------------|
| Integration Screen | Manage connected third-party apps |
| Web Apps Page | Visual integration browser |
| Integration Runtime | Integration lifecycle management |

---

### Partner App Platform

| Feature | Description |
|---------|-------------|
| App Registration | Register, draft, configure partner apps |
| App Lifecycle | Draft → Review → Publish → Suspend |
| Redirect URI Validation | Validate redirect URIs for OAuth |
| Scope Management | Request/manage allowed scopes |
| Review Workflow | Admin review: approve/reject/suspend |
| Catalog Publishing | Publish app to workspace-accessible catalog |
| Runtime Sync | Sync OAuth client runtime from Partners to Workspace |
| OAuth Sandbox | Test OAuth flow in sandbox environment |
| Webhook Infrastructure | Register endpoints, HMAC signing, delivery queue with retry |
| Inbound Webhooks | Receive events from partner apps |

---

### Partner SDK (`packages/auth-sdk`)

| Feature | Description |
|---------|-------------|
| OAuth2 Client | Full OAuth2 client SDK for partners |
| Next.js Handlers | Pre-built Next.js route handlers |
| Webhook Handlers | Webhook verification and processing |
| Service App Client | Server-to-server communication |
| Browser Helpers | Client-side OAuth helpers |

---

### Partner Developer Portal

| Feature | Description |
|---------|-------------|
| Developer Auth | Sign-in/sign-up for partner developers |
| App Dashboard | List, create, manage partner apps |
| App Settings | Configure app metadata, scopes, URIs |
| Account Settings | Developer account management |
| Status Page | App integration status |
| MCP Management | Partner MCP link configuration |
| Documentation | Developer docs with MDX |
| Landing Page | OAuth/PKCE/SDK showcase, 5 integration pillars |
| Pricing | Partner pricing page |
| Policies | App submission policies |
| Security | Security practices page |
| Support | Developer support page |

---

### Internationalization (i18n)

| Feature | Description |
|---------|-------------|
| Web i18n | Next.js locale routing (EN/AR) |
| Marketing i18n | Marketing site translations |
| Mobile i18n | Mobile app translations |
| RTL Support | Full Arabic/RTL layout support |
| Agent Language | AI responses in user's language |

---

### Custom Fields System

| Feature | Description |
|---------|-------------|
| Field Definitions | Template-scoped custom field definitions |
| Field Values | Typed values per record |
| Field Types | text, longText, number, currency, date, dateTime, select, multiSelect, boolean, user, url |
| Applies To | client, opportunity, project, task, calendarEvent |
| Display Settings | Form section, table/board/detail visibility, required on create |

---

### Record Links

| Feature | Description |
|---------|-------------|
| Typed Relationships | Link any core records together |
| Link Types | related, owns, dependsOn, blocks, createdFrom, attachedTo |
| Resource Types | client, opportunity, project, task, calendarEvent |

---

### Security & Compliance

| Feature | Description |
|---------|-------------|
| PII Encryption | Client email/phone encrypted at rest |
| Org Data Encryption | Organization-level JSON data encryption |
| Data Backfill | Resumable migration for encrypting legacy plaintext |
| Soft Delete | `isDeleted` + `deletedAt` on all core records |
| Audit Events | Track all mutations with actor info |
| Request Safety | Request validation middleware |
| Timing-Safe Comparison | Prevent timing attacks on token comparison |

---

### Desktop

| Feature | Description |
|---------|-------------|
| Electron App | Desktop wrapper for workspace deployment |
| Main Process | `electron/main.cjs` |
| Preload Script | `electron/preload.cjs` |

---

### Onboarding

| Feature | Description |
|---------|-------------|
| Onboarding Flow | New user onboarding wizard |
| Team Invite Form | Invite team members during onboarding |
| Workspace Templates | Pre-configured workspace templates |

---

### Usage & Credits

| Feature | Description |
|---------|-------------|
| Usage Tracking | AI chat, agent link calls, API key calls, app access |
| Credit Dashboard | Visual credit balance and usage display |

---

### Activity Feed

| Feature | Description |
|---------|-------------|
| Activity Log | Organization-level activity feed |
| Project Activity | Per-project activity feed |
| Audit Trail | Full mutation audit with actor info |

---

### Shared Packages

| Package | Purpose |
|---------|---------|
| `ag-ui` | Agent-to-UI protocol, orchestration, card renderers |
| `auth` | Core auth utilities |
| `auth-client` | Client-side auth |
| `auth-sdk` | Partner OAuth SDK |
| `authorization` | Authorization logic |
| `base-logic` | Base business logic |
| `brand-identity` | Brand identity, route paths |
| `compliance-logic` | Compliance rules |
| `convex-adapters` | Convex adapter utilities |
| `crm-logic` | CRM business logic |
| `domain-contracts` | Shared domain contracts/types |
| `location-map` | Location/map utilities |
| `market-logic` | Market business logic |
| `offers-logic` | Offers business logic |
| `partner-auth-core` | Partner auth core logic |
| `partner-workspace-sync` | Partner-to-workspace sync |
| `platform-core` | Platform core, rate limiting |
| `testing` | Test utilities |
| `ui` | Shared UI component library |
| `web-foundation` | Web foundation utilities |
| `workspace-logic` | Workspace business logic |

---

### Infrastructure & Tooling

| Feature | Description |
|---------|-------------|
| Sentry | Error tracking + performance metrics |
| Playwright | E2E testing (workspace + partners) |
| Vitest | Unit testing (24+ Convex test files) |
| Maestro | Mobile E2E testing |
| Knip | Unused code detection |
| Infisical | Secret management |
| Vercel | Web deployment |
| EAS | Mobile deployment |

---

### Workspace Marketing Pages

| Page | Description |
|------|-------------|
| Landing | Hero animation, pricing, FAQ, founder section, MCP/agents showcase |
| Broker | Real estate broker value proposition |
| Developer | Developer/partner integration value proposition |
| About | Company information |
| Contact | Contact form |
| Terms | Terms of service |
| Privacy | Privacy policy |
| Legal | Legal notice |
| Billing | Billing information |
| Docs | Documentation |

---

## Architecture Diagram (Simplified)

```
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  Workspace   │  │    Mobile    │  │   Partners   │
│  (Next.js)   │  │   (Expo)    │  │  (Next.js)   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┘                 │
                │                          │
         ┌──────▼──────┐           ┌───────▼──────┐
         │   Convex     │           │  Better Auth  │
         │  (Realtime   │           │  (Partner     │
         │   DB + Fns)  │           │   Identity)   │
         └──────┬───────┘           └──────────────┘
                │
       ┌────────┼────────┐
       │        │        │
  ┌────▼───┐ ┌─▼──────┐ ┌▼────────┐
  │  MCP   │ │ Agents │ │ Webhooks│
  │ Server │ │ (AI)   │ │         │
  └────────┘ └────────┘ └─────────┘
```

---

## Database Tables (Convex Schema)

| Table | Purpose |
|-------|---------|
| `clients` | Client records with PII encryption |
| `projects` | Project records with rollup calculations |
| `clientTasks` | Task records |
| `opportunities` | Sales pipeline records |
| `calendarEvents` | Calendar event records |
| `media` / `mediaFolders` | File assets and folder structure |
| `customFieldDefinitions` | Custom field templates |
| `customFieldValues` | Custom field data |
| `recordLinks` | Typed relationships between records |
| `organizations` / `organizationProfiles` | Organization data and profiles |
| `organizationMembers` | Member assignments |
| `organizationInvitations` | Pending invitations |
| `organizationInviteLinks` | Token-based invite links |
| `organizationAuditEvents` | Audit trail |
| `organizationCreditLedger` | Credit transaction history |
| `organizationCreditBalances` | Credit pool balances |
| `organizationApiKeys` | API key management |
| `notificationDevices` | Push notification devices |
| `notificationJobs` | Notification delivery queue |
| `notificationSchedules` | User-created reminder schedules |
| `notificationPreferences` | User/org notification settings |
| `agentThreads` / `agentMessages` / `agentRuns` / `agentSteps` | AI conversation data |
| `agentToolCalls` | AI tool call audit trail |
| `agentMemory` | Agent memory storage |
| `mcpConnections` / `mcpConnectionPermissions` | MCP connection management |
| `partnerApps` / `partnerOAuthClients` | Partner app registration |
| `partnerWebhooks` / `partnerWebhookDeliveries` | Webhook infrastructure |
| `userProfiles` | User profile data |
| `serviceTokens` | Server-to-server tokens |
| `dataSecurityBackfillJobs` | Encryption migration jobs |

---

*This document was auto-generated from the codebase. For lifecycle documentation, see `docs/lifecycles/`.*

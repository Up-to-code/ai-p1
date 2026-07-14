# Qentrah Module Map

Status: Workspace MCP and shared Auth cutover, 2026-07-13

This map records ownership and the intended seams across the Workspace, Convex,
workspace-owned MCP transport, and Eve. `CONTEXT.md` remains the source for
domain language; accepted decisions under `docs/decisions/` remain
authoritative.

## Source-of-truth index

| Concern | Authoritative source |
|---|---|
| Domain vocabulary and deepened concepts | `CONTEXT.md` |
| Module ownership and dependency direction | This document |
| Exported interfaces, routes, Convex functions, tools, and package commands | Generated `qentrah-codebase-interface-map.md` |
| Rendered shared UI and real consumers | `component-registry.json` |
| Workspace navigation and route classification | `apps/workspace/src/domains/navigation/route-catalog.ts` and `workspace-route-policy.ts` |
| Auth deployment topology, credentials, claims, scopes, HTTP behavior, and pure guards | `packages/auth` (`@qentrah/auth`) |
| Public MCP resource | `https://app.qentrah.com/api/mcp`, adapted by `apps/workspace/src/app/api/mcp/route.ts` |
| MCP tool identity, permissions, and Adapter claims | `packages/mcp-contracts/src/tool-catalog.ts` |
| MCP executable handler parity | `apps/workspace/convex/mcp/handlers/registry.ts` |
| Eve agents and commands | `apps/workspace/agent/subagents/*/agent.ts`, `subagents/*/tools/*.ts`, and `agent/tools/*.ts` |
| Convex generated callable type surface | `apps/workspace/convex/_generated/api.d.ts` |
| Package public entrypoints and commands | Each active `package.json` and source barrel |
| Coding and modularization rules | `.agents/skills/qentrah-code-authoring/CODE-AUTHORING-RULES.md` |

Run `npm run docs:codebase-map` after changing an exported interface, route,
Convex registration, MCP/Eve tool, shared UI registry entry, or package command.
CI and agents can use `npm run docs:codebase-map:check` to detect drift. The
generated inventory must not be edited by hand and does not replace domain
ownership or accepted decisions.

## System seams

| Module | Public Interface | Primary implementation | Adapters | Authorization and source of truth |
|---|---|---|---|---|
| Workspace Identity | Authenticated user, normalized Auth Context, and active Organization membership | `@qentrah/auth`; focused Better Auth composition in `apps/workspace/convex/auth` | Browser, Next.js request, Convex actor, mobile SecureStore, Eve channel | Better Auth identifies the user; server policy resolves membership |
| Resource Access | Record-aware read/write decisions, including saved-view parent scope and live Team principals | `convex/access` | Workspace queries/writes, saved views, MCP, Eve | Organization → Space → Project; always derived server-side; Team membership is evaluated live and a saved view never widens parent access |
| Platform Administration | Fail-closed cross-Organization operational access | `packages/auth/src/platform-admin.ts` | Next.js config, Convex platform access, Media visibility controls | Authenticated email must match the configured allowlist; Organization roles do not grant access |
| Domain Contracts | Runtime inputs, outputs, patch shapes, inferred types | `packages/domain-contracts` plus focused Convex validators | Workspace forms, Hono, Convex, MCP, Eve | Contracts validate shape; access Modules authorize records |
| Workspace Route Policy | Canonical routes, aliases, auth class, capability, locale | `src/domains/navigation`, `src/proxy.ts` | Next.js routes, sidebar, subdomain rewrite | Cookie classification is routing only; server Modules enforce access |
| Authorized Navigation Projection | Actor-specific domain tree, canonical route IDs, Organization/role defaults, and server-synced personal overlay | `convex/navigation` with contracts in `@qentrah/domain-contracts` | Workspace labeled rail and contextual sidebar Adapter | Resource Access filters the projection server-side; semantic IDs preserve route safety; React never receives unauthorized domains |
| Search Projection | Versioned searchable candidate representation and indexing outbox | `convex/search` with per-domain projection Adapters | Meilisearch, command palette, Search Center, future semantic Adapter | External indexes are non-authoritative; Convex reauthorizes and hydrates every candidate |
| Locale Registry | Locale, direction, font, fallback, messages, metadata | `src/i18n`, `src/lib/i18n` | Next.js layouts, OAuth, metadata, errors | Server-rendered; no DOM translation observer |
| Resource Workspace | Persistent resource shell and routed view placement | `src/components/shared/resource-workspace` | Task, Client, and future resource route layouts | Convex remains source of truth for reactive reads |
| Task Workspace | Scope, query state, commands, shared presentation | `src/domains/tasks` | Table, list, board, detail | Task access Module plus Task Mutation Module |
| MCP Execution | OAuth bearer identity, grant-filtered tool contract, scope, dispatch, audit | workspace `/api/mcp` Adapter and `src/server/protocols/mcp`; `convex/mcp`; `@qentrah/mcp-contracts` | Stateless Streamable HTTP, Convex executor, and domain operation Adapters | `@qentrah/auth` verifies the token; Convex derives live grant and record scope on every invocation |
| Eve Execution | Authenticated actor, planning, tools, presentation | `agent`, `src/domains/eve` | Eve channel and domain operation Adapters | Same resource access and lifecycle invariants as MCP |
| Shared UI | Proven cross-domain rendered behavior | `packages/our-platform-components`, `src/components/shared` | Registered consumers in `component-registry.json` | UI capability state is informative, never authoritative |
| Marketing Content | Localized public presentation and editor-friendly typed blocks with repository fallback | `apps/marketing/lib/contentful-marketing-site.ts`, `contentful-landing-page.ts`, `contentful-payload.ts`, `content.ts` | Contentful linked-entry delivery Adapter, locale layout, client presentation context, metadata, revalidation webhook | CMS inputs and references cover active Home, Pricing, Legal, Navigation, Footer, brand, SEO, and assets; canonical commercial facts, server-only credentials, and repository fallback remain code-owned |

## Domain ownership matrix

The paths below name ownership rather than prescribing identical folder shapes.
A domain should expose a small Interface and keep contracts, lifecycle rules,
access, presentation, and tests local to that behavior.

| Domain Module | Workspace owner | Convex/persistence owner | Routes and external Adapters | Verification focus |
|---|---|---|---|---|
| Activity | `src/domains/activity` | Organization audit and Inbox event reads | `/activity`, Organization aliases | canonical route, localized states, access |
| Agency Delivery | `src/domains/delivery`; cross-runtime contracts in `@qentrah/domain-contracts` | `convex/delivery`; access in `convex/access/delivery.ts` | `/crm/proposals`, `/crm/contracts`, `/delivery`, Search Projection, portal, future MCP/Eve Adapters | command-owned Proposal→Contract→Engagement handoff, live linked-Project access, approval-backed Deliverables and Change Orders, integer minor-unit economics, audit continuity |
| Auth | `@qentrah/auth`; `src/domains/auth`, `src/server/auth` runtime Adapters | focused Better Auth Modules under `convex/auth`, with `betterAuth.ts` binding | auth routes, organization creation/activation, business API, mobile SecureStore, Eve | canonical topology, credential parsing, Auth Context, scopes, guards; `organization-creation.ts` keeps non-unique display names separate from unique slugs; runtime Adapters resolve sessions and membership |
| Automations | `src/domains/automations` | `convex/automations` | `/automations` | graph invariants, persistence, execution |
| Billing | `src/domains/billing`; `@qentrah/domain-contracts/subscription-pricing` | `convex/billing` | `/billing`, signed Dodo webhook, Hono checkout, Eve hooks | canonical catalog, owner actions, status/access matrix, idempotent reconciliation, atomic credit reservations |
| Cache | `src/domains/cache` | none | Workspace hooks | invalidation without duplicate truth |
| Calendar | `src/domains/calendar`; `@qentrah/domain-contracts/calendar` | `convex/calendar/lifecycle.ts` with validators and presentation | `/calendar`, Hono, MCP, Eve adapters | tenant links, interval ordering, reminder replacement, audit parity |
| Capabilities | `src/domains/capabilities` | Organization capability reads | navigation and gated routes | truthful enabled/disabled behavior |
| Clients | `src/domains/clients`; `@qentrah/domain-contracts/clients` | `convex/clients/lifecycle.ts` with focused validators and presentation | `/clients`, Hono, MCP, Eve adapters | patch omission, PII, tenant access, audit/webhook parity |
| Convex client | `src/domains/convex` | generated/runtime bindings | provider Adapter | authentication and typed calls |
| Custom Fields | `src/domains/custom-fields` | `convex/customFields` | Task/Doc/Client Adapters | typed values and resource ownership |
| Dashboard | `src/domains/dashboard` | `convex/dashboard`, `convex/workspace` | `/ws`, project dashboards | personalized reads, honest states |
| Deals / SalesOpportunity | `src/domains/deals`; Opportunity is compatibility | `convex/deals`, `convex/opportunities` pending canonical cutover | `/deals`, compatibility routes, MCP, Eve | reconciliation, stage mapping, one write source |
| Documents | `src/domains/docs` | document schema/read/write Modules | `/docs`, MCP, Eve | drafts, revisions, media, access |
| Eve | `src/domains/eve` | durable execution pending | `/ai`, Eve channel | actor scope, retry, persistence |
| Inbox | `src/domains/inbox` | `convex/inbox` | `/inbox`; Channels remain separate | message/thread compound access |
| Integrations | `src/domains/integrations` | partner/integration records | `/integrations`, partner Adapters | credentials via backend write gateway |
| MCP | `src/domains/mcp`; workspace MCP protocol Adapter | `convex/mcp` | `/mcp` grant-management UI, `/api/mcp` OAuth resource | catalog/handler parity, bearer-only transport, dynamic scope, rate limit, audit |
| Marketing Content | `apps/marketing/lib/content.ts`, `landing-page-content.ts`, `contentful-marketing-site.ts`, `contentful-landing-page.ts`, `contentful-payload.ts` | Contentful linked page/block/card/SEO/asset delivery; repository fallback | localized Marketing layout, active Home/Pricing/Legal routes, metadata, `/api/contentful/revalidate` | locale parity, input-only model, reference resolution, known-shape presentation overlay, canonical pricing facts, cache invalidation, secret isolation, provider-failure fallback |
| Media | `src/domains/media` | `convex/media` | resource upload/browser Adapters | durable URLs, ownership, cleanup |
| Navigation | `src/domains/navigation` | none | proxy, layouts, sidebar | route-policy completeness |
| Notifications | `src/domains/notifications` | `convex/notifications` | Inbox, push, Eve | retry, audit, token removal |
| Onboarding | `src/domains/onboarding` | Organization/profile writes | onboarding routes | resumability and real effects |
| Organization | `src/domains/organization` | `convex/organizations` | settings, Team, auth organization Adapter | roles, invitations, membership |
| Pipeline | `src/domains/pipeline` | pipeline stages and sales records | Task/Deal board Adapters | order, transitions, canonical stages |
| Profile | `src/domains/profile` | `convex/userProfiles` | `/profile` | current actor only, notification settings |
| Projects | `src/domains/projects` | `convex/projects`, `projectSpaces` | Project routes, MCP, Eve | relation access, visibility, dashboards |
| Resources | `src/domains/resources` | record-specific owners | cross-resource pickers/links | no generic authorization bypass |
| Search | `src/domains/search`; search contracts in `@qentrah/domain-contracts` | `convex/search`, including private saved/recent queries, attachment security/extraction, and privacy-minimized analytics | Meilisearch worker, command palette, route-backed Search Center, Admin Search Policy, Tika/Tesseract/malware Adapters | policy-filtered projection, clean-media boundary, indexed facet fields, bounded queues, outbox idempotency, multilingual ranking, final record reauthorization |
| Saved Views | Task-facing Adapter in `src/domains/tasks`; reusable persistence contract in `convex/savedViews` | `convex/savedViews`, `savedViewGrants`; access in `convex/access/savedView*.ts` | Task workspace view menu; future domain view Adapters | live user/Team grants, parent-scope reauthorization, personal/shared/protected behavior, revision and audit; sharing never grants record access |
| Settings | `src/domains/settings` | owning domain Modules | `/settings` | route ownership and localized copy |
| Spaces | `src/domains/spaces` | `convex/spaces` | Space routes, MCP, Eve | visibility, membership, Project junction |
| Storage | `src/domains/storage` | IndexedDB only | draft/config Adapters | UI/draft data only, version ordering |
| Tasks | `src/domains/tasks`; `@qentrah/domain-contracts/tasks` | Convex lifecycle/assignments/access, `TaskQuickCreateCommand`, TaskWorkspace view state/provider, presentation | Server route pages → client view adapters, Project views, Hono, MCP, Eve | organization-visible default, explicit private participant boundary, one-write capture, URL-addressable identity, normalized assignment membership, exact ownership cursors, one reactive read source, saved-view reproducibility, rollups/reminders |
| Team | `src/domains/team` | Better Auth Team and Team membership | `/team`, Organization settings, live resource-grant principal Adapter | Better Auth roles, live membership revocation, and truthful states; never copy Team members into grants |
| Theories | `src/domains/theories` | `convex/theories` | theory UI and future agent promotion | creator privacy and explicit promotion |
| Time Tracking | `src/domains/time-tracking` | canonical TimeEntry pending | task/project UI, MCP, Eve | one active timer, persisted economics |
| Usage | `src/domains/usage` | billing/usage reads | `/usage` | scoped aggregation and formatting |
| Work OS | `src/domains/work-os` | resource owners | shared record/editor Adapters | typed links and no duplicate records |
| Workspace | `src/domains/workspace` | `convex/workspace` | `/ws`, global shell | personal command center and access |

## Dependency direction

1. Domain contracts describe shape and domain errors; they do not know React,
   Convex runtime contexts, MCP, or Eve.
2. Domain lifecycle implementations own invariants and side effects.
3. Resource access Modules derive and authorize the actor server-side.
4. Convex, Hono, MCP, and Eve are Adapters over lifecycle and access behavior.
5. Workspace hooks expose reactive reads and write commands to rendered UI.
6. Route pages compose server shells and the smallest necessary client islands.

## Documentation rule

Use `module-documentation-template.md` for a deep Module. The Interface is the
test surface. Do not add a folder, helper, class, or Adapter solely to satisfy a
naming convention. Apply the deletion test before extraction, and register only
rendered shared UI in `component-registry.json`.

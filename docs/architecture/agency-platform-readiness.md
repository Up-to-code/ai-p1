# Agency platform readiness evidence

## Cutover outcome

The Agency OS remains a modular monolith. Convex is authoritative, Hono is the authenticated/external command gateway, Meilisearch is a replaceable lexical index, and React receives server-authorized projections. The canonical lifecycle is represented by CRM, Delivery, Resource Planning, Finance, Reports, Automations, AI/MCP, and Portal modules.

## Security evidence

- Organization, Space, Project, Task, Document, Channel, saved-view, Team, Delivery, Search, Automation, Report, Finance, and Portal boundaries have focused tests.
- Direct Project membership does not expose its Space. Live Team membership is resolved on every grant evaluation.
- Search candidates are hydrated and reauthorized from Convex. Principal filters remain coarse defense in depth.
- Automation webhook/event actions execute as the stored creator after current permission and Project-scope evaluation. Sensitive transitions pause for approval.
- Portal callers authenticate with hashed, expiring bearer tokens. Convex resolves identity and Engagement capability; raw identity IDs are never trusted.
- Finance postings are balanced and immutable; corrections use reversals and closed periods reject mutation.
- Migration functions are internal callables and cannot be invoked by anonymous clients.

## Data and migration evidence

Run `migrations/prepareAgencyCutover:runBatch` internally until `done=true`, first with `dryRun=true`. It creates missing default navigation layouts, records the canonical `agency_os` rollout, and queues idempotent Search reindex jobs for every currently searchable agency resource. Search workers then drain projections/outbox events and reconciliation reports drift.

The rollout record supports `disabled`, `preview`, and `canonical`. Missing legacy records resolve to canonical so route behavior is deterministic; production operators can explicitly disable an Organization before migration if needed.

High-volume list families use Organization-leading indexes. The cutover security test pins representative Finance, Resource, Report, and Search declarations, while focused domain tests cover query behavior and cross-Organization denial.

## UX and accessibility evidence

- The labeled rail is server-synced, compact/expanded, tooltip-accessible, keyboard reachable, and uses semantic route/node IDs.
- All 15 top-level domains are in locked product order and the catalog test pins the exact Reports, Automation, AI, and Admin trees plus core Home/Space/Project trees.
- Space projects now resolve through `projectSpaces`; the sidebar no longer exposes the full Organization project list inside every Space.
- Project context exposes Overview, Tasks, Milestones, Timeline, Calendar, Documents, Discussions, Time, Expenses, Client Approvals, Budget and Margin, Team, Automations, and Settings.
- RTL uses logical CSS properties and locale-aware layout. Focus, empty, loading, and permission states remain part of owned components.

## Compliance evidence

`npm run licenses:generate` creates the dependency inventory and SPDX SBOM. `npm run licenses:check` fails on AGPL, SSPL, BUSL, unrecorded non-allowlisted licenses, or stale artifacts. Recorded exceptions remain visible in `config/dependency-license-exceptions.json`; GSAP, Sentry FSL, Sharp LGPL, Zapier SDK, and other exception boundaries still require counsel confirmation before commercial distribution.

The GitHub Platform readiness workflow runs license policy, generated documentation checks, TypeScript, and the focused agency-readiness regression suite. The complete legacy workspace suite is intentionally a separate gate: on 2026-07-15 it reported 24 failing files and 38 failing tests, primarily stale source-shape assertions for deleted screens plus unrelated authentication/UI baselines. Agency implementation files changed by this branch pass their focused regression set; the legacy failures must not be represented as platform-readiness evidence until their owning packets repair them.

## Operational gates

Before production canonicalization:

1. Run the cutover migration in dry-run and live modes.
2. Drain search reindex, extraction, and outbox queues; confirm no dead letters or drift.
3. Verify representative EN/AR navigation, keyboard flow, small-screen overlay, and portal links in a production-like environment.
4. Validate Meilisearch/Tika/Tesseract infrastructure secrets and limits outside the browser bundle.
5. Complete legal review for every recorded license exception.
6. Export and reconcile a balanced Finance period using production currency/tax settings.
7. Enable preview for selected Organizations, review audit logs and latency, then set canonical.

# TASKS.md - Saudi Real Estate Synchronization Hub

Every task below is atomic and must fit under 4 hours. If it cannot fit under 4 hours, split it. Use `docs/RULES.md` as law. Do not add CRM product features. Do not add marketplace product features. Build only the Saudi Arabia Central Real Estate Data Synchronization Hub.

## Phase 1 - Repository and Version Lock

[ ] Confirm hub boundary - Verify all hub work is scoped to `hub/` and record that `partners/` remains the separate developer integration project.

[ ] Replace old stack wording - Search hub docs for `Next.js 15+` and plain authentication references, then list which docs need later cleanup outside this task.

[ ] Create hub package manifest - Add or update `hub/package.json` with exact Next.js 16.2.4 / `next@16.2.4`, TypeScript, Convex, `@convex-dev/better-auth`, Better Auth, ShadCN dependencies, Tailwind CSS, Lucide React, and Zod.

[ ] Add script set - Add `dev`, `build`, `start`, `typecheck`, `lint`, `test`, `convex:dev`, and `convex:codegen` scripts to `hub/package.json`.

[ ] Add strict TypeScript config - Create `hub/tsconfig.json` with strict mode, path alias `@/*`, and no weak compiler settings.

[ ] Add Next.js 16 config - Create `hub/next.config.mjs` for App Router usage without unrelated domains or partner imports.

[ ] Add environment example - Create `hub/.env.example` with Convex URL variables, Better Auth URL variables, Better Auth secret, site URL, and webhook secret placeholders.

[ ] Add hub README - Create `hub/README.md` stating the exact stack, platform boundary, local commands, and the rule that the hub is not a CRM or marketplace.

[ ] Verify package availability - Run package metadata checks for `next`, `@convex-dev/better-auth`, `@convex-dev/rate-limiter`, and `@convex-dev/aggregate`.

## Phase 2 - Convex Component Setup

[ ] Install Better Auth component dependency - Add `@convex-dev/better-auth` to the hub dependency list.

[ ] Install Better Auth core dependency - Add `better-auth` to the hub dependency list.

[ ] Install Rate Limiter component dependency - Add `@convex-dev/rate-limiter` to the hub dependency list.

[ ] Install Aggregate component dependency - Add `@convex-dev/aggregate` to the hub dependency list.

[ ] Create Convex component config - Create `hub/convex/convex.config.ts` using `defineApp()` and `app.use()` for Better Auth, Rate Limiter, and Aggregate components.

[ ] Create Better Auth schema folder - Create `hub/convex/betterAuth/` for generated/local Better Auth schema files.

[ ] Create Better Auth server config - Create `hub/convex/betterAuth/auth.ts` with `createClient`, `authComponent`, adapter setup, Better Auth options, and organization plugin registration.

[ ] Add Better Auth Convex plugin - Configure the Better Auth Convex plugin using the hub `auth.config.ts`.

[ ] Add Better Auth organization plugin - Configure Better Auth organization plugin for organization membership and role handling.

[ ] Restrict organization creation hook - Add organization hook rule so only authorized platform users can create platform operator organizations.

[ ] Add member role hook - Add organization hook rule to reject forbidden role upgrades.

[ ] Create Convex auth config - Create `hub/convex/auth.config.ts` compatible with the Better Auth Convex component.

[ ] Register auth routes lazily - Create `hub/convex/http.ts` and register Better Auth routes with `authComponent.registerRoutesLazy`.

[ ] Create Next auth bridge - Create `hub/lib/auth/auth-server.ts` using the Better Auth Convex Next.js bridge.

[ ] Create client auth helper - Create `hub/lib/auth/auth-client.ts` with Better Auth client and organization client plugin.

[ ] Document Convex Component selection rule - Add a short local note that new backend utilities must check official Convex Components first.

## Phase 3 - ShadCN and Tailwind Setup

[ ] Initialize Tailwind CSS - Create `hub/app/globals.css` and Tailwind setup for the hub.

[ ] Add CSS token baseline - Add CSS variables for hub background, foreground, border, primary, destructive, warning, success, and visibility colors.

[ ] Initialize ShadCN config - Create `hub/components.json` pointing ShadCN primitives to `components/ui`.

[ ] Add ShadCN Button - Add official ShadCN Button primitive under `hub/components/ui/button.tsx`.

[ ] Add ShadCN Table - Add official ShadCN Table primitive under `hub/components/ui/table.tsx`.

[ ] Add ShadCN Dialog - Add official ShadCN Dialog primitive under `hub/components/ui/dialog.tsx`.

[ ] Add ShadCN AlertDialog - Add official ShadCN AlertDialog primitive under `hub/components/ui/alert-dialog.tsx`.

[ ] Add ShadCN Badge - Add official ShadCN Badge primitive under `hub/components/ui/badge.tsx`.

[ ] Add ShadCN Card - Add official ShadCN Card primitive under `hub/components/ui/card.tsx`.

[ ] Add ShadCN Input - Add official ShadCN Input primitive under `hub/components/ui/input.tsx`.

[ ] Add ShadCN Select - Add official ShadCN Select primitive under `hub/components/ui/select.tsx`.

[ ] Add ShadCN Form - Add official ShadCN Form primitive and Zod resolver pattern.

[ ] Add ShadCN Tabs - Add official ShadCN Tabs primitive under `hub/components/ui/tabs.tsx`.

[ ] Add ShadCN Tooltip - Add official ShadCN Tooltip primitive under `hub/components/ui/tooltip.tsx`.

[ ] Add ShadCN DropdownMenu - Add official ShadCN DropdownMenu primitive under `hub/components/ui/dropdown-menu.tsx`.

[ ] Add ShadCN Skeleton - Add official ShadCN Skeleton primitive under `hub/components/ui/skeleton.tsx`.

[ ] Add ShadCN Sheet - Add official ShadCN Sheet primitive under `hub/components/ui/sheet.tsx`.

[ ] Add Lucide icon policy file - Create `hub/lib/shadcn/icons.ts` exporting approved Lucide icons for hub navigation and actions.

## Phase 4 - Domain Structure

[ ] Create property domain folder - Create `hub/domains/property/` with `types.ts`, `schema.ts`, `validators.ts`, `constants.ts`, and `index.ts`.

[ ] Create submission domain folder - Create `hub/domains/submission/` with intake status, review status, and submission decision types.

[ ] Create visibility domain folder - Create `hub/domains/visibility/` with visibility type constants, state constants, and evaluation types.

[ ] Create synchronization domain folder - Create `hub/domains/synchronization/` with sync job statuses, event types, and retry types.

[ ] Create authorization domain folder - Create `hub/domains/authorization/` with permission and role files.

[ ] Create organization domain folder - Create `hub/domains/organization/` with organization type and membership projection types.

[ ] Create compliance domain folder - Create `hub/domains/compliance/` with compliance severity, hold, and Saudi evidence types.

[ ] Create audit domain folder - Create `hub/domains/audit/` with audit action constants and audit resource types.

[ ] Create integration domain folder - Create `hub/domains/integration/` with integration status, scope, and authorization types.

[ ] Create publisher domain folder - Create `hub/domains/publisher/` with publisher status and Saudi licensing field types.

[ ] Create security domain folder - Create `hub/domains/security/` with redaction, signature, and key status types.

## Phase 5 - Better Auth Organizations

[ ] Define organization types - Add organization type literals for platform operator, publisher/developer, integration partner, government/legal observer, and internal workspace.

[ ] Define organization roles - Add organization role literals for owner, admin, integration admin, publisher manager, publisher editor, reviewer, compliance officer, auditor, legal observer, workspace viewer, and support operator.

[ ] Define organization metadata schema - Add Zod schema for Better Auth organization metadata without using weak fields.

[ ] Add organization projection table plan - Define app-owned organization projection fields needed for indexed hub authorization.

[ ] Add membership projection plan - Define app-owned membership projection fields needed for resource access checks.

[ ] Add organization creation policy - Create pure function deciding whether a user may create each organization type.

[ ] Add member role change policy - Create pure function deciding whether a user may assign or change organization roles.

[ ] Add integration request policy - Create pure function deciding whether publisher admin can request an integration.

[ ] Add integration approval policy - Create pure function deciding whether platform admin or integration security officer can approve an integration.

[ ] Add Legal/Government visibility grant policy - Create pure function deciding whether compliance officer or platform admin can grant Legal/Government visibility.

[ ] Add publisher self-approval denial policy - Create pure function that denies approval when actor belongs to the submitting publisher organization.

## Phase 6 - Convex Schema

[ ] Add auth user projection table - Add hub profile projection table keyed by Better Auth user ID.

[ ] Add organization projection table - Add hub organization projection table keyed by Better Auth organization ID.

[ ] Add membership projection table - Add hub membership projection table keyed by user ID and organization ID.

[ ] Add publishers table - Add publisher table with Saudi licensing fields, status, and organization link.

[ ] Add connected platforms table - Add connected platform table with organization link, scopes, status, webhook settings, and rate-limit tier.

[ ] Add integration authorizations table - Add table for requested, approved, rejected, suspended, and revoked integration authorizations.

[ ] Add submissions table - Add submission table with source system, source record ID, raw payload, normalized snapshot, status, publisher, and connected platform.

[ ] Add properties table - Add canonical property table with Saudi fields, lifecycle status, and current version pointer.

[ ] Add property versions table - Add immutable property version table with snapshot, source submission, change summary, and approved actor.

[ ] Add visibility policies table - Add table for visibility policy definitions by type, organization, platform, channel, and priority.

[ ] Add visibility evaluations table - Add append-only table for computed visibility decisions.

[ ] Add connected platform visibility table - Add current per-property per-platform per-visibility-type summary table.

[ ] Add sync jobs table - Add queue table for synchronization jobs with attempts, status, next attempt, and last error.

[ ] Add distribution events table - Add outbound event table with payload, target platform, idempotency key, status, and attempts.

[ ] Add suppression events table - Add suppression table for hide/remove events sent to downstream platforms.

[ ] Add audit log table - Add append-only audit table with actor, resource, action, reason, request ID, and timestamp.

[ ] Add idempotency records table - Add idempotency table scoped by organization, platform, endpoint, and idempotency key.

[ ] Add document metadata table - Add document metadata table for sensitive evidence without storing document content in normal records.

## Phase 7 - Validation

[ ] Add property submission Zod schema - Create `hub/lib/contracts/property-submission.ts` for Saudi property submission payloads.

[ ] Add Saudi registry Zod schema - Add nested schema for RER, title deed, plan, plot, block, and National Address fields.

[ ] Add Ejar Zod schema - Add nested schema for Ejar contract ID and Ejar status.

[ ] Add Wafi Zod schema - Add nested schema for Wafi license, developer number, project ID, and off-plan status.

[ ] Add REGA Zod schema - Add nested schema for REGA license and advertising license fields.

[ ] Add visibility policy Zod schema - Create `hub/domains/visibility/schema.ts` for visibility type, state, priority, and policy condition validation.

[ ] Add sync event Zod schema - Create `hub/lib/contracts/sync-event.ts` with sync event type discriminated union.

[ ] Add webhook event Zod schema - Create `hub/lib/contracts/webhook-event.ts` with outbound webhook event discriminated union.

[ ] Add standard error Zod schema - Create `hub/lib/contracts/error.ts` with stable error shape.

[ ] Add organization form Zod schemas - Add schemas for organization creation, role assignment, and integration request forms.

[ ] Add no-null tests - Add tests that confirm contract schemas reject explicit `null` values where omitted optional fields are required.

## Phase 8 - Authorization

[ ] Add permission constants - Create `hub/domains/authorization/permissions.ts` with explicit permission constants.

[ ] Add role matrix - Create `hub/domains/authorization/roles.ts` mapping roles to permissions.

[ ] Add authorization types - Create `hub/domains/authorization/types.ts` for actor, resource, scope, and decision types.

[ ] Add can function - Create `hub/domains/authorization/can.ts` as a pure authorization decision function.

[ ] Add assert permission helper - Create `hub/domains/authorization/assertPermission.ts` for throwing permission assertions.

[ ] Add organization access evaluator - Create `hub/domains/authorization/organization-access.ts` for organization membership checks.

[ ] Add resource scope evaluator - Create `hub/domains/authorization/resource-scope.ts` for publisher, platform, workspace, and property scope checks.

[ ] Add visibility access evaluator - Create `hub/domains/authorization/visibility-access.ts` for each visibility type.

[ ] Add integration access evaluator - Create `hub/domains/authorization/integration-access.ts` for request, approve, suspend, revoke, rotate, and test actions.

[ ] Add Convex authz wrapper - Create Convex helper that loads Better Auth user, organization projection, memberships, and asserts permission.

[ ] Add authorization tests - Test every high-risk permission and denial case.

## Phase 9 - Synchronization Engine

[ ] Add inbound submission mutation - Create Convex mutation for receiving validated property submissions.

[ ] Add idempotency check - Add pure idempotency comparison and Convex record handling.

[ ] Add normalization function - Create pure Saudi property normalization from external submission payload to canonical snapshot.

[ ] Add conflict detection function - Create pure conflict detection for RER, title deed, source record, and location conflicts.

[ ] Add review queue transition - Move clean submissions to pending review and conflict submissions to conflict review.

[ ] Add approval-to-canonical mutation - Create mutation that converts approved submission into canonical property data.

[ ] Add property version creator - Create helper that writes immutable property version snapshots.

[ ] Add sync job enqueue helper - Create helper that enqueues distribution jobs after canonical version changes.

[ ] Add webhook payload builder - Create pure function that builds scoped webhook payloads.

[ ] Add webhook signer - Create security helper that signs outbound webhook payloads.

[ ] Add distribution action - Create Convex action that sends webhook payloads to connected platforms.

[ ] Add retry scheduler - Add retry timing helper for failed distribution jobs.

[ ] Add dead-letter transition - Move exhausted synchronization jobs to dead-letter state.

[ ] Add suppression event creator - Create suppression event when visibility changes from visible to hidden or suppressed.

[ ] Add synchronization audit events - Write audit events for sync enqueue, delivery, failure, retry, and dead-letter.

## Phase 10 - Visibility Engine

[ ] Add visibility type constants - Create constants for marketplace, CRM, workspace, legal/government, publisher private, partner, analytics, and suppression visibility.

[ ] Add visibility state constants - Create constants for visible, hidden, limited, suppressed, pending review, and not authorized.

[ ] Implement marketplace visibility - Create evaluator that hides sold, off-market, withdrawn, expired, rejected, suspended, and Ejar-leased rental availability.

[ ] Implement CRM visibility - Create evaluator that allows owning publisher internal state without implying marketplace availability.

[ ] Implement workspace visibility - Create evaluator scoped by workspace authorization.

[ ] Implement Legal/Government visibility - Create evaluator that permits authorized legal/government observers to read hidden records.

[ ] Implement publisher private visibility - Create evaluator for publisher-owned private data.

[ ] Implement partner visibility - Create evaluator based on integration authorization and scopes.

[ ] Implement analytics visibility - Create evaluator that returns aggregate or redacted visibility only.

[ ] Implement suppression visibility - Create evaluator that permits minimum suppression data to be sent downstream.

[ ] Implement visibility reason builder - Create pure function that returns reason codes for every visibility decision.

[ ] Implement per-platform visibility update - Create Convex mutation that stores current visibility in `connectedPlatformVisibility`.

[ ] Implement visibility evaluation history - Create helper that writes append-only `visibilityEvaluations` records.

[ ] Implement visibility recompute trigger - Recompute visibility after property version, lifecycle status, evidence, organization, platform, or policy changes.

[ ] Add visibility tests - Test every visibility type and every hard-hide input.

## Phase 11 - UI Pages

[ ] Create root layout - Create `hub/app/layout.tsx` with global CSS and provider setup.

[ ] Create auth routes - Create `hub/app/(auth)/signin/page.tsx` and required auth route handlers.

[ ] Create hub shell - Create shared shell with sidebar, topbar, content area, and organization switcher.

[ ] Create dashboard page - Create dashboard with submission counts, sync queue counts, visibility changes, failed deliveries, and compliance holds.

[ ] Create submissions inbox page - Create table for pending, conflict, needs evidence, approved, rejected, and withdrawn submissions.

[ ] Create submission review page - Create tabs for raw payload, normalized data, conflicts, evidence, compliance, visibility preview, and decision.

[ ] Create approved properties page - Create table for canonical properties with lifecycle, visibility, publisher, city, RER, title deed, Ejar, Wafi, and distribution state.

[ ] Create property detail page - Create tabs for overview, registry, pricing, visibility, synchronization, distribution, versions, documents, and audit.

[ ] Create visibility policy manager page - Create CRUD UI for visibility policies with simulation dialog.

[ ] Create synchronization monitor page - Create queue table for sync jobs, distribution events, suppression events, failures, retries, and dead letters.

[ ] Create integrations management page - Create integration table with request, approve, suspend, revoke, rotate secret, and test webhook actions.

[ ] Create organizations and permissions page - Create organization table, member table, role assignment dialog, and integration authorization panel.

[ ] Create audit log page - Create audit table with actor, organization, resource, action, reason, request ID, and timestamp filters.

[ ] Create settings page - Create settings sections for security, rate limits, visibility defaults, organization policy, and static docs cache rule.

[ ] Add loading states - Add loading state to every page table and detail panel.

[ ] Add empty states - Add empty state to every page table and detail panel.

[ ] Add error states - Add error state with request ID to every page table and detail panel.

[ ] Add permission-denied states - Add permission-denied state to every protected page and action.

## Phase 12 - Security and Caching

[ ] Add auth rate limits - Configure Rate Limiter component for sign-in, sign-up, password reset, and organization invitations.

[ ] Add API ingestion rate limits - Configure Rate Limiter component for property submissions and status updates by platform.

[ ] Add webhook test rate limits - Configure Rate Limiter component for webhook test events.

[ ] Add export rate limits - Configure Rate Limiter component for audit and data exports.

[ ] Add retry rate limits - Configure Rate Limiter component for manual sync retries.

[ ] Add API key hashing - Create helper to hash API keys and store only prefix plus hash.

[ ] Add API key rotation flow - Create mutation and UI task path for rotating API keys with raw secret shown once.

[ ] Add webhook signing helper - Create helper for HMAC signing outbound events.

[ ] Add webhook signature tests - Test signature creation and verification helper.

[ ] Add sensitive redaction helper - Create redaction helper for marketplace, CRM, workspace, legal/government, partner, analytics, and suppression payloads.

[ ] Add aggregate dashboard counters - Configure Aggregate component for dashboard counts that would otherwise scan tables.

[ ] Add queue count aggregates - Configure Aggregate component for sync queue and dead-letter counts where needed.

[ ] Add admin no-cache policy - Mark authenticated admin pages and route handlers as non-public cache.

[ ] Add static docs cache policy - Cache only static documentation routes when documentation routes are added.

[ ] Add sensitive read audit helper - Create helper to audit sensitive document, legal/government, export, and hidden-record reads.

## Phase 13 - Testing

[ ] Add Better Auth organization tests - Test organization type creation restrictions and role assignment restrictions.

[ ] Add organization projection tests - Test Better Auth organization data projection into hub authorization tables.

[ ] Add authorization tests - Test platform admin, publisher admin, publisher editor, integration admin, compliance officer, auditor, legal observer, and workspace viewer permissions.

[ ] Add integration authorization tests - Test request, approve, reject, suspend, revoke, rotate secret, and test webhook permissions.

[ ] Add Zod property validation tests - Test Saudi property submission schema accepts valid Saudi fields and rejects weak statuses.

[ ] Add no-null contract tests - Test public API schemas reject explicit `null` values.

[ ] Add visibility marketplace tests - Test sold, off-market, withdrawn, expired, rejected, suspended, and Ejar-leased cases are hidden for marketplace.

[ ] Add visibility CRM tests - Test owning publisher CRM visibility can see internal hidden lifecycle states.

[ ] Add visibility workspace tests - Test workspace visibility requires workspace authorization.

[ ] Add visibility legal/government tests - Test authorized legal/government observer can read hidden records.

[ ] Add visibility analytics tests - Test analytics payload is aggregate or redacted.

[ ] Add suppression tests - Test hidden transition enqueues suppression event.

[ ] Add sync lifecycle tests - Test submission received, normalized, reviewed, approved, versioned, distributed, and suppressed lifecycle.

[ ] Add webhook retry tests - Test failed delivery increments attempts and reaches dead-letter.

[ ] Add idempotency tests - Test same key same body returns original response and same key different body returns conflict.

[ ] Add redaction tests - Test sensitive fields are removed by visibility type.

[ ] Add audit tests - Test high-risk actions write audit records.

[ ] Add UI smoke tests - Test dashboard, submissions, submission review, properties, property detail, synchronization monitor, integrations, organizations, audit, and settings pages render.

## Phase 14 - Final Verification

[ ] Verify exact stack references - Confirm `hub/docs/TASKS.md` and `hub/docs/RULES.md` reference `Next.js 16.2.4`.

[ ] Verify Better Auth references - Confirm both files specify `@convex-dev/better-auth`.

[ ] Verify plain auth prohibition - Confirm `RULES.md` forbids plain Convex Auth.

[ ] Verify organization permissions - Confirm `RULES.md` defines organization types, roles, and integration authorization authority.

[ ] Verify visibility type coverage - Confirm `RULES.md` defines Marketplace, CRM, Workspace, Legal/Government, Publisher Private, Partner, Analytics, and Suppression visibility.

[ ] Verify hidden-state rules - Confirm sold, off-market, withdrawn, expired, rejected, and suspended are hidden for Marketplace visibility.

[ ] Verify no-null rule - Confirm `RULES.md` says explicit `null` is forbidden and optional absence must be omitted or state-based.

[ ] Verify task atomicity - Confirm every task in `TASKS.md` is a small checkbox task.

[ ] Verify ShadCN primitive rule - Confirm `RULES.md` forbids custom primitive Button, Table, Dialog, Badge, Input, Select, and DropdownMenu components.

[ ] Verify Convex Component rule - Confirm `RULES.md` requires checking official Convex Components before custom backend utilities.

[ ] Verify no CRM product scope - Confirm docs forbid CRM product features while allowing CRM visibility as a synchronization visibility type.

[ ] Verify partners untouched - Confirm no file under `partners/` was modified by the hub documentation replacement.

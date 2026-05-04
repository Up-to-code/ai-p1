# Ara Strict Mode - CONVEX-COMPONENTS.md Research Report

Current date: May 2026.

Scope: Saudi Arabia Central Real Estate Data Hub only. This report covers Convex Components and TypeScript libraries that reduce custom backend work for authentication, organizations, authorization, API key handling, validation, webhook delivery, rate limiting, background processing, synchronization, audit support, and security hardening.

This is a research report. It does not implement the hub. It does not add CRM, marketplace, lead, deal, marketing, or unrelated product scope.

## 1. Research Basis

### 1.1 Sources Checked

- Convex Components overview: https://docs.convex.dev/components/understanding
- Convex Components directory entry point: https://docs.convex.dev/components
- Convex + Better Auth docs: https://labs.convex.dev/better-auth
- Convex + Better Auth debugging and `registerRoutesLazy` guidance: https://labs.convex.dev/better-auth/debugging
- Better Auth organization plugin docs: https://better-auth.com/docs/plugins/organization
- NPM package metadata checked for official Convex packages:
  - `@convex-dev/better-auth`
  - `@convex-dev/workpool`
  - `@convex-dev/workflow`
  - `@convex-dev/rate-limiter`
  - `@convex-dev/action-cache`
  - `@convex-dev/action-retrier`
  - `@convex-dev/aggregate`
  - `@convex-dev/migrations`
  - `@convex-dev/crons`
  - `@convex-dev/r2`
  - `@convex-dev/geospatial`
  - `@convex-dev/sharded-counter`
  - `@convex-dev/eslint-plugin`
  - `convex-test`
- NPM package metadata checked for community Convex packages:
  - `@vllnt/convex-api-keys`
  - `convex-webhook-sender`
  - `@djpanda/convex-authz`
  - `convex-helpers`
- NPM package metadata checked for TypeScript security and validation libraries:
  - `zod`
  - `jose`
  - `is-ip`
  - `ipaddr.js`
  - `sanitize-html`

### 1.2 Convex Components Definition

Convex Components are backend modules with isolated functions, schema, data, and behavior. They reduce custom backend code because they can own internal tables, state machines, scheduling, counters, auth storage, or retries behind a typed API.

Rules for this hub:

- Use official Convex Components first.
- Use community Convex components only after security review.
- Keep hub domain rules outside component internals.
- Never let a component replace hub-specific authorization, visibility, Saudi compliance checks, or audit policy.
- Register components in `convex/convex.config.ts`.
- Keep component-owned schemas isolated from hub-owned domain tables.

## 2. Executive Recommendation

| Area | Recommendation | Package | Status | Hub Use |
| --- | --- | --- | --- | --- |
| Authentication | Adopt | `@convex-dev/better-auth` `0.12.2` | Official Convex Component | Required for all authentication. Plain Convex Auth is forbidden. |
| Organizations | Adopt through Better Auth plugin | `better-auth` organization plugin with `@convex-dev/better-auth` | Official Better Auth plugin through required auth stack | Required for publisher, integration partner, platform operator, observer, and workspace organizations. |
| Rate limiting | Adopt | `@convex-dev/rate-limiter` `0.3.2` | Official Convex Component | Required for auth routes, ingestion APIs, webhook tests, exports, retry actions, and sync endpoints. |
| Background work | Adopt | `@convex-dev/workpool` `0.4.6` | Official Convex Component | Required for bounded asynchronous sync, webhook fanout, document verification, and heavy submission processing. |
| Durable workflows | Adopt | `@convex-dev/workflow` `0.3.12` | Official Convex Component | Required for multi-step submission, approval, visibility recompute, distribution, and suppression lifecycles. |
| External retry | Adopt | `@convex-dev/action-retrier` `0.3.0` | Official Convex Component | Required for idempotent outbound calls, official registry checks, and webhook retry fallback. |
| Expensive action caching | Conditional | `@convex-dev/action-cache` `0.3.0` | Official Convex Component | Use only for safe, non-sensitive, bounded-TTL external checks. Do not cache authorization decisions. |
| Counters and summaries | Adopt | `@convex-dev/aggregate` `0.2.1` | Official Convex Component | Required for dashboard counts, queue counts, visibility counts, and sync status summaries. |
| Very hot counters | Conditional | `@convex-dev/sharded-counter` `0.2.0` | Official Convex Component | Use only if Aggregate is not sufficient for write-hot counters. |
| Data migrations | Adopt | `@convex-dev/migrations` `0.3.4` | Official Convex Component | Required for canonical property backfills, visibility summary backfills, and schema evolution. |
| Periodic jobs | Conditional | `@convex-dev/crons` `0.2.0` | Official Convex Component | Use when component-managed periodic jobs are preferable to built-in scheduling. |
| Large files | Conditional | `@convex-dev/r2` `0.10.1` | Official Convex Component | Use only after KSA data residency and document security review. |
| Geospatial indexing | Conditional | `@convex-dev/geospatial` `0.2.1` | Official Convex Component | Use for duplicate detection and location queries if required by approved scope. |
| Convex linting | Adopt | `@convex-dev/eslint-plugin` `2.0.0` | Official Convex tooling | Required for Convex code hygiene. |
| Convex tests | Adopt | `convex-test` `0.0.51` | Official Convex testing package | Required for Convex query, mutation, action, auth, visibility, and sync tests. |
| API key management | Evaluate, then adopt only after audit | `@vllnt/convex-api-keys` `0.2.0` | Community Convex Component | Candidate for API key create, validate, revoke, rotate, and usage tracking. Must be security-reviewed. |
| Webhook sender | Evaluate, then adopt only after audit | `convex-webhook-sender` `1.1.0` | Community Convex package | Candidate for queued webhook delivery with retries, backoff, HMAC signing, and delivery tracking. Must be security-reviewed. |
| Authorization graph | Evaluate | `@djpanda/convex-authz` `2.2.0` | Community Convex Component | Candidate for RBAC, ABAC, ReBAC lookup storage. Must remain behind pure hub authorization functions. |
| Helper utilities | Use selectively | `convex-helpers` `0.1.115` | Community/helper package from Convex ecosystem | Use only for reviewed helper patterns. Do not delegate security decisions to generic helpers. |
| Runtime validation | Adopt | `zod` `4.4.3` | TypeScript validation library | Required for every public API payload, webhook payload, form, environment variable, and integration configuration. |
| JOSE/JWT/JWE | Conditional | `jose` `6.2.3` | TypeScript crypto library | Use only when JOSE is specifically needed beyond Better Auth and HMAC webhooks. |
| IP validation | Conditional | `is-ip` `5.0.1` | TypeScript utility | Use for validating literal IPv4 and IPv6 entries. |
| CIDR parsing | Conditional | `ipaddr.js` `2.4.0` | TypeScript-compatible IP utility | Use for CIDR allowlist and blocklist evaluation if application-level IP policy is required. |
| HTML sanitization | Conditional | `sanitize-html` `2.17.3` | TypeScript-compatible sanitizer | Use only if the hub accepts rich HTML. Prefer plain text and React escaping. |

## 3. Official Convex Components

### 3.1 `@convex-dev/better-auth`

Package: `@convex-dev/better-auth`

Version checked: `0.12.2`

Package description: A Better Auth component for Convex.

Status: Official Convex Component.

Adoption decision: Required.

What it does:

- Integrates Better Auth with Convex.
- Provides a Convex Component layer for Better Auth storage and functions.
- Supports framework integration, including Next.js.
- Supports route registration through the Convex HTTP router.
- Supports Better Auth plugins when compatible with the Convex component.

How it reduces custom backend work:

- Avoids writing custom session tables.
- Avoids writing custom auth token handling.
- Avoids writing a custom Convex adapter for Better Auth.
- Avoids building organization membership storage from scratch when used with the Better Auth organization plugin.
- Gives the hub one auth foundation for platform users, publisher users, integration users, observers, and internal staff.

Hub usage:

- Use for all user authentication.
- Use Better Auth organization plugin for organization creation, membership, invitations, organization roles, and organization context.
- Keep Better Auth component schema isolated.
- Create hub profile projection tables for indexed domain lookup.
- Use hub projection tables for `userProfile`, `organizationProfile`, `organizationMembershipProjection`, `publisherOrganizationLink`, and `platformOperatorMembership` where the domain needs indexed Convex queries.
- Use `registerRoutesLazy` in `convex/http.ts` to avoid route-registration memory pressure.

Rules:

- Do not use plain Convex Auth.
- Do not use `@convex-dev/auth` for this hub.
- Do not use WorkOS AuthKit for this hub unless the mandatory stack changes.
- Do not store property, visibility, submission, sync, or approval logic inside Better Auth hooks.
- Use Better Auth organization hooks only for organization lifecycle projection and enforcement.

Security notes:

- Authentication proves identity only.
- Authentication does not approve integrations.
- Authentication does not authorize visibility access.
- Authentication does not approve submissions.
- Every Convex query, mutation, and action still needs server-side authorization checks.

### 3.2 Better Auth Organization Plugin

Package: `better-auth` organization plugin.

Status: Better Auth plugin used through the required `@convex-dev/better-auth` stack.

Adoption decision: Required.

What it does:

- Adds organization management to Better Auth.
- Supports organization membership.
- Supports organization roles.
- Supports organization invitations and organization context.

How it reduces custom backend work:

- Avoids building membership tables from zero.
- Avoids writing organization invitation flows from zero.
- Avoids writing session-to-organization context logic from zero.
- Gives one consistent organization model for platform operators, publishers, integration partners, legal observers, and internal workspaces.

Hub usage:

- Organization types in hub domain tables:
  - `platform_operator`
  - `publisher_developer`
  - `integration_partner`
  - `government_legal_observer`
  - `internal_workspace`
- Better Auth organization membership is the membership source.
- Hub projection tables map Better Auth organizations to hub organization types and domain permissions.

Rules:

- Publisher owners and admins can request integrations.
- Publisher owners and admins cannot self-authorize platform-wide distribution.
- Publisher users cannot approve their own submissions.
- Integration authorization requires platform admin or integration security officer approval.
- Legal/Government visibility requires platform admin or compliance officer approval.

### 3.3 `@convex-dev/rate-limiter`

Package: `@convex-dev/rate-limiter`

Version checked: `0.3.2`

Package description: A rate limiter component for Convex. Define and use application-layer rate limits. Type-safe, transactional, fair, safe, and configurable sharding to scale.

Status: Official Convex Component.

Adoption decision: Required.

What it does:

- Provides application-layer rate limits inside Convex.
- Supports typed configuration.
- Supports transactional enforcement.
- Supports fairness and sharding.

How it reduces custom backend work:

- Avoids custom rate limit tables.
- Avoids custom window counter logic.
- Avoids custom burst control logic.
- Avoids race-prone manual rate tracking under concurrent submissions.

Hub usage:

- Rate-limit Better Auth routes where appropriate.
- Rate-limit inbound property submission endpoints.
- Rate-limit API key validation failures.
- Rate-limit webhook test sends.
- Rate-limit outbound webhook retry triggers.
- Rate-limit export endpoints.
- Rate-limit document-read endpoints.
- Rate-limit visibility recompute actions that can be triggered manually.

Required rate limit dimensions:

- By API key ID.
- By connected platform ID.
- By organization ID.
- By user ID for admin actions.
- By source IP when available from the HTTP request path.
- By endpoint category.

Rules:

- Rate limiting is not a Web Application Firewall.
- Rate limiting does not replace IP allowlists or blocklists.
- Rate limiting does not replace authorization.
- Rate limiting must execute before heavy validation, file parsing, or external calls.
- Rate-limit failures must create security audit records without logging raw secrets or raw personal data.

### 3.4 `@convex-dev/workpool`

Package: `@convex-dev/workpool`

Version checked: `0.4.6`

Package description: A Convex component for managing async work.

Status: Official Convex Component.

Adoption decision: Required.

What it does:

- Manages asynchronous work.
- Provides a structured way to process jobs without hand-writing all worker orchestration.

How it reduces custom backend work:

- Avoids custom queue tables for simple asynchronous workloads.
- Avoids custom concurrency coordination.
- Avoids custom fanout job orchestration for many downstream platforms.
- Helps prevent heavy submission intake from blocking user-facing admin operations.

Hub usage:

- Process large inbound submissions.
- Normalize submitted property payloads.
- Run duplicate-detection jobs.
- Run document metadata extraction jobs.
- Run official-reference verification jobs when external access exists.
- Fan out approved property updates to connected platforms.
- Fan out suppression events when a property becomes hidden.
- Process retry batches without blocking admin screens.

Rules:

- Workpool jobs must be idempotent.
- Workpool jobs must reference submission IDs, property IDs, version IDs, and distribution event IDs rather than raw copied payloads when possible.
- Workpool jobs must not bypass approval rules.
- Workpool jobs must write audit records for security-sensitive state transitions.

### 3.5 `@convex-dev/workflow`

Package: `@convex-dev/workflow`

Version checked: `0.3.12`

Package description: Convex component for durably executing workflows.

Status: Official Convex Component.

Adoption decision: Required for multi-step hub lifecycles.

What it does:

- Provides durable workflow execution.
- Coordinates multi-step backend processes.

How it reduces custom backend work:

- Avoids building a custom workflow state machine for long-running sync operations.
- Avoids manually tracking every intermediate step for submission-to-distribution flows.
- Reduces the risk of partial updates when workflows span validation, approval, visibility evaluation, and webhook delivery.

Hub usage:

- Submission intake workflow:
  - Validate payload.
  - Normalize Saudi fields.
  - Deduplicate.
  - Create review submission.
  - Score compliance flags.
  - Queue approval review.
- Approval workflow:
  - Record approval.
  - Create canonical property version.
  - Recompute visibility.
  - Create distribution events.
  - Queue outbound webhooks.
  - Create audit records.
- Suppression workflow:
  - Detect sold, leased, off-market, withdrawn, expired, rejected, suspended, disputed, or manually hidden state.
  - Update visibility evaluations.
  - Create suppression events.
  - Notify connected platforms with scoped withdrawal payloads.
- Integration approval workflow:
  - Validate organization.
  - Validate callback URLs.
  - Validate requested scopes.
  - Require platform approval.
  - Issue API credentials only after approval.

Rules:

- Use workflow for durable multi-step state changes.
- Use Workpool for bounded async work items.
- Use Action Retrier for idempotent external call retries.
- Do not use workflow to hide missing domain design.

### 3.6 `@convex-dev/action-retrier`

Package: `@convex-dev/action-retrier`

Version checked: `0.3.0`

Package description: Convex component for retrying idempotent actions.

Status: Official Convex Component.

Adoption decision: Required.

What it does:

- Retries idempotent Convex actions.
- Reduces manual retry code for actions that call external systems.

How it reduces custom backend work:

- Avoids writing custom retry loops.
- Avoids hand-written exponential backoff for supported retry cases.
- Reduces duplicate outbound side effects when paired with idempotency keys.

Hub usage:

- Retry outbound webhook delivery when using official components instead of a community webhook sender.
- Retry official or partner verification calls.
- Retry downstream sync calls.
- Retry integration URL validation probes.

Rules:

- Only retry idempotent actions.
- Every retried action must have an idempotency key.
- Every retried action must have a maximum attempt count.
- Every retried action must write final failure state into a dead-letter or failed event table.
- Never retry irreversible side effects without a remote idempotency guarantee.

### 3.7 `@convex-dev/action-cache`

Package: `@convex-dev/action-cache`

Version checked: `0.3.0`

Package description: A Convex component for caching values that are expensive to compute.

Status: Official Convex Component.

Adoption decision: Conditional.

What it does:

- Caches values returned by expensive actions.

How it reduces custom backend work:

- Avoids custom cache tables.
- Avoids custom TTL logic for expensive external checks.
- Avoids repeating costly validation calls when the result is safe to reuse.

Hub usage:

- Cache non-sensitive trusted URL validation results for a short TTL.
- Cache non-sensitive official-reference lookup results when allowed by source terms.
- Cache geocoding or address normalization results only if approved and non-sensitive.

Forbidden usage:

- Do not cache authorization decisions.
- Do not cache visibility decisions as the source of truth.
- Do not cache raw personal data.
- Do not cache raw document contents.
- Do not cache API key validation outcomes after revocation-sensitive operations unless TTL is effectively immediate and revocation is checked separately.

### 3.8 `@convex-dev/aggregate`

Package: `@convex-dev/aggregate`

Version checked: `0.2.1`

Package description: Convex component to calculate counts and sums of values for efficient aggregation.

Status: Official Convex Component.

Adoption decision: Required.

What it does:

- Maintains efficient counts and sums.
- Reduces the need for scanning tables to compute dashboard and operational counters.

How it reduces custom backend work:

- Avoids custom denormalized counter tables for common aggregate cases.
- Avoids expensive live scans for admin dashboards.
- Supports reactive operational metrics without rebuilding counter logic repeatedly.

Hub usage:

- Dashboard counters:
  - Pending submissions.
  - Approved properties.
  - Hidden properties.
  - Active integrations.
  - Failed sync events.
  - Dead-letter events.
- Review queue counters:
  - Pending review.
  - Requires compliance review.
  - Requires document verification.
  - Duplicate suspected.
- Visibility counters:
  - Marketplace visible.
  - CRM visible.
  - Workspace visible.
  - Legal/Government visible.
  - Suppressed.
- Distribution counters:
  - Pending delivery.
  - Delivered.
  - Retrying.
  - Failed.

Rules:

- Use Aggregate for counts and sums.
- Store per-platform visibility summaries.
- Do not recompute per-platform feed counts during feed endpoint calls.

### 3.9 `@convex-dev/sharded-counter`

Package: `@convex-dev/sharded-counter`

Version checked: `0.2.0`

Package description: A sharded counter component for Convex.

Status: Official Convex Component.

Adoption decision: Conditional.

What it does:

- Provides sharded counters for high-write counter workloads.

How it reduces custom backend work:

- Avoids writing custom sharded counter logic.
- Avoids manually distributing counter writes across shards.

Hub usage:

- Use only if a specific counter becomes write-hot beyond the Aggregate component's intended use.
- Candidate counters:
  - API ingestion request count.
  - Webhook delivery attempt count.
  - Sync event ingestion count.

Rules:

- Prefer Aggregate first.
- Use sharded counters only for measured write-hot paths.
- Never use counters as legal audit records.

### 3.10 `@convex-dev/migrations`

Package: `@convex-dev/migrations`

Version checked: `0.3.4`

Package description: A migrations component for Convex. Define, run, and track database migrations. Run from a CLI or Convex server function.

Status: Official Convex Component.

Adoption decision: Required.

What it does:

- Defines migrations.
- Runs migrations.
- Tracks migration execution.

How it reduces custom backend work:

- Avoids custom migration bookkeeping.
- Avoids manual one-off scripts for schema evolution.
- Gives repeatable data transformation patterns.

Hub usage:

- Backfill `propertyVersions`.
- Backfill `visibilityEvaluations`.
- Backfill `platformVisibilitySummaries`.
- Backfill `organizationProfile` projection records.
- Migrate Saudi-specific fields when regulatory definitions change.
- Recompute canonical identifiers after identifier normalization changes.

Rules:

- Migrations must be reviewable.
- Migrations must be idempotent where possible.
- Migrations must write migration audit records when they affect canonical property, visibility, or compliance data.

### 3.11 `@convex-dev/crons`

Package: `@convex-dev/crons`

Version checked: `0.2.0`

Package description: Convex component for scheduling periodic jobs.

Status: Official Convex Component.

Adoption decision: Conditional.

What it does:

- Schedules periodic jobs.

How it reduces custom backend work:

- Avoids custom periodic scheduling tables.
- Gives a component-managed path for recurring backend operations.

Hub usage:

- Nightly stale submission checks.
- Periodic webhook dead-letter review reminders.
- Periodic integration health checks.
- Periodic visibility policy recompute verification.
- Periodic API key expiry checks.

Rules:

- Do not use crons for immediate submission processing.
- Do not use crons as a substitute for event-driven sync.
- Periodic jobs must be bounded and idempotent.

### 3.12 `@convex-dev/r2`

Package: `@convex-dev/r2`

Version checked: `0.10.1`

Package description: A R2 component for Convex.

Status: Official Convex Component.

Adoption decision: Conditional.

What it does:

- Integrates Convex with Cloudflare R2 object storage.

How it reduces custom backend work:

- Avoids writing custom object storage integration code for R2.
- Can help with larger files, documents, and media when Convex file storage is not the selected storage path.

Hub usage:

- Candidate only for property media, legal documents, title deed attachments, Wafi documents, and Ejar evidence files if storage policy approves R2.

Rules:

- KSA-primary data residency requirements must be reviewed before use.
- Sensitive document access must be audited.
- Documents must be scoped by organization, role, visibility type, and compliance permission.
- Do not expose direct object storage URLs without signed, short-lived access controls.

### 3.13 `@convex-dev/geospatial`

Package: `@convex-dev/geospatial`

Version checked: `0.2.1`

Package description: A geospatial index for Convex.

Status: Official Convex Component.

Adoption decision: Conditional.

What it does:

- Provides geospatial indexing for Convex.

How it reduces custom backend work:

- Avoids custom geospatial indexing tables.
- Helps support location-based duplicate detection and proximity queries.

Hub usage:

- Detect duplicate property submissions near the same National Address coordinates.
- Support compliance review of location mismatch flags.
- Support platform-scoped property feed extraction by geographic bounds if required.

Rules:

- Do not use geospatial search to add marketplace discovery scope.
- Use only for hub synchronization, validation, duplicate detection, and platform-scoped distribution.

### 3.14 `@convex-dev/eslint-plugin`

Package: `@convex-dev/eslint-plugin`

Version checked: `2.0.0`

Package description: ESLint plugin for Convex to prevent common issues and enforce best practices for files in the `convex/` directory.

Status: Official Convex tooling.

Adoption decision: Required.

What it does:

- Adds lint rules for Convex code.
- Helps prevent common Convex mistakes.

How it reduces custom backend work:

- Catches backend code problems before runtime.
- Reduces manual code review burden for common Convex pitfalls.

Hub usage:

- Apply to every file in `hub/convex`.
- Enforce in CI.
- Treat lint failures in `convex/` as blocking.

### 3.15 `convex-test`

Package: `convex-test`

Version checked: `0.0.51`

Package description: A JS mock of the Convex backend for testing your Convex functions.

Status: Official Convex testing package.

Adoption decision: Required.

What it does:

- Provides a test harness for Convex functions.

How it reduces custom backend work:

- Avoids writing custom Convex mocks.
- Enables unit and integration tests around Convex functions.

Hub usage:

- Test authorization functions through Convex mutations and queries.
- Test submission intake.
- Test approval-to-canonical transitions.
- Test visibility recompute.
- Test suppression event creation.
- Test rate-limit enforcement wrappers.
- Test audit record creation.

## 4. Community Convex Components and Packages

Community packages can reduce custom work, but they are not automatically approved for a security-sensitive hub. Each package must pass code review, maintenance review, license review, dependency review, and threat-model review.

### 4.1 `@vllnt/convex-api-keys`

Package: `@vllnt/convex-api-keys`

Version checked: `0.2.0`

Package description: Convex component for secure API key management - create, validate, revoke, rotate, and track usage.

Status: Community Convex Component.

Adoption decision: Evaluate first. Adopt only after audit.

What it does:

- Manages API key creation.
- Supports validation.
- Supports revocation.
- Supports rotation.
- Supports usage tracking.

How it reduces custom backend work:

- May avoid writing API key storage tables from zero.
- May avoid writing key validation logic from zero.
- May avoid writing rotation and revocation workflows from zero.
- May avoid writing usage tracking from zero.

Hub usage if approved:

- Publisher API keys.
- Integration partner API keys.
- Sandbox API keys.
- Production API keys.
- Scoped ingestion keys.
- Scoped read/feed keys.
- Scoped webhook test keys.

Mandatory security requirements before adoption:

- Raw API keys must be shown once.
- Raw API keys must never be stored.
- Stored secrets must be hashes, not reversible plaintext.
- Key lookup must use a non-secret prefix or key ID.
- Full secret validation must use a server-side hash comparison.
- Key status must support active, disabled, revoked, expired, and rotated states.
- Key records must be scoped to organization and connected platform.
- Key scopes must be explicit.
- Last-used metadata must not expose raw key material.
- Revocation must take effect immediately.
- Rotation must create a new key and invalidate or phase out the old key according to explicit policy.
- All key create, reveal, validate failure, revoke, and rotate actions must be audited.

Verdict:

- Strong candidate because API key creation, validation, revocation, rotation, and usage tracking are directly required.
- Not accepted blindly because API key management is a core security boundary.

### 4.2 `convex-webhook-sender`

Package: `convex-webhook-sender`

Version checked: `1.1.0`

Package description: Managed webhook delivery system for Convex - queue outbound webhooks with retries, exponential backoff, HMAC signing, and delivery tracking.

Status: Community Convex package.

Adoption decision: Evaluate first. Adopt only after audit.

What it does:

- Queues outbound webhooks.
- Retries failed webhook deliveries.
- Supports exponential backoff.
- Supports HMAC signing.
- Tracks delivery state.

How it reduces custom backend work:

- May avoid custom webhook queue tables.
- May avoid custom retry and backoff code.
- May avoid custom HMAC signing implementation.
- May avoid custom delivery state tracking.

Hub usage if approved:

- Send `property.approved` events.
- Send `property.updated` events.
- Send `property.visibility.changed` events.
- Send `property.suppressed` events.
- Send `submission.rejected` events where partner notification is allowed.
- Send `integration.health_check` test events.

Mandatory security requirements before adoption:

- HMAC signature algorithm must be explicit.
- Signature header names must be fixed.
- Timestamp header must be included.
- Replay window must be enforceable by receivers.
- Delivery payload must be redacted by visibility scope before queueing.
- Delivery logs must not store raw secrets.
- Retry schedule must be bounded.
- Dead-letter state must be queryable by admins.
- Idempotency key must be included per outbound event.
- Webhook URL validation must happen before any delivery.

Fallback if not adopted:

- Use `@convex-dev/workflow` for delivery lifecycle.
- Use `@convex-dev/workpool` for fanout.
- Use `@convex-dev/action-retrier` for idempotent delivery retry.
- Implement minimal HMAC signing in a pure security module.

Verdict:

- Strong candidate because webhook delivery is central to synchronization.
- Must be audited because outbound webhook delivery can leak authoritative property data if redaction or URL validation is wrong.

### 4.3 `@djpanda/convex-authz`

Package: `@djpanda/convex-authz`

Version checked: `2.2.0`

Package description: A comprehensive RBAC/ABAC/ReBAC authorization component for Convex with O(1) indexed lookups, inspired by Google Zanzibar.

Status: Community Convex Component.

Adoption decision: Evaluate.

What it does:

- Provides authorization primitives.
- Supports RBAC.
- Supports ABAC.
- Supports ReBAC.
- Provides indexed permission lookups.

How it reduces custom backend work:

- May avoid building all relationship authorization storage from zero.
- May simplify permission lookup for organization membership, workspace membership, and resource relationships.
- May reduce custom join and graph traversal code.

Hub usage if approved:

- Organization-level permission lookup.
- Workspace-level permission lookup.
- Connected platform access relationships.
- Legal observer access relationships.
- Publisher ownership relationships.

Rules if adopted:

- Keep `domains/authorization/can.ts` as the public hub authorization entry point.
- Keep `domains/authorization/assertPermission.ts` as the server-side enforcement entry point.
- Keep `domains/authorization/visibility-access.ts` as the visibility-scope evaluator.
- Do not call `convex-authz` directly from UI components.
- Do not encode Saudi visibility logic only as generic relationships.
- Keep domain-specific deny rules in pure hub functions.

Verdict:

- Candidate for permission graph storage.
- Not enough by itself because this hub needs Saudi-specific visibility, compliance, ownership, and submission approval rules.

### 4.4 `convex-helpers`

Package: `convex-helpers`

Version checked: `0.1.115`

Package description: A collection of useful code to complement the official convex package.

Status: Community/helper package from the Convex ecosystem.

Adoption decision: Use selectively.

What it does:

- Provides helper utilities for common Convex patterns.

How it reduces custom backend work:

- Can reduce repeated boilerplate in Convex functions.
- Can help with common query and mutation patterns.

Rules:

- Do not use helper utilities to hide authorization.
- Do not use helper utilities to bypass explicit validators.
- Do not use helper utilities for security-sensitive logic unless reviewed.
- Prefer explicit code for permissions, visibility, redaction, and idempotency.

## 5. TypeScript Libraries for Security, Validation, and Payload Handling

### 5.1 `zod`

Package: `zod`

Version checked: `4.4.3`

Package description: TypeScript-first schema declaration and validation library with static type inference.

Adoption decision: Required.

What it does:

- Defines runtime schemas.
- Infers TypeScript types.
- Validates external payloads.
- Supports strict object validation.

How it reduces custom backend work:

- Avoids hand-written payload validation.
- Avoids weak string status validation.
- Avoids duplicated form and API schemas when shared carefully.
- Creates one source for external API contracts.

Hub usage:

- Public ingestion API payloads.
- Submission payloads.
- Property change payloads.
- Visibility policy payloads.
- Webhook event payloads.
- Integration registration forms.
- Trusted URL configuration.
- API key scope requests.
- Better Auth profile projection inputs.
- Admin forms.
- Environment variable parsing.

Rules:

- Every public API schema must use Zod.
- Every form must use a Zod resolver.
- Every status must be a Zod enum or discriminated union.
- Use strict object schemas for external payloads.
- Reject unknown keys in public ingestion payloads unless an explicit extension object is defined.
- Never recommend `null`.
- Use omitted optional fields or explicit state literals.

### 5.2 `jose`

Package: `jose`

Version checked: `6.2.3`

Package description: JWA, JWS, JWE, JWT, JWK, JWKS for Node.js, Browser, Cloudflare Workers, Deno, Bun, and other Web-interoperable runtimes.

Adoption decision: Conditional.

What it does:

- Implements JOSE standards.
- Supports JWT signing and verification.
- Supports JWS, JWE, JWK, and JWKS operations.

How it reduces custom backend work:

- Avoids writing JWT or JWS code manually when JOSE is required.
- Avoids custom JWK parsing and verification logic.

Hub usage:

- Use only if a connected platform requires JOSE/JWT/JWS-based authentication.
- Use only if HMAC webhook signatures are insufficient for a specific approved integration.
- Use only if the integration contract explicitly requires JWT/JWKS.

Rules:

- Do not use `jose` to replace Better Auth.
- Do not use JWTs for API keys.
- Do not use JOSE where simple HMAC webhook signing is the correct contract.

### 5.3 Web Crypto or Node Crypto

Package: built-in runtime cryptography.

Adoption decision: Required for secret generation and hashing where available in the runtime.

What it does:

- Generates cryptographically secure random values.
- Computes HMAC digests.
- Supports constant-time comparison in Node where the API is available.

Hub usage:

- Generate API key raw secrets.
- Generate webhook signing secrets.
- Hash API keys with server-side pepper.
- Sign outbound webhook payloads.
- Verify inbound webhook signatures if inbound platform callbacks are approved.

Rules:

- Use cryptographically secure randomness only.
- Do not use `Math.random`.
- Do not invent a hashing algorithm.
- Use HMAC-SHA-256 with a server-side pepper for high-entropy API keys unless an approved component provides equivalent or stronger behavior.
- Use constant-time comparison for secret verification where supported.

### 5.4 `is-ip`

Package: `is-ip`

Version checked: `5.0.1`

Package description: Check if a string is an IP address.

Adoption decision: Conditional.

What it does:

- Validates whether a string is an IPv4 or IPv6 address.

How it reduces custom backend work:

- Avoids hand-written IP address parsing.

Hub usage:

- Validate administrator-entered IP allowlist entries.
- Validate administrator-entered IP blocklist entries.
- Validate parsed DNS results from trusted URL checks.

Rules:

- Use for literal IP validation only.
- Use a CIDR-capable library for CIDR matching.
- Do not use string prefix matching for IP ranges.

### 5.5 `ipaddr.js`

Package: `ipaddr.js`

Version checked: `2.4.0`

Package description: A library for manipulating IPv4 and IPv6 addresses in JavaScript.

Adoption decision: Conditional.

What it does:

- Parses IPv4 and IPv6 addresses.
- Supports address manipulation.
- Can support CIDR range matching patterns.

How it reduces custom backend work:

- Avoids writing custom CIDR parsing.
- Avoids unsafe string matching for IP allowlists and blocklists.

Hub usage:

- Application-level IP allowlists for approved integration endpoints.
- Application-level IP blocklists for abusive source addresses.
- Private, loopback, link-local, multicast, and reserved range checks during trusted URL validation.

Rules:

- Prefer edge/WAF IP enforcement for broad IP blocking.
- Use application-level IP checks for per-integration policy.
- Never trust `X-Forwarded-For` unless the deployment path is known and the forwarding proxy is trusted.

### 5.6 `sanitize-html`

Package: `sanitize-html`

Version checked: `2.17.3`

Package description: Clean up user-submitted HTML, preserving allowlisted elements and allowlisted attributes on a per-element basis.

Adoption decision: Conditional.

What it does:

- Sanitizes submitted HTML with allowlists.

How it reduces custom backend work:

- Avoids writing an HTML sanitizer manually.

Hub usage:

- Use only if the hub accepts rich text HTML from external systems.
- Prefer rejecting HTML and accepting plain text fields.

Rules:

- React escaping is the default protection for rendered text.
- Do not use `dangerouslySetInnerHTML` for submitted property descriptions.
- If rich HTML is approved, sanitize on ingestion and again before rendering if needed.
- Validate allowed tags and attributes narrowly.
- Disallow scripts, event handlers, inline JavaScript URLs, and unknown protocols.

## 6. API Key Management Recommendation

### 6.1 Required Position

The hub must support API keys for connected platforms and external systems. API keys are credentials. Treat them as secrets.

The hub must not store raw API keys.

### 6.2 Hashing vs Encryption

Hash API keys when the hub only needs to verify a presented key.

Encrypt secrets only when the hub must retrieve the original secret later. API keys do not require retrieval after creation. Therefore API keys must be hashed, not encrypted.

Outbound webhook signing secrets are different. If the hub signs outbound payloads using a per-platform secret, the hub must have access to signing material. Options:

- Generate the webhook secret once, display it once to the integration owner, and store an encrypted copy only if the hub must sign future outgoing webhooks with that exact secret.
- Store signing material through an approved secret-management method if available.
- If no approved secret storage exists, use a hub-held signing key strategy that does not expose raw secrets in logs or UI and is reviewed before production.

### 6.3 API Key Generation Rules

Required algorithm:

- Generate at least 256 bits of random secret material.
- Use Web Crypto or Node Crypto.
- Encode with a safe alphabet such as base64url.
- Add a non-secret environment and type prefix for routing and support.
- Display the raw key exactly once.
- Immediately hash the secret.
- Store only prefix, hash, metadata, and status.

Example key shape:

- `zreh_live_pk_<publicPrefix>_<secret>`
- `zreh_test_pk_<publicPrefix>_<secret>`

This example is a naming recommendation only. The security property is the random secret and server-side hash, not the prefix.

### 6.4 API Key Storage Fields

Required table fields:

- `apiKeyId`
- `organizationId`
- `connectedPlatformId`
- `environment`: `sandbox` or `production`
- `keyPrefix`
- `keyHash`
- `hashAlgorithm`
- `pepperVersion`
- `displayName`
- `scopes`
- `allowedIpCidrs`
- `allowedOrigins`
- `status`: `active`, `disabled`, `revoked`, `expired`, or `rotated`
- `createdByUserId`
- `createdAt`
- `expiresAt`
- `lastUsedAt`
- `lastUsedFromIp`
- `lastUsedUserAgentHash`
- `revokedAt`
- `revokedByUserId`
- `revocationReason`
- `rotatedFromApiKeyId`
- `rotatedToApiKeyId`

Rules:

- No raw key field.
- No decrypted key field.
- No secret in audit logs.
- No secret in error messages.
- No secret in client-visible Convex query results.

### 6.5 API Key Verification Flow

Required flow:

1. Parse the `Authorization` header.
2. Reject missing, malformed, duplicated, or unsupported auth schemes.
3. Extract non-secret key prefix.
4. Find the candidate key record by prefix.
5. Reject if no candidate exists.
6. Rate-limit failed attempts by IP, prefix, and endpoint category.
7. Hash the presented raw key with the configured algorithm and pepper.
8. Compare using constant-time comparison where supported.
9. Reject inactive, disabled, revoked, expired, or rotated keys.
10. Validate organization, platform, environment, endpoint scope, IP policy, and origin policy.
11. Update usage metadata without storing raw values.
12. Continue to Zod payload validation.
13. Continue to domain authorization.

### 6.6 API Key Component Decision

Use `@vllnt/convex-api-keys` only if it satisfies the above requirements after review.

If it does not satisfy the above requirements, implement a small hub-owned API key module using:

- Convex tables for metadata.
- Web Crypto or Node Crypto for secret generation and hashing.
- `@convex-dev/rate-limiter` for abuse control.
- `@convex-dev/aggregate` for usage summaries.
- Hub audit logging for all sensitive actions.

## 7. Trusted URLs and Allowed Origins

### 7.1 Required Position

Every integration callback URL, webhook URL, allowed origin, and partner API base URL must be treated as untrusted until verified.

No connected platform receives production credentials until its URLs and origins are approved.

### 7.2 URL Validation Rules

Required validation:

- Parse with the runtime `URL` constructor.
- Require `https:` for production.
- Reject `http:` in production.
- Reject missing host.
- Reject userinfo in URLs.
- Reject fragments.
- Reject unsupported ports unless explicitly approved.
- Normalize host casing.
- Normalize path.
- Store both submitted URL and normalized URL.
- Reject localhost hostnames in production.
- Reject loopback IP addresses.
- Reject private IP addresses.
- Reject link-local addresses.
- Reject multicast addresses.
- Reject reserved addresses.
- Reject cloud metadata service addresses.
- Reject punycode or internationalized domains until explicitly reviewed.
- Reject URLs whose DNS resolution changes to a private or blocked range.
- Re-check destination IP after redirects.
- Reject redirects to unapproved hosts.
- Apply short timeouts.
- Limit response size for validation probes.

### 7.3 Allowed Origin Rules

Required validation:

- Origin must include scheme and host.
- Origin must not include path.
- Origin must not include query.
- Origin must not include fragment.
- Production origins must use HTTPS.
- Wildcard origins are forbidden for production.
- `localhost` origins are allowed only for sandbox when explicitly marked.
- Each allowed origin must be tied to one organization, one platform, and one environment.

### 7.4 Integration Approval Flow

Required flow:

1. Publisher admin or integration partner submits integration request.
2. Hub validates organization membership through Better Auth organization context.
3. Hub validates requested scopes with Zod.
4. Hub validates URLs and origins.
5. Hub records URL validation results.
6. Hub applies rate limits to test actions.
7. Hub sends webhook challenge only to validated candidate URL.
8. Integration security officer or platform admin reviews.
9. Production API keys are generated only after approval.
10. Distribution is disabled until visibility and sync scopes are approved.

## 8. Webhook Handling Recommendation

### 8.1 Outbound Webhook Requirements

Outbound webhooks must support:

- Queueing.
- HMAC signing.
- Timestamp header.
- Idempotency key.
- Delivery attempt tracking.
- Exponential backoff.
- Maximum attempt count.
- Dead-letter state.
- Manual retry with permission check.
- Payload redaction by visibility scope.
- Endpoint URL validation before delivery.
- Audit records for sensitive events.

### 8.2 Candidate Component

Candidate package: `convex-webhook-sender`

Use if audit confirms:

- HMAC signing behavior is correct.
- Retry behavior is bounded.
- Delivery logs are safe.
- Payloads can be redacted before queueing.
- Dead-letter state can be inspected.
- Delivery status can be linked to hub distribution events.

### 8.3 Official-Component Fallback

If the community package is not approved, implement webhook delivery with:

- `@convex-dev/workflow` for lifecycle.
- `@convex-dev/workpool` for fanout.
- `@convex-dev/action-retrier` for idempotent external POST retries.
- Web Crypto or Node Crypto for HMAC signing.
- Hub-owned `distributionEvents` and `webhookDeliveryAttempts` tables.

### 8.4 Webhook Signature Contract

Recommended outbound headers:

- `X-Hub-Event-Id`
- `X-Hub-Event-Type`
- `X-Hub-Delivery-Id`
- `X-Hub-Idempotency-Key`
- `X-Hub-Timestamp`
- `X-Hub-Signature-256`
- `X-Hub-Platform-Id`
- `User-Agent`

Signature input:

- Timestamp.
- HTTP method.
- Request path.
- Raw body bytes.

Rules:

- Receiver must reject old timestamps.
- Receiver must reject replayed idempotency keys.
- Receiver must verify HMAC using the platform webhook secret.
- Hub must never send full internal records to platforms.
- Hub must send scoped payloads only.

## 9. Rate Limiting and IP Blocking

### 9.1 Required Components and Libraries

Use:

- `@convex-dev/rate-limiter` for application-layer rate limits.
- `is-ip` for literal IP validation.
- `ipaddr.js` for CIDR parsing and range evaluation if application-level IP CIDR policy is required.

### 9.2 Rate-Limited Operations

Required:

- Auth sign-in attempts.
- Auth sign-up attempts if enabled.
- Password reset or OTP flows if enabled.
- API key validation failures.
- Submission ingestion.
- Property update ingestion.
- Webhook validation challenge.
- Manual webhook retry.
- Export generation.
- Sensitive document reads.
- Visibility recompute.
- Integration test calls.

### 9.3 IP Blocking Position

Best practice:

- Use edge/WAF controls for broad IP blocking and DDoS mitigation.
- Use application-level IP allowlists and blocklists for per-integration policy.

Hub application-level rules:

- Store CIDR allowlists per API key or connected platform when required.
- Store CIDR blocklists for security response.
- Evaluate IP policy before payload parsing.
- Do not trust forwarded IP headers unless the deployment proxy chain is known.
- Audit blocked requests without storing raw personal data beyond approved security metadata.

### 9.4 Abuse Response

Required actions:

- Increment failed API key validation counters.
- Apply escalating rate limits.
- Disable keys under severe abuse only through explicit security workflow or automated rule approved in policy.
- Notify platform admin or integration security officer through internal admin UI.
- Keep audit record with request category, source IP hash or approved IP metadata, key prefix, organization ID, and endpoint category.

## 10. XSS, SQL Injection, and Request Validation

### 10.1 XSS

Rules:

- Accept plain text by default.
- React escaping must remain active.
- Do not use `dangerouslySetInnerHTML` for external property data.
- Do not render submitted HTML unless the field is explicitly approved as rich HTML.
- If rich HTML is approved, use `sanitize-html` with a strict allowlist.
- Validate URL protocols.
- Reject `javascript:` URLs.
- Reject event handler attributes.
- Use a Content Security Policy in Next.js configuration.
- Redact sensitive values before sending client-visible query results.

### 10.2 SQL Injection

Convex is not SQL. The hub does not need SQL query string construction for Convex.

Remaining injection risks:

- Sending hub data to external SQL-backed partner systems.
- Building external query strings for third-party APIs.
- Logging attacker-controlled strings into systems that later parse them.
- Rendering attacker-controlled strings into admin UI.

Rules:

- Use Zod before any external call.
- Use parameterized APIs for any external SQL-backed system.
- Never concatenate attacker-controlled strings into external query languages.
- Escape values according to the target system.
- Keep raw payloads out of logs unless explicitly stored in restricted audit evidence with redaction.

### 10.3 Request Validation

Required:

- Content-Type validation.
- Payload size limits.
- Zod strict validation.
- Idempotency key validation.
- Authentication before domain processing.
- Rate limiting before expensive work.
- Authorization before resource access.
- Visibility-scope redaction before response generation.
- Audit record for security-sensitive actions.

## 11. Synchronization Component Strategy

### 11.1 Hub Principle

External systems submit claims. The hub owns canonical property truth after validation and approval.

### 11.2 Component Mapping

Inbound submission:

- Zod validates payload.
- Rate Limiter controls ingestion.
- Better Auth or API key module authenticates caller.
- Authorization functions verify organization and platform scope.
- Workflow starts submission lifecycle.
- Workpool handles normalization and heavy checks.

Approval:

- Authorization functions block publisher self-approval.
- Workflow creates canonical property version.
- Aggregate updates counters.
- Audit log records decision.

Visibility:

- Pure visibility functions compute per property, per platform, per audience, per channel.
- Visibility evaluations are stored.
- Per-platform visibility summaries are stored.
- Aggregate updates visibility counters.

Distribution:

- Workflow creates distribution events.
- Workpool fans out deliveries.
- Webhook Sender candidate or Action Retrier fallback handles external POSTs.
- Dead-letter state is recorded after final failure.

Suppression:

- Sold, off-market, withdrawn, expired, rejected, suspended, disputed, and manually hidden transitions create suppression events.
- Suppression events are distributed to platforms that previously received the property.
- Marketplace visibility is removed.
- CRM visibility may remain only for the owning publisher if authorized.
- Legal/Government visibility may remain only for authorized observers.

### 11.3 Idempotency

Required inbound idempotency keys:

- `Idempotency-Key` header for API submissions.
- Partner-generated event ID for webhook-style inbound changes.
- Hub-generated submission fingerprint fallback for duplicate detection, not as a replacement for caller idempotency.

Required outbound idempotency keys:

- One key per distribution event.
- One key per webhook delivery attempt series.
- Stable key across retries.
- New key only for a new hub event.

Rules:

- Duplicate inbound idempotency key with identical payload returns the original result.
- Duplicate inbound idempotency key with different payload is a conflict and becomes a reviewable security event.
- Outbound retries reuse the same idempotency key.

## 12. Authorization Strategy

### 12.1 Required Files

The hub must still own authorization in pure domain modules:

- `domains/authorization/permissions.ts`
- `domains/authorization/roles.ts`
- `domains/authorization/can.ts`
- `domains/authorization/assertPermission.ts`
- `domains/authorization/visibility-access.ts`
- `domains/authorization/resource-ownership.ts`
- `domains/authorization/integration-authorization.ts`

### 12.2 Component Use

Required:

- Better Auth proves identity and organization membership.
- Better Auth organization plugin manages organization membership.

Optional:

- `@djpanda/convex-authz` can store and evaluate relationship graphs if approved.

Forbidden:

- UI-only authorization.
- Direct component authorization calls from React components.
- Authorization embedded inside ShadCN components.
- Authorization logic mixed into Convex mutation bodies without pure functions.

### 12.3 Authorization Layers

Every server function must check:

1. Authentication.
2. Organization membership.
3. Organization type.
4. Role.
5. Permission.
6. Resource ownership.
7. Integration scope.
8. Visibility scope.
9. Compliance override rules where applicable.

## 13. Data Protection and Redaction

### 13.1 Sensitive Data Classes

Sensitive classes:

- API keys.
- Webhook signing secrets.
- Better Auth session data.
- Personal data.
- National identifiers if ever approved.
- Owner contact details.
- Title deed documents.
- Ejar lease references.
- Wafi/off-plan documents.
- RER references tied to sensitive records.
- Audit evidence payloads.

### 13.2 Redaction Rules

Required:

- Redact by visibility type.
- Redact by platform scope.
- Redact by organization relationship.
- Redact by user permission.
- Redact before outbound webhook queueing.
- Redact before client-visible Convex query return.
- Redact before logs.

### 13.3 Component Support

Components reduce plumbing but do not replace redaction:

- Better Auth protects sessions, not property payload redaction.
- Rate Limiter controls abuse, not field-level security.
- Webhook Sender candidate sends what it is given, so redaction must happen first.
- Aggregate stores counts, not sensitive row data.
- Action Cache must not store sensitive redaction-dependent results.

## 14. Package Decisions

### 14.1 Adopt Now

Adopt:

- `@convex-dev/better-auth`
- `@convex-dev/rate-limiter`
- `@convex-dev/workpool`
- `@convex-dev/workflow`
- `@convex-dev/action-retrier`
- `@convex-dev/aggregate`
- `@convex-dev/migrations`
- `@convex-dev/eslint-plugin`
- `convex-test`
- `zod`

Reason:

- These directly match mandatory stack, security, sync, workflow, and testing needs.
- They are official Convex components or required validation tooling.

### 14.2 Evaluate Before Adoption

Evaluate:

- `@vllnt/convex-api-keys`
- `convex-webhook-sender`
- `@djpanda/convex-authz`
- `convex-helpers`
- `@convex-dev/action-cache`
- `@convex-dev/crons`
- `@convex-dev/r2`
- `@convex-dev/geospatial`
- `@convex-dev/sharded-counter`
- `jose`
- `is-ip`
- `ipaddr.js`
- `sanitize-html`

Reason:

- These are useful only if their exact behavior matches hub requirements.
- Community packages must be audited.
- Conditional official components must be tied to a real hub need.

### 14.3 Do Not Use for This Hub Unless Requirements Change

Do not use:

- `@convex-dev/auth`
- `@convex-dev/workos-authkit`
- `@convex-dev/resend`
- `@convex-dev/twilio`
- `@convex-dev/stripe`
- `@convex-dev/rag`
- `@convex-dev/agent`
- `@convex-dev/presence`

Reason:

- Plain Convex Auth is forbidden by the mandatory stack.
- WorkOS AuthKit is not the selected auth stack.
- Resend, Twilio, Stripe, RAG, agent, and presence components are not required for the current synchronization hub research task.

## 15. Required Security Review Checklist Before Installing Community Components

For each community component:

- Verify package name.
- Verify repository URL.
- Verify maintainer identity.
- Verify license.
- Verify release history.
- Verify dependency tree.
- Verify no postinstall scripts or unsafe build scripts.
- Review source code for secret logging.
- Review source code for raw payload logging.
- Review source code for SSRF exposure.
- Review source code for weak crypto.
- Review source code for missing constant-time comparison.
- Review source code for unbounded retries.
- Review source code for unsafe redirects.
- Review source code for missing tenant scoping.
- Review source code for missing idempotency.
- Review source code for client-visible secret leakage.
- Add tests proving hub-specific requirements.

## 16. Final Recommended Backend Composition

### 16.1 Authentication and Organizations

Use:

- `@convex-dev/better-auth`
- Better Auth organization plugin
- Hub projection tables
- Hub pure authorization functions

Do not use:

- Plain Convex Auth.
- UI-only auth checks.
- Custom membership tables as the source of truth.

### 16.2 API Keys

Preferred path:

- Evaluate `@vllnt/convex-api-keys`.
- Adopt only if it satisfies hash-only storage, one-time reveal, scopes, status, organization scoping, rotation, revocation, usage tracking, and audit requirements.

Fallback path:

- Build small hub-owned API key module.
- Use Web Crypto or Node Crypto.
- Use HMAC-SHA-256 with server-side pepper for high-entropy keys.
- Use `@convex-dev/rate-limiter`.
- Use hub audit logging.

### 16.3 Webhooks

Preferred path:

- Evaluate `convex-webhook-sender`.
- Adopt only if it satisfies HMAC signing, bounded retries, delivery tracking, dead-letter handling, idempotency, and safe logging.

Fallback path:

- Use `@convex-dev/workflow`.
- Use `@convex-dev/workpool`.
- Use `@convex-dev/action-retrier`.
- Implement HMAC signing in a small pure module.

### 16.4 Background Sync

Use:

- `@convex-dev/workflow` for durable lifecycle state.
- `@convex-dev/workpool` for asynchronous job execution.
- `@convex-dev/action-retrier` for idempotent external calls.
- `@convex-dev/aggregate` for operational counters.

### 16.5 Validation

Use:

- `zod` for every external boundary.
- Convex validators for Convex function arguments and schema definitions.

Rules:

- Zod validates public and UI payloads.
- Convex validators validate database and function boundaries.
- Both layers are required.

### 16.6 Authorization

Use:

- Better Auth identity.
- Better Auth organizations.
- Hub pure authorization functions.

Evaluate:

- `@djpanda/convex-authz` for relationship graph storage if hub permission graph becomes too large for simple tables.

### 16.7 Caching

Use:

- Convex reactive queries for admin state.
- `@convex-dev/aggregate` for counters.
- `@convex-dev/action-cache` only for safe external checks with bounded TTL.

Do not cache:

- Auth decisions.
- Permission decisions.
- Visibility decisions as source of truth.
- Sensitive raw payloads.
- Personal data.
- API key validation results without immediate revocation checks.

## 17. Known Gaps

- No official `@convex-dev` API key management component was identified in this research. A community package exists: `@vllnt/convex-api-keys`.
- No official `@convex-dev` webhook sender component was identified in this research. A community package exists: `convex-webhook-sender`.
- `@convex-dev/rate-limiter` is not an IP firewall or WAF.
- Better Auth handles authentication and organization primitives, not hub-specific approval, visibility, or sync authorization.
- Zod validates structure and values. It does not sanitize HTML by itself.
- Convex does not use SQL for its database API, but external integrations can still create injection risk if strings are forwarded unsafely.
- Community authorization components can help permission lookup, but they cannot decide Saudi-specific visibility law, publisher self-approval bans, or Legal/Government access policy by themselves.

## 18. Strict Conclusion

The hub should use official Convex Components for the backbone:

- `@convex-dev/better-auth`
- `@convex-dev/rate-limiter`
- `@convex-dev/workflow`
- `@convex-dev/workpool`
- `@convex-dev/action-retrier`
- `@convex-dev/aggregate`
- `@convex-dev/migrations`
- `@convex-dev/eslint-plugin`
- `convex-test`

The hub should evaluate community packages for two specific gaps:

- API key lifecycle: `@vllnt/convex-api-keys`
- Webhook delivery lifecycle: `convex-webhook-sender`

The hub should evaluate `@djpanda/convex-authz` only if the authorization relationship graph becomes too complex for hub-owned tables and pure functions.

The hub must still own the following logic:

- Saudi property submission validation.
- Canonical property approval.
- Visibility computation.
- Suppression rules.
- Redaction rules.
- Publisher self-approval prevention.
- Legal/Government visibility authorization.
- Integration approval.
- Audit policy.
- API key security policy.
- Webhook payload scoping.

Components reduce plumbing. They do not replace the hub's compliance, visibility, authorization, and synchronization rules.

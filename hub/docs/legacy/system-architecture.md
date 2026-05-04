# System Architecture

## Stack

- Next.js 15+ App Router with TypeScript.
- Convex Database for real-time data, queries, mutations, actions, schedules, and backend logic.
- Convex Auth for identity and session handling.
- Tailwind CSS for UI.
- Zod or equivalent runtime validation for public HTTP payloads.
- Convex validators for backend data boundaries.

## Architecture Diagram

```text
External CRMs / Mobile Apps / Developer Tools / Partner Platforms
        |
        | HTTPS API, OAuth/API Key, Webhooks, Idempotency-Key
        v
Next.js Hub App
        |
        | Admin UI, API route handlers, auth callbacks
        v
Convex Functions
        |
        | RBAC, normalization, compliance checks, review workflow, visibility engine
        v
Convex Database
        |
        | submissions, properties, versions, platforms, audit, rules, distribution logs
        v
Convex Actions / Distribution Workers
        |
        | signed webhooks, retries, dead-letter, platform feed updates
        v
Connected Platforms
```

Sibling boundary:

```text
partners/ app
  owns developer signup, app registration, partner review, developer docs
  publishes versioned app/integration events
hub/ app
  owns property data, approval, compliance, visibility, distribution
```

## Module Boundaries

- `submissions`: intake lifecycle, idempotency, normalization state, review status.
- `properties`: canonical property summaries and lifecycle state.
- `propertyVersions`: immutable approved snapshots.
- `approvals`: human decision history and review workflow.
- `visibility`: global and platform-specific rule evaluation.
- `distribution`: outgoing events, retries, delivery logs, dead letter.
- `publishers`: organizations submitting property data.
- `connectedPlatforms`: apps/systems sending or receiving data.
- `compliance`: Saudi-specific validation issues and holds.
- `audit`: append-only read/write/action trail.
- `authz`: role and permission enforcement.

## High-Traffic Strategy

- Never scan full tables for admin lists; every list has indexed filters.
- Use cursor pagination.
- Keep current property summary denormalized in `properties`.
- Keep immutable history in append-only tables.
- Use per-platform visibility summaries to avoid recomputing on every feed request.
- Move expensive enrichment, document processing, and bulk distribution into Convex actions.
- Use retry and dead-letter tables for delivery resilience.
- Accept submissions quickly, then process heavier checks asynchronously.

## Real-Time Strategy

Convex real-time queries power:

- dashboard metrics;
- submission inbox counters;
- review assignment status;
- property visibility state;
- distribution delivery timeline;
- compliance hold changes;
- audit stream.

Public API consumers should not depend on real-time Convex subscriptions. They receive webhooks and can poll cursor endpoints.

## Caching

- Admin data: no public cache.
- Developer docs: static/Next cache allowed.
- Property export endpoints: short-lived cache only for scoped non-sensitive reads.
- Webhook payloads: stored by event ID for replay/debug, not cached publicly.
- Search/filter results: use indexed Convex query state, not browser-only stale caches.

## Idempotency

All mutating external endpoints require `Idempotency-Key`.

Rules:

- Scope uniqueness by publisher, platform, endpoint, and key.
- Store request body hash.
- Same key + same hash returns original result.
- Same key + different hash returns `409 idempotency_conflict`.
- Expire idempotency records after a configurable retention window.

## Error Handling

Error categories:

- authentication errors;
- authorization/scope errors;
- validation errors;
- compliance blocking errors;
- duplicate/conflict errors;
- rate limit errors;
- transient system errors;
- downstream delivery errors.

Every error response includes:

- machine-readable code;
- human-readable message;
- request ID;
- optional field-level details.

## Security Architecture

- Convex functions enforce RBAC; UI checks are only convenience.
- API keys are hashed; raw keys shown once.
- Webhook signing secrets are hashed/encrypted and rotatable.
- Sensitive documents require separate access logging.
- Personal data exports require explicit purpose.
- Break-glass actions require reason and produce audit events.
- Platform/publisher suspension immediately blocks ingestion and distribution.

## Compliance Architecture

- Compliance checks run on submissions before approval.
- Holds can attach to submission or property.
- Hard holds block visibility and distribution.
- Material corrections create versions.
- Regulator/auditor export reads from immutable audit, approval, version, and document metadata tables.


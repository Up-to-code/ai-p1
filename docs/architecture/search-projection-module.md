# Search Projection Module

## Ownership

- Cross-runtime contracts: `packages/domain-contracts/src/search.ts`
- Source projections, policy, outbox, hydration, reindex, and workers: `apps/workspace/convex/search`
- Search-provider gateway Adapter: `apps/workspace/src/server/domains/search`
- Command-palette Adapter: `apps/workspace/src/components/layout/workspace-global-search`
- Search Center, saved/recent query UI, and URL state: `apps/workspace/src/domains/search`
- Search Policy administration and queue health: `/organization/search-policy`

Convex is authoritative. Meilisearch stores replaceable lexical candidates and
never decides whether an actor can read a record.

## Write flow

1. A domain lifecycle mutation writes its source record.
2. Its domain projection Adapter writes the versioned Search Projection and an
   idempotent outbox event in the same transaction.
3. The scheduled worker claims an event with a bounded lease, applies Search
   Policy, configures the locale index when its settings version changes, and
   upserts or removes the external document.
4. Failures use bounded exponential backoff and eventually enter dead-letter
   state. Administrators can explicitly retry dead letters.
5. Durable reindex jobs rebuild existing Project, Task, Proposal, Contract,
   Engagement, or Deliverable projections in small cursor-owned batches without
   loading an Organization dataset into a client.

## Attachment extraction flow

1. A new media record is stored with `malwareScanStatus: pending`; public media
   reads and Search Projection creation fail closed until a configured scanner
   returns a clean verdict. Legacy unverified media is never extracted
   automatically.
2. The security worker accepts only HTTPS UploadThing hosts or an explicit
   server-side host allowlist, enforces response and declared-size limits, and
   records scanner engine/version. Infected media is quarantined and its Search
   Projection is tombstoned.
3. Clean media is queued only when Search Policy enables Attachment projection,
   extraction, the exact MIME type, and (for images) OCR. Source byte, extracted
   text, metadata, timeout, and retry limits are bounded.
4. Apache Tika and Tesseract are private infrastructure Adapters. Extracted text
   is stored separately with source version, extractor version, OCR languages,
   and locale; the original object remains the media source of truth.
5. Attachment candidates are hydrated through their containing Project, Task,
   Space, Client, or Calendar access boundary. Team or membership changes thus
   affect results without reprocessing the attachment.

The Admin Search Policy surface reports separate outbox, security, extraction,
quarantine, and reindex state and exposes audited, bounded retry commands.

## Read flow

1. Hono validates the query and active Organization request.
2. Authenticated Convex resolves live Organization, Space, Project, and user
   principal keys plus allowed resource types and locales.
3. The server-only Meilisearch Adapter retrieves coarse candidates.
4. Convex rejects missing, deleted, stale-version, cross-Organization, and
   inaccessible candidates through canonical Project and Task access Modules.
5. React receives live titles, routes, and authorized capabilities from Convex;
   external snippets are not trusted as record presentation.

The Search Center route is `/search`. Its filter state is canonical URL state,
so a filtered query remains bookmarkable without granting access. Project and
Task projections currently expose resource type, scope, Space, Project, owner,
assignee, Client, status, tag, locale, sensitivity, and relevant-date facets.
Filters for future domain projections are not rendered until those Adapters
produce the corresponding indexed fields.

Saved and recent searches are private, server-synced user records in the Search
Module. Search analytics retain query length, filter count, result count, and
opened resource type rather than duplicating query text into analytics events;
the user-visible recent-search record is the only durable copy of its query.

## Configuration

Both the Workspace gateway and Convex worker require server-side
`MEILISEARCH_URL` and `MEILISEARCH_API_KEY`. `MEILISEARCH_INDEX_PREFIX`
defaults to `qentrah_search`. These values must never use a `NEXT_PUBLIC_`
prefix or reach browser bundles.

Attachment processing additionally uses server-only `MALWARE_SCANNER_URL`,
optional `MALWARE_SCANNER_API_KEY`, `TIKA_URL`, `TESSERACT_OCR_URL`, and optional
`MEDIA_EXTRACTION_SOURCE_HOSTS`. Missing adapters leave work pending; workers do
not claim jobs they cannot process.

If provider configuration is absent, the scheduled worker leaves events
pending and reports `configured: false`. The command palette preserves the
legacy Project fallback while presenting a truthful error for indexed-only
Task search. Proposal, Contract, Engagement, and Deliverable projections are
written by their commercial lifecycle commands and are reauthorized through
live Deal or linked-Project Delivery access during hydration.

## Invariants

- Search Policy may narrow indexing but cannot grant record access.
- Restricted and confidential projections fail closed unless explicitly
  permitted for external indexing.
- Membership changes affect candidate filters through semantic principal keys
  without rewriting every projection.
- Every external hit must match the current Convex projection version.
- Meilisearch filterable-attribute changes increment a durable settings version
  before new facet fields are relied on.
- Embeddings remain an unimplemented contract seam; the active implementation
  is lexical only.
- Unscanned, failed-scan, and quarantined media cannot be served publicly or
  represented as an Attachment search result.

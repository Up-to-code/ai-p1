# Search Projection Module

## Ownership

- Cross-runtime contracts: `packages/domain-contracts/src/search.ts`
- Source projections, policy, outbox, hydration, reindex, and workers: `apps/workspace/convex/search`
- Search-provider gateway Adapter: `apps/workspace/src/server/domains/search`
- Command-palette Adapter: `apps/workspace/src/components/layout/workspace-global-search`

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
5. Durable reindex jobs rebuild existing Project or Task projections in small
   cursor-owned batches without loading an Organization dataset into a client.

## Read flow

1. Hono validates the query and active Organization request.
2. Authenticated Convex resolves live Organization, Space, Project, and user
   principal keys plus allowed resource types and locales.
3. The server-only Meilisearch Adapter retrieves coarse candidates.
4. Convex rejects missing, deleted, stale-version, cross-Organization, and
   inaccessible candidates through canonical Project and Task access Modules.
5. React receives live titles, routes, and authorized capabilities from Convex;
   external snippets are not trusted as record presentation.

## Configuration

Both the Workspace gateway and Convex worker require server-side
`MEILISEARCH_URL` and `MEILISEARCH_API_KEY`. `MEILISEARCH_INDEX_PREFIX`
defaults to `qentrah_search`. These values must never use a `NEXT_PUBLIC_`
prefix or reach browser bundles.

If provider configuration is absent, the scheduled worker leaves events
pending and reports `configured: false`. The command palette preserves the
legacy Project fallback while presenting a truthful error for indexed-only
Task search.

## Invariants

- Search Policy may narrow indexing but cannot grant record access.
- Restricted and confidential projections fail closed unless explicitly
  permitted for external indexing.
- Membership changes affect candidate filters through semantic principal keys
  without rewriting every projection.
- Every external hit must match the current Convex projection version.
- Embeddings remain an unimplemented contract seam; the active implementation
  is lexical only.

# Canonical Sales Opportunity

Status: Accepted

Date: 2026-07-10

## Context

Qentrah currently exposes Opportunities and Deals as separate navigation destinations backed by separate writable records. Both represent the same agency sales lifecycle: qualification, proposal, negotiation, and a won or lost outcome. Client screens already use Deal copy while reading and writing Opportunity records, so the distinction is neither consistent nor understandable to customers.

Maintaining two sales aggregates creates competing pipeline totals, ambiguous creation paths, duplicated permissions and tools, and no authoritative source for the won-to-Project handoff.

## Decision

`SalesOpportunity` is the canonical domain concept. **Deal** is its customer-facing product name.

- The workspace exposes one Deals navigation destination and one Deals search action.
- `/deals` is the canonical customer-facing route.
- `/opportunities` is a compatibility route and redirects to `/deals` while preserving query parameters.
- Legacy `/opportunities/:id` details remain readable until records and identifiers are migrated. They resolve to the Deals rail context and must not offer a second discovery path.
- New product work must not introduce another writable Opportunity path.
- The eventual persistence migration must produce one writable sales source before either legacy table is deleted.

## Canonical lifecycle

The canonical stages are:

1. Lead
2. Qualified
3. Proposal
4. Negotiation
5. Won
6. Lost

Status remains a separate lifecycle control for `open`, `won`, `lost`, and `paused`. A won Deal initiates an idempotent delivery handoff and may provision or link a Project; it does not become a Project itself.

## Migration contract

The persistence cutover is a separate implementation packet and must:

1. Inventory both tables by Organization and detect likely duplicates using stable links and normalized business fields.
2. Define deterministic stage mappings before backfill.
3. Preserve Client, Project, owner, tags, value, currency, close date, audit timestamps, and source identifiers.
4. Persist a legacy-ID mapping so bookmarks, mentions, relations, API consumers, and agent tools can resolve old identifiers.
5. Introduce compatibility reads before switching writes.
6. Switch all UI, Hono, Convex, MCP, reporting, and automation writes to the canonical source.
7. Reconcile record counts and pipeline value per Organization.
8. Remove compatibility code and the legacy table only after an observation window and a tested rollback path.

## Consequences

Customers see one sales pipeline and no longer need to choose between an Opportunity and a Deal. Internally, permissions, reporting, search, MCP tools, and the won-to-Project workflow gain one authoritative aggregate. During migration, compatibility reads and legacy-ID resolution add temporary implementation complexity.

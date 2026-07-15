# Agency Operating System Architecture

Status: Accepted

Date: 2026-07-14

## Context

Qentrah already owns Project, Task, Document, Calendar, Client, Deal, Space,
Inbox, Time, Resource Access, and routed Resource Workspace Modules. The agency
product must connect those capabilities from prospective revenue through
delivery and accounting without adding a second set of generic records,
permissions, navigation rules, or search caches.

The product hierarchy remains Organization → Space → Project → Work. A Project
has one primary Space and may be linked to additional Spaces. Direct Project
membership remains valid without granting broad Space access.

## Decision

Qentrah will remain a modular monolith. Existing domain Modules remain the
authoritative owners of their records and invariants. The agency lifecycle is:

`Lead → Deal → Proposal → Contract → Engagement → Project Delivery → Client Approval → Invoice → Payment → Bookkeeping → Profitability`

An Engagement is the contract-facing delivery aggregate. It supports
fixed-scope, retainer, and time-and-materials commercial models and may connect
one or more Projects. Lifecycle changes cross domain seams through named
commands such as `acceptProposal`, `activateEngagement`, `approveDeliverable`,
`postInvoice`, and `recordPayment`; callers may not patch lifecycle status
arbitrarily.

The Resource Access Module remains the canonical authorization Interface.
Convex, Hono, Search, MCP, Eve, and Client Portal integrations are Adapters over
that Interface. React receives authorized projections and never authorizes or
reconstructs omitted records.

Navigation is a server-derived Authorized Navigation Projection. Product
catalog, Organization/role defaults, and a server-synced user overlay merge by
semantic node ID. Canonical routes and permission requirements are not
customizable. Unauthorized and unentitled domains are omitted from the
projection.

Convex remains the source of truth. Multilingual lexical search uses a
replaceable Search Provider behind Search Projection and transactional outbox
Interfaces. Search candidates are always batch-reauthorized and hydrated from
Convex. Semantic search is an intentionally unimplemented future Adapter.

## Domain launcher

The canonical top-level order is Home, Inbox, Projects, Tasks, Docs, Calendar,
CRM, Delivery, Resources, Finance, Reports, Automations, and Admin. The primary
rail is permanently compact and icon-only; its accessible labels are exposed
through tooltips and assistive text. The independently closable secondary panel
owns domain-specific navigation.

Space remains part of the Organization → Space → Project hierarchy but is a
workspace context, not a top-level launcher domain. Space selection and its
channels, Projects, documents, and calendars appear inside the relevant domain
panels. AI likewise remains a secondary-panel mode and top-bar action rather
than a duplicate launcher domain. Automations reserves a truthful coming-soon
surface until its editor and operating contracts are ready.

Inbox is an attention surface, not a second collaboration store. Recipient
events own Primary, Other, Later, Cleared, and read state. Replies are derived
from actual Channel thread messages, while Channels/messages/threads remain
owned by the Inbox collaboration Module. Assigned Comments is route-backed but
must remain a truthful unavailable state until Work comments own assignment;
the UI may not synthesize comment records.

## Data and accounting invariants

- Organization IDs lead tenant indexes and every record access check.
- A Project has exactly one active primary Space link when it has any Space.
- Team grants are live principal grants, not copied per-user snapshots.
- Shared views never grant access to underlying records.
- Posted journal entries are immutable and corrected by reversal or adjustment.
- Accrual accounting is authoritative; cash reports derive from payment events.
- Monetary records preserve transaction currency, base currency, rates, and
  rounding inputs used at posting time.
- Search indexes and reporting projections never become writable sources of
  domain truth.

## Open-source policy

New runtime dependencies default to MIT, Apache-2.0, ISC, BSD-2-Clause, or
BSD-3-Clause. GPL, AGPL, SSPL, BUSL, source-available, revenue-limited, paid
runtime, and open-core dependencies require an explicit decision and legal
review. Qentrah may study protected products for behavior but must not copy
their source. Existing shared Qentrah components are extended before adding a
new UI dependency.

## Consequences

- Delivery and Finance work must deepen named domain Modules instead of
  accumulating in pages or a generic agency orchestrator.
- Resource Access must expose sufficient record-aware decisions for saved
  views, navigation, search, AI, automation, and portal Adapters.
- Navigation layouts and search indexing require durable schema, migrations,
  and server-owned reconciliation.
- Meilisearch or extraction infrastructure can be replaced without changing
  domain write callers.
- The delivery sequence must preserve current Project/Task behavior while
  introducing vertical, independently verified packets.

## Rejected alternatives

- A separate agency microservice: it would duplicate transactions and access
  decisions while the product is still one operational context.
- Client-built navigation capability filtering: omitted nodes and routes would
  remain discoverable and permission logic would drift.
- Meilisearch as an authorization or record source: external index lag makes it
  unsuitable for either responsibility.
- A generic `AgencyRecord` table: it would erase lifecycle invariants and make
  domain ownership shallow.

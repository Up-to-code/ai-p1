# Agency Operating System Delivery Packets

This document is the executable architecture checkpoint for the accepted
agency operating system decision. Each packet is completed by one agent,
verified, and committed before the next packet starts.

## Packet 1 — Contracts and safety baseline

Current behavior: Resource Access is split into focused Space, Project, Task,
Document, Channel, and Project–Space Interfaces. Saved views validate that a
scope record exists but do not consistently require record-aware read access.
Navigation is a client manifest and icon-only rail.

Structural improvement: record the agency domain language and Module seams,
then add characterization tests around the existing access matrix and saved
view scope behavior.

Validation check: existing access regression tests and documentation-map checks
remain green.

## Packet 2 — Saved-view access seam

Current behavior: saved-view writes use Organization membership plus record
existence; reads list only owner views and do not support live principal grants.

Structural improvement: extend Resource Access for saved-view scopes, enforce
it on reads and writes, then add view grants without granting underlying record
access.

Validation check: private, shared, protected, cross-Organization, direct
Project member, Space member, and revoked Team cases fail closed.

## Packet 3 — Authorized navigation projection

Current behavior: React imports a static manifest and filters some entries by
product capability. Rail width and secondary width are device-local.

Structural improvement: introduce the product catalog, Organization defaults,
user overlay, deterministic merge, and server authorization. Extend the rail
to expanded and compact modes without replacing SidebarPanelLayout.

Validation check: the client payload omits unauthorized nodes; layout
reconciliation preserves user choices across devices and catalog revisions.

## Packet 4 — Domain sidebar trees

Current behavior: Home, Inbox, Spaces, Tasks, Calendar, Clients, Deals, Docs,
and Project panels exist with partial trees.

Structural improvement: each authorized domain projection supplies its exact
tree. Existing panels and routes are reused; unavailable capabilities render no
fake destination.

Validation check: keyboard, focus, mobile overlay, localization, RTL, theme,
route, loading, empty, and denied states pass.

## Packets 5–12

Subsequent vertical packets complete routed Task views, Search Projection and
multilingual Search Provider Adapters, extraction, CRM-to-Engagement delivery,
resource planning, bookkeeping, reports/automation/AI/portal integration, and
cutover hardening. Each new domain must add its contracts, lifecycle, access,
persistence, rendered Adapter, search projection, audit behavior, and tests in
the same packet.

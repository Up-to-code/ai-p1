# Product Vision

## North Star

The Saudi Arabia Real Estate Central Data Hub is the authoritative data intake, compliance review, approval, visibility-control, and distribution layer for Saudi real estate data. External CRMs, developer systems, mobile apps, and partner platforms push property/project data into the hub. The hub normalizes it into a Saudi-localized canonical model, routes it through review, and distributes only approved and visible data to connected platforms.

The hub does not replace REGA, RER, Ejar, Wafi, Saudi Properties, a CRM, a marketplace, or a broker workflow. It connects software ecosystems to a disciplined source of truth.

## Product Principles

- Saudi-first: every model, workflow, and interface assumes the Kingdom of Saudi Arabia as v1 jurisdiction.
- Source-of-truth discipline: approved hub records are canonical for connected platforms.
- Deny-by-default visibility: data is hidden unless approved, current, scoped, and legally/operationally distributable.
- Evidence before authority: ownership, usufruct, license, lease, off-plan, and registry references are not decorative fields.
- Trace every decision: approval, rejection, correction, merge, hide, and distribution must leave an audit trail.
- Separate property from listing: a property is a legal/physical object; visibility is an offer/distribution decision.
- Protect regulated data: personal data, owner data, tenant data, documents, and sensitive property notes require purpose-bound access.

## Market Context

Saudi real estate is becoming more formal, digital, and transparent under REGA supervision, Real Estate Registry expansion, Ejar rental documentation, Wafi off-plan licensing, and Vision 2030 housing objectives. The old pattern of fragmented, stale, platform-specific property records is not acceptable for a high-growth market where ownership data, rental contracts, developer licensing, and property advertising can carry regulatory consequences.

The hub exists because connected systems will continue to be messy. CRMs will send different field names. Brokers will upload partial records. Developer tools will have incomplete off-plan project references. Mobile apps will optimistically show inventory. The hub is the hard boundary that converts messy external claims into reviewed authoritative records.

## Core User Outcomes

- Platform admins can see the real state of Saudi inventory flowing through the ecosystem.
- Compliance teams can stop misleading, unlicensed, stale, or unsupported property data before distribution.
- Publishers can submit once and distribute everywhere after approval.
- Integration partners can build against stable payloads and webhook events.
- Auditors can reconstruct every important decision.
- Downstream platforms stop showing sold, leased, withdrawn, expired, disputed, or non-compliant property offers.

## Data Lifecycle

1. External system registers through the developer/partner flow.
2. Connected platform receives credentials and scopes.
3. Publisher submits a property/project payload with source identifiers and idempotency key.
4. Hub stores raw payload unchanged.
5. Hub validates schema, authentication, rate limits, and scopes.
6. Hub normalizes external data into Saudi canonical fields.
7. Hub resolves duplicates using RER property number, title deed, plan/plot/block, location, National Address, source ID, and fuzzy matching.
8. Hub computes compliance requirements and issues.
9. Submission enters review.
10. Reviewer approves, rejects, requests evidence, escalates, or merges.
11. Approval creates or updates canonical property and immutable version history.
12. Visibility engine evaluates global and per-platform eligibility.
13. Distribution workers send create/update/hide/withdraw events.
14. Connected platforms acknowledge delivery.
15. Later status updates can immediately hide or redistribute records.

## Success Metrics

- Median submission validation time.
- Median human review time.
- Percent submissions approved without rework.
- Percent submissions requiring evidence.
- Duplicate detection precision.
- Number of stale/sold/leased/withdrawn records suppressed before distribution.
- Webhook delivery success rate.
- Dead-letter count by platform.
- Audit export completeness.
- Compliance issue recurrence by publisher.
- Visibility recomputation latency after sold/leased/withdrawn events.

## Explicit Non-Goals

- No consumer marketplace features.
- No lead management.
- No broker commission management.
- No contract signing replacement for Ejar.
- No legal determination of non-Saudi buyer eligibility.
- No government impersonation.
- No multi-country launch behavior in v1.
- No uncontrolled public export of sensitive owner, tenant, or document data.


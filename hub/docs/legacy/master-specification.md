Saudi Arabia Real Estate Central Data Hub – Ultra-Deep From-Scratch Technical, Architectural, Compliance & Design Specification

# Saudi Arabia Real Estate Central Data Hub

This document is the canonical from-scratch specification for a Saudi Arabia-only Central Real Estate Data Hub. It defines the product, architecture, compliance posture, schema, user experience, visibility model, and developer integration contract. It is intentionally strict. The hub is not a marketplace, CRM, consumer portal, advertising site, brokerage tool, or document-signing product. It is the source-of-truth data and integration layer that receives property/project data from external platforms, normalizes it, reviews it, approves it, controls visibility, and distributes authoritative data to connected systems.

Legal note: this specification is product and engineering guidance. Saudi real estate, personal-data, advertising, ownership, and registration obligations must be validated with Saudi counsel, REGA/RER/Ejar/SDAIA guidance, and any official API agreements before production launch.

Core sources used:

- [REGA Real Estate Registry platform](https://rega.gov.sa/en/rega-services/platforms/real-estate-registry/)
- [Implementing Regulations of the Law of Real Estate Registration](https://rega.gov.sa/en/rules-regulations-and-guidelines/regulations/implementing-regulations-of-the-law-of-real-estate-registration/)
- [Law of Real Estate Registration](https://rega.gov.sa/en/rules-regulations-and-guidelines/rules/law-of-real-estate-registration/)
- [REGA Real Estate Brokerage Law](https://rega.gov.sa/en/rules-regulations-and-guidelines/rules/real-estate-brokerage-law/)
- [Implementing Regulations of Real Estate Brokerage Law](https://rega.gov.sa/en/rules-regulations-and-guidelines/regulations/implementing-regulations-of-real-estate-brokerage-law/)
- [Ejar official platform](https://www.ejar.sa/en)
- [Ejar Council of Ministers Resolution No. 405](https://www.ejar.sa/en/regulation/286)
- [Ejar residential rental contract service](https://www.ejar.sa/en/service/355294)
- [REGA Updated Law of Real Estate Ownership by Non-Saudis](https://rega.gov.sa/en/rega-services/platforms/non-saudi-real-estate-ownership-in-saudi-arabia/)
- [Saudi Press Agency notice on non-Saudi ownership law entry into force](https://www.spa.gov.sa/en/N2496274)
- [SDAIA PDPL implementing regulations](https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/PDPL2/)
- [SDAIA Personal Data Breach Notification service](https://dgp.sdaia.gov.sa/wps/portal/pdp/services/personaldatabreachnotification/)
- [Vision 2030 Housing Program Annual Report 2024](https://www.vision2030.gov.sa/media/vvyplaue/housing_program_annual_report_2024_en.pdf)
- [RESO Data Dictionary](https://www.reso.org/data-dictionary/)
- [RESO Universal Parcel Identifier](https://www.reso.org/universal-property-identifier/)

---

## 1. Deep Analysis & Research Summary

### 1.1 Saudi Real Estate Ecosystem

Saudi Arabia's real estate ecosystem is being forced toward formalization, traceability, and digital registration. The hub must align to that direction rather than imitate loose global listing sites.

REGA:

- REGA is the legislator, supervisor, and regulator for non-governmental real estate activity in the Kingdom.
- REGA supervises sector development, real estate registrations, brokerage, licensing, advertising, off-plan activity, real estate indicators, and related platforms.
- The hub must treat REGA identifiers, license references, advertising-license checks, and property-document verification as first-class compliance fields, not optional metadata.

Real Estate Registry (RER):

- RER is the formal property-registration infrastructure.
- It is property-centric: the property itself is the unit of registration.
- RER records a property number, location, city, district, boundaries, lengths, area, planning data, title-deed references, rights in rem, owner percentages, restrictions, obligations, judgments, permits, and document file references.
- RER regulations explicitly require traceability for corrections and user identification.
- A real estate sheet is the authoritative legal/physical register for a property.
- The hub must mirror this discipline: every approved property must have a stable canonical property identity, version history, evidence trail, and correction log.

Ejar:

- Ejar is the official electronic platform for organizing rental contracts.
- Council of Ministers Resolution No. 405 requires licensed brokers to register residential and commercial lease contracts through the approved electronic network.
- Ejar supports residential and commercial contract documentation, contract-party details, financial details, terms, properties and units, approval workflows, payments, renewal, cancellation, and rental status.
- The hub must treat an active Ejar lease as a strong visibility control for rental inventory. A unit leased through Ejar must not remain visible as available for rent unless the listing is explicitly for a future availability window and the compliance team approves that representation.

Wafi / off-plan:

- Wafi is the official off-plan sales and lease licensing context under REGA.
- Off-plan projects require developer qualification, project licensing, escrow/permit evidence, construction status, unit inventory tracking, and disclosure of delivery timelines.
- The hub must distinguish ready property, under-construction property, land, and off-plan unit/project records. Off-plan data cannot be flattened into ordinary completed-residential fields.

Vision 2030:

- The Housing Program targets 70 percent Saudi household home ownership by 2030 and market efficiency improvements.
- Vision 2030 housing reform depends on better supply visibility, private-sector delivery, financing enablement, market transparency, and reliable digital data.
- The hub supports these goals indirectly by reducing duplicate, stale, misleading, and non-compliant property data across platforms.

Non-Saudi ownership:

- The updated law regulating non-Saudi real estate ownership entered force on January 22, 2026, according to SPA and REGA platform materials.
- The law creates a national framework for resident/non-resident individuals, companies, and entities, with geographic controls and application flows through official digital channels such as Saudi Properties.
- The hub must not decide buyer eligibility. It must store eligibility-sensitive facts, geographic-zone references, ownership-category restrictions, and distribution flags so downstream platforms do not imply availability to restricted buyer classes.

Property data standards:

- RESO's Data Dictionary is a useful inspiration for interoperable field naming, resource separation, media handling, property/listing distinction, status values, and transport consistency.
- The Saudi hub must be RESO-inspired, not RESO-bound. Saudi-specific fields override generic global listing assumptions.
- The model must distinguish property identity from listing/offer state:
  - Property: physical/legal real estate object.
  - Listing/availability: a market-facing offer attached to the property.
  - Submission: an external payload awaiting validation/review.
  - Approval: administrative decision establishing hub authority.
  - Distribution: outgoing feed/webhook/API state.

### 1.2 Compliance Implications

The hub must behave as a regulator-facing system even if it is privately operated.

Auditability:

- Every mutation must identify actor, tenant, source platform, source IP where available, request ID, idempotency key, before/after values, justification, and timestamp.
- Audit records must be append-only from application code.
- Administrative edits must create property versions, not overwrite history.
- Corrections must record what changed, who changed it, why, supporting evidence, and affected downstream systems.

Data localization and transfer:

- Default production deployment posture is KSA data residency.
- Cross-border access, support, analytics, backups, and processing must require a documented transfer basis and vendor review.
- Personal data minimization is mandatory. Owner national IDs, tenant data, phone numbers, emails, and document scans should not be distributed unless a platform is authorized for the exact purpose.

Consent and legal basis:

- The hub must store the declared legal basis for personal-data processing per publisher and integration.
- Consent evidence must include source, language, purpose, timestamp, version of consent text, and withdrawal status.
- PDPL data-subject rights require access, correction, and destruction workflows, subject to legal retention and real-estate record obligations.

Property registration linkage:

- RER property number, title deed number/date/source, property sheet references, plan number, plot number, block number, boundaries, permits, restrictions, and rights in rem are compliance-grade data.
- The hub should allow records to be submitted before RER linkage is complete, but such records must be visibly marked as unverified/pending and distribution-limited.

Penalties and inaccurate data:

- REGA brokerage regulations include penalties for misleading information, concealment of material property information, insufficient due diligence, missing ownership/usufruct evidence, and advertising-license failures.
- The hub must therefore enforce:
  - mandatory evidence for ownership or usufruct authority;
  - required broker/license metadata when distribution is advertising-like;
  - material change disclosure;
  - stale-listing expiration;
  - rejection and suspension workflows.

Security incident posture:

- SDAIA guidance requires personal data breach notification within 72 hours of awareness when the incident may harm personal data or data subjects or conflict with rights/interests.
- The hub must maintain breach triage records, affected data categories, affected subject counts, remedial actions, communications, and evidence.

### 1.3 Saudi Property Types and Data Needs

Property category model:

- Residential:
  - apartment
  - villa
  - duplex
  - townhouse
  - floor
  - room
  - residential building
  - compound unit
  - rest house
- Commercial:
  - office
  - retail shop
  - showroom
  - mall unit
  - hotel/hospitality asset
  - clinic
  - commercial building
- Industrial:
  - warehouse
  - factory
  - logistics yard
  - cold storage
  - industrial land
- Agricultural:
  - farm
  - agricultural land
  - greenhouse
  - water-well-linked land
- Land:
  - residential land
  - commercial land
  - mixed-use land
  - raw land
  - subdivided plot
  - master-planned parcel
- Off-plan:
  - off-plan project
  - off-plan building
  - off-plan unit
  - off-plan phase
- Mixed-use:
  - tower
  - community
  - development phase
  - master project
- Special/public-sensitive:
  - infrastructure corridor
  - utility-linked parcel
  - airport/port adjacency
  - property classified confidential by competent authority

Saudi-specific fields:

- RER property number / real estate sheet number
- title deed number, date, and source
- deed electronic status
- plan number, plot number, block number
- city, district, neighborhood, municipality, region
- National Address components
- KSA national geospatial reference / coordinate set
- boundary points, side lengths, area, map image reference
- rights in rem, restrictions, obligations
- owner percentage references
- usufruct/agency/brokerage authorization
- REGA license numbers
- real estate advertising license number
- Ejar contract reference and rental status
- Wafi developer qualification/license/project reference
- building, demolition, renovation, fencing, completion, industrial, mining, well, tower, antenna, booster station, and electrical-room permits where applicable
- non-Saudi ownership zone classification and restrictions

### 1.4 Visibility Rules

Visibility is deny-by-default.

A property or listing is externally visible only when all are true:

- publisher is active;
- connected platform is active;
- submitted data is approved;
- property canonical version is current;
- listing status is visible-eligible;
- required evidence exists;
- distribution channel is allowed;
- buyer/tenant audience is allowed;
- no active hard-hide rule applies;
- no active lease/sale/off-market conflict exists;
- no compliance hold, dispute hold, confidentiality flag, or admin manual hide exists.

Hard-hide triggers:

- sold
- transferred
- active Ejar lease for the same unit/listing period
- withdrawn by owner/publisher/admin
- off-market
- expired listing
- rejected submission
- publisher suspended
- platform suspended
- ownership authority expired
- advertising license expired or missing where required
- RER/title deed mismatch marked material
- active dispute, court note, restriction, confidential classification, or regulatory hold
- duplicate canonical property superseded by another property

Soft-hide or limited distribution triggers:

- incomplete RER linkage
- pending Ejar verification
- pending Wafi verification
- stale price/media
- missing optional permits
- external platform lacks permission for sensitive fields
- property eligible for professional-only/private feed but not public feed

---

## 2. Product Vision & End-to-End Data Flow

### 2.1 Vision Statement

The Saudi Arabia Real Estate Central Data Hub is the disciplined middle layer between the Kingdom's formal real estate record reality and the fragmented software used by developers, brokers, CRMs, mobile apps, and partner platforms. It receives messy external property data, converts it into a Saudi-compliant canonical model, routes it through evidence-backed human review, and distributes only approved, visible, current, audience-appropriate data to connected systems.

It exists to kill stale listings, duplicate properties, undocumented ownership claims, leaked sold inventory, phantom rental availability, and casual handling of regulated real-estate facts.

### 2.2 End-to-End Flow

1. Partner onboarding begins in the separate `partners/` project.
2. A developer registers an app, chooses scopes, and receives client credentials after partner review.
3. The hub receives a partner/app sync event from the partner project through a versioned contract.
4. A publisher organization is created or linked in the hub.
5. Publisher admin configures allowed submission sources, webhooks, source CRM identifiers, and data-retention settings.
6. External CRM/mobile/developer platform authenticates to hub API using OAuth client credentials or signed API key.
7. External system submits a property/project payload with `Idempotency-Key`.
8. API gateway validates authentication, scopes, publisher status, platform status, rate limits, payload size, and JSON schema.
9. Raw submission is stored unchanged in `submissions.rawPayload` for evidence.
10. Normalizer maps external fields to canonical Saudi hub fields.
11. Resolver attempts canonical matching using RER property number, title deed, plan/plot/block, National Address, coordinates, publisher source ID, and fuzzy address comparison.
12. Duplicate detector classifies submission as new property, update to known property, possible duplicate, conflict, or rejected duplicate.
13. Compliance rules compute required evidence by property type, transaction intent, city classification, off-plan status, rental status, and distribution channels.
14. Submission receives compliance score and blocking issues.
15. Submission enters `pending_review`, `needs_evidence`, `possible_duplicate`, or `auto_reject`.
16. Convex real-time subscriptions update admin dashboard counters and inbox queues.
17. Reviewer opens the submission review screen.
18. Reviewer compares raw payload, normalized fields, existing property, evidence documents, license references, and validation warnings.
19. Reviewer can request evidence, reject, merge with existing property, approve as new canonical property, or approve as property update.
20. Approval creates or updates `properties` and writes immutable `propertyVersions`.
21. Visibility engine evaluates the approved canonical version against global and platform-specific rules.
22. If visible, distribution jobs are created for subscribed platforms.
23. If hidden, a suppression event is created for all platforms that previously received the record.
24. Distribution worker sends webhook/feed events with retry policy.
25. Connected platforms acknowledge delivery.
26. Failed deliveries move through retry attempts, then dead letter if exhausted.
27. Every downstream state is visible in property distribution timeline.
28. External platforms may send status updates: sold, leased, withdrawn, price changed, media changed, evidence updated.
29. Status updates re-enter the same submission/change pipeline.
30. Sold, leased, withdrawn, expired, disputed, or suspended state immediately triggers visibility recomputation and downstream withdrawal.
31. Auditors can export complete event and decision history without being able to mutate property data.
32. Compliance officers can place or lift holds with mandatory reason and evidence.
33. Platform admins can override visibility only with high-privilege RBAC and full audit trace.

### 2.3 "Silly/Invisible" to Visible/Authoritative Transformation

External payloads are often silly in the engineering sense: incomplete, locally named, duplicated, stale, or legally naive. The hub transformation pipeline is:

- raw: accepted as evidence, never trusted;
- parsed: JSON and schema valid;
- normalized: mapped to canonical Saudi model;
- enriched: inferred with geospatial and platform metadata;
- checked: compliance rules applied;
- reviewed: human decision made;
- canonicalized: authoritative property/version created;
- visibility-evaluated: allowed audience/channels computed;
- distributed: only permitted fields leave the hub;
- monitored: later changes can hide, correct, supersede, or withdraw.

---

## 3. User Roles & RBAC (Convex Auth)

RBAC must be enforced in Convex functions, not only in UI. Every query/mutation/action checks the authenticated subject, tenant membership, role, permission, resource scope, and record-level visibility.

### 3.1 Roles

| Role | Purpose | Key permissions | Forbidden |
| --- | --- | --- | --- |
| Platform Admin | Owns hub operations | manage all tenants, users, roles, integrations, approvals, visibility overrides, exports, settings | cannot erase audit history |
| Compliance Officer | Enforces Saudi compliance | review evidence, approve/reject, place holds, lift holds, export compliance packs | cannot rotate API secrets unless also admin |
| Submission Reviewer | Reviews incoming data | claim submissions, request evidence, approve non-sensitive submissions, reject with reason | cannot override regulatory hold |
| Auditor | Reads history | read all audit trails, approval history, versions, delivery logs, export regulator reports | cannot mutate records |
| Publisher Admin | Manages publisher org | manage publisher users, source systems, submissions, evidence, webhooks for own tenant | cannot approve own data as authoritative |
| Publisher Editor | Submits/updates data | create submissions, upload evidence, withdraw own listings | cannot approve, export full audit, or view other tenants |
| Integration Partner | Technical integration user | manage API keys/webhooks for authorized app, read delivery logs | cannot view sensitive owner data unless scoped |
| Viewer | Internal read-only user | view approved records allowed by tenant/role | cannot see raw submissions or sensitive docs |
| Support Operator | Operational support | view non-sensitive metadata, retry delivery, see health | cannot see personal data or legal documents by default |
| System Service Account | Automated actions | run scheduled jobs, visibility engine, distribution worker | no interactive login |
| Regulatory Observer | Read-only regulator/audit seat | read compliance packs and selected evidence | cannot mutate or configure integrations |

### 3.2 Permission Atoms

- `submissions:create`
- `submissions:read:any`
- `submissions:read:own`
- `submissions:review`
- `submissions:approve`
- `submissions:reject`
- `submissions:request_evidence`
- `properties:read:any`
- `properties:read:visible`
- `properties:update`
- `properties:merge`
- `properties:version:read`
- `visibility:read`
- `visibility:override`
- `visibility:hold`
- `distribution:read`
- `distribution:retry`
- `platforms:manage`
- `publishers:manage`
- `api_keys:manage`
- `webhooks:manage`
- `audit:read`
- `audit:export`
- `settings:compliance`
- `settings:security`

### 3.3 Approval Separation of Duties

- A publisher user cannot approve its own submission.
- A platform admin can approve any record but must provide justification.
- Compliance officer approval is required for:
  - off-plan projects;
  - non-Saudi ownership eligibility sensitive properties;
  - confidential or dispute-marked properties;
  - RER/title deed mismatch resolution;
  - advertising-license exception;
  - manual visibility override.

---

## 4. High-Level System Architecture & Infrastructure

### 4.1 Text-Based Architecture Diagram

```text
External CRMs / Mobile Apps / Developer Tools / Partner Platforms
        |
        | HTTPS API, Webhooks, OAuth/API Key, Idempotency-Key
        v
Next.js 15 Hub App Router
        |
        | route handlers, server actions, admin UI, API docs
        v
Convex Functions
        |
        | authz, validation, normalization, review workflow, visibility engine
        v
Convex Database
        |
        | properties, submissions, versions, audit, rules, platforms, delivery logs
        v
Distribution Workers / Convex Actions
        |
        | webhook delivery, retries, dead-letter, feed generation
        v
Connected Platforms

Separate sibling:
partners/ app -> partner registration and app lifecycle -> versioned integration contracts -> hub
```

### 4.2 Stack

- Next.js 15+ App Router with TypeScript.
- Convex Database for real-time persistence, queries, mutations, actions, and scheduling.
- Convex Auth for authenticated identity and session handling.
- Tailwind CSS for UI.
- Zod or equivalent validation in Next route handlers plus Convex validators in backend.
- Optional future queue/external worker only if Convex action throughput is insufficient for media/document processing.

### 4.3 Scalability

- Use append-only event/distribution tables to avoid hot wide document updates.
- Keep property summary fields denormalized for high-read pages.
- Store large raw payloads and documents as storage references where needed.
- Paginate all list views by indexed fields.
- Use inbox queues by status, priority, assignee, publisher, and created time.
- Avoid querying unindexed full tables.
- Split heavy validation into:
  - synchronous acceptance checks;
  - asynchronous compliance enrichment;
  - human review.
- Use idempotency records to prevent duplicate submissions during client retries.

### 4.4 Caching and Real Time

- Convex real-time queries power dashboards, inbox counts, property detail, delivery status, and audit timelines.
- Next.js can statically cache public developer documentation, not live admin data.
- API consumers receive webhooks for changes; polling endpoints use cursor and `updatedAfter`.
- Sensitive admin pages should not use public edge caching.

### 4.5 Event-Driven Patterns

Core events:

- `submission.received`
- `submission.normalized`
- `submission.duplicate_detected`
- `submission.review_requested`
- `submission.approved`
- `submission.rejected`
- `property.created`
- `property.updated`
- `property.versioned`
- `visibility.changed`
- `distribution.enqueued`
- `distribution.delivered`
- `distribution.failed`
- `distribution.dead_lettered`
- `compliance.hold_placed`
- `compliance.hold_lifted`
- `publisher.suspended`
- `platform.suspended`

Events are not decorative. They are how audit, distribution, and operational recovery remain sane.

### 4.6 Design Patterns

- SOLID applied pragmatically:
  - single-purpose Convex modules: submissions, properties, approvals, visibility, distribution, publishers, platforms, audit;
  - dependency inversion through service functions that receive context and IDs, not global UI state;
  - open/closed compliance rules via rule records and typed evaluators;
  - interface segregation through scoped API tokens and narrow Convex functions.
- Repository/service layering:
  - `convex/*` modules own persistence.
  - `lib/contracts/*` owns public payload schemas.
  - `lib/domain/*` owns pure normalization, visibility, and validation logic.
  - `app/*` owns UI and route composition.

### 4.7 Error Handling, Retries, Idempotency

- Every write endpoint accepts or generates a request ID.
- External submission endpoints require `Idempotency-Key`.
- Idempotency key uniqueness is scoped by publisher/platform/endpoint/body hash.
- If key repeats with same hash, return original result.
- If key repeats with different hash, reject `409 idempotency_conflict`.
- Retryable failures:
  - upstream timeout;
  - downstream webhook timeout;
  - transient Convex action failure;
  - rate limit window exhaustion.
- Non-retryable failures:
  - invalid auth;
  - schema violation;
  - forbidden scope;
  - publisher suspended;
  - unsupported property category;
  - malicious payload.

### 4.8 Multi-Tenancy and Future Multi-Country Readiness

V1 is Saudi-only. The architecture may include `countryCode = "SA"` and jurisdiction fields, but no UI or data behavior should imply another market is supported.

Tenant isolation:

- every publisher-owned table includes `publisherId`;
- every platform-owned table includes `connectedPlatformId`;
- every user role assignment is tenant-scoped unless platform-wide;
- every query filters by tenant scope in Convex;
- exports require role and purpose.

Future readiness:

- use jurisdiction config tables;
- keep Saudi fields canonical for v1;
- never water down Saudi-specific validation to fit generic international needs.

### 4.9 Security, Auditing, Compliance Architecture

- TLS everywhere.
- Secrets stored only in environment or secret manager, never Convex public records.
- API key hashes stored, not raw keys.
- Webhook signing secrets hashed/encrypted.
- Principle of least privilege scopes.
- Break-glass admin action requires reason and audit event.
- Sensitive document access is separately logged.
- Personal data exports are purpose-bound and time-bound.
- Admin sessions use strong auth and future MFA-ready design.

---

## 5. Convex Database Architecture & Schema (Extreme Depth)

The following is a schema-level specification as if writing `convex/schema.ts`. Some field validators are intentionally verbose to force implementation clarity.

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const countryCode = v.literal("SA");

export const userStatus = v.union(
  v.literal("active"),
  v.literal("invited"),
  v.literal("disabled"),
  v.literal("suspended"),
);

export const hubRole = v.union(
  v.literal("platform_admin"),
  v.literal("compliance_officer"),
  v.literal("submission_reviewer"),
  v.literal("auditor"),
  v.literal("publisher_admin"),
  v.literal("publisher_editor"),
  v.literal("integration_partner"),
  v.literal("viewer"),
  v.literal("support_operator"),
  v.literal("system_service_account"),
  v.literal("regulatory_observer"),
);

export const publisherStatus = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("active"),
  v.literal("suspended"),
  v.literal("revoked"),
);

export const platformStatus = v.union(
  v.literal("pending_review"),
  v.literal("active"),
  v.literal("suspended"),
  v.literal("revoked"),
);

export const submissionStatus = v.union(
  v.literal("received"),
  v.literal("normalizing"),
  v.literal("pending_review"),
  v.literal("needs_evidence"),
  v.literal("possible_duplicate"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("auto_rejected"),
  v.literal("withdrawn"),
);

export const propertyCategory = v.union(
  v.literal("residential"),
  v.literal("commercial"),
  v.literal("industrial"),
  v.literal("agricultural"),
  v.literal("land"),
  v.literal("off_plan"),
  v.literal("mixed_use"),
  v.literal("special"),
);

export const propertySubtype = v.union(
  v.literal("apartment"),
  v.literal("villa"),
  v.literal("duplex"),
  v.literal("townhouse"),
  v.literal("floor"),
  v.literal("room"),
  v.literal("residential_building"),
  v.literal("compound_unit"),
  v.literal("rest_house"),
  v.literal("office"),
  v.literal("retail_shop"),
  v.literal("showroom"),
  v.literal("mall_unit"),
  v.literal("hotel_asset"),
  v.literal("clinic"),
  v.literal("commercial_building"),
  v.literal("warehouse"),
  v.literal("factory"),
  v.literal("logistics_yard"),
  v.literal("cold_storage"),
  v.literal("industrial_land"),
  v.literal("farm"),
  v.literal("agricultural_land"),
  v.literal("greenhouse"),
  v.literal("residential_land"),
  v.literal("commercial_land"),
  v.literal("mixed_use_land"),
  v.literal("raw_land"),
  v.literal("subdivided_plot"),
  v.literal("master_planned_parcel"),
  v.literal("off_plan_project"),
  v.literal("off_plan_building"),
  v.literal("off_plan_unit"),
  v.literal("off_plan_phase"),
  v.literal("tower"),
  v.literal("community"),
  v.literal("development_phase"),
  v.literal("infrastructure_sensitive"),
);

export const transactionIntent = v.union(
  v.literal("sale"),
  v.literal("rent"),
  v.literal("lease"),
  v.literal("off_plan_sale"),
  v.literal("off_plan_lease"),
  v.literal("data_only"),
);

export const propertyLifecycleStatus = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("approved"),
  v.literal("active"),
  v.literal("sold"),
  v.literal("leased"),
  v.literal("withdrawn"),
  v.literal("off_market"),
  v.literal("expired"),
  v.literal("suspended"),
  v.literal("under_dispute"),
  v.literal("superseded"),
  v.literal("archived"),
);

export const visibilityState = v.union(
  v.literal("hidden"),
  v.literal("visible"),
  v.literal("limited"),
  v.literal("suppressed"),
);

export const visibilityReason = v.union(
  v.literal("approved_visible"),
  v.literal("pending_approval"),
  v.literal("rejected"),
  v.literal("sold"),
  v.literal("leased_ejar"),
  v.literal("withdrawn"),
  v.literal("off_market"),
  v.literal("expired"),
  v.literal("manual_hide"),
  v.literal("publisher_suspended"),
  v.literal("platform_suspended"),
  v.literal("missing_evidence"),
  v.literal("license_expired"),
  v.literal("rer_mismatch"),
  v.literal("title_deed_mismatch"),
  v.literal("wafi_hold"),
  v.literal("dispute_hold"),
  v.literal("confidential"),
  v.literal("audience_restricted"),
  v.literal("duplicate_superseded"),
);

export const complianceSeverity = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("blocking"),
  v.literal("critical"),
);

export const documentType = v.union(
  v.literal("title_deed"),
  v.literal("rer_property_sheet"),
  v.literal("ownership_authorization"),
  v.literal("usufruct_right"),
  v.literal("brokerage_contract"),
  v.literal("advertising_license"),
  v.literal("ejar_contract"),
  v.literal("wafi_license"),
  v.literal("building_permit"),
  v.literal("completion_certificate"),
  v.literal("survey_map"),
  v.literal("valuation_certificate"),
  v.literal("insurance_policy"),
  v.literal("court_judgment"),
  v.literal("other"),
);

export default defineSchema({
  users: defineTable({
    authSubject: v.string(),
    displayName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: userStatus,
    preferredLocale: v.union(v.literal("en"), v.literal("ar")),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_authSubject", ["authSubject"])
    .index("by_status", ["status"]),

  roleAssignments: defineTable({
    userId: v.id("users"),
    role: hubRole,
    publisherId: v.optional(v.id("publishers")),
    connectedPlatformId: v.optional(v.id("connectedPlatforms")),
    countryCode,
    grantedByUserId: v.optional(v.id("users")),
    reason: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"])
    .index("by_publisherId", ["publisherId"])
    .index("by_connectedPlatformId", ["connectedPlatformId"]),

  publishers: defineTable({
    legalName: v.string(),
    displayName: v.string(),
    status: publisherStatus,
    countryCode,
    commercialRegistrationNumber: v.optional(v.string()),
    regaLicenseNumber: v.optional(v.string()),
    ejarBrokerageOfficeId: v.optional(v.string()),
    wafiDeveloperNumber: v.optional(v.string()),
    nationalAddress: v.optional(v.any()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    dataResidencyCommitment: v.literal("ksa_primary"),
    pdplControllerType: v.union(v.literal("controller"), v.literal("processor"), v.literal("joint_controller")),
    onboardingRiskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    createdAt: v.number(),
    updatedAt: v.number(),
    suspendedAt: v.optional(v.number()),
    suspensionReason: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_legalName", ["legalName"])
    .index("by_commercialRegistrationNumber", ["commercialRegistrationNumber"])
    .index("by_regaLicenseNumber", ["regaLicenseNumber"]),

  connectedPlatforms: defineTable({
    publisherId: v.optional(v.id("publishers")),
    partnerAppId: v.optional(v.string()),
    clientId: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("crm"),
      v.literal("mobile_app"),
      v.literal("developer_tool"),
      v.literal("portal"),
      v.literal("analytics"),
      v.literal("government_or_regulatory"),
    ),
    status: platformStatus,
    allowedScopes: v.array(v.string()),
    allowedDistributionChannels: v.array(v.string()),
    webhookBaseUrl: v.optional(v.string()),
    webhookSigningSecretHash: v.optional(v.string()),
    rateLimitPerMinute: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    suspendedAt: v.optional(v.number()),
    suspensionReason: v.optional(v.string()),
  })
    .index("by_clientId", ["clientId"])
    .index("by_publisherId", ["publisherId"])
    .index("by_status", ["status"]),

  apiKeys: defineTable({
    connectedPlatformId: v.id("connectedPlatforms"),
    publisherId: v.optional(v.id("publishers")),
    keyPrefix: v.string(),
    keyHash: v.string(),
    name: v.string(),
    scopes: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("revoked"), v.literal("expired")),
    createdByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_keyPrefix", ["keyPrefix"])
    .index("by_connectedPlatformId", ["connectedPlatformId"])
    .index("by_status", ["status"]),

  submissions: defineTable({
    publisherId: v.id("publishers"),
    connectedPlatformId: v.id("connectedPlatforms"),
    sourceSystem: v.string(),
    sourceRecordId: v.string(),
    idempotencyKey: v.string(),
    idempotencyHash: v.string(),
    status: submissionStatus,
    transactionIntent,
    propertyCategory,
    rawPayload: v.any(),
    normalizedSnapshot: v.optional(v.any()),
    canonicalPropertyId: v.optional(v.id("properties")),
    possibleDuplicatePropertyIds: v.array(v.id("properties")),
    complianceScore: v.number(),
    blockingIssueCount: v.number(),
    assignedReviewerId: v.optional(v.id("users")),
    reviewPriority: v.union(v.literal("low"), v.literal("normal"), v.literal("high"), v.literal("urgent")),
    rejectionCode: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    receivedAt: v.number(),
    updatedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_publisherId_status", ["publisherId", "status"])
    .index("by_connectedPlatformId", ["connectedPlatformId"])
    .index("by_idempotency", ["publisherId", "connectedPlatformId", "idempotencyKey"])
    .index("by_sourceRecord", ["publisherId", "sourceSystem", "sourceRecordId"])
    .index("by_status_priority", ["status", "reviewPriority"])
    .index("by_canonicalPropertyId", ["canonicalPropertyId"]),

  properties: defineTable({
    publisherId: v.id("publishers"),
    currentVersionId: v.optional(v.id("propertyVersions")),
    canonicalReference: v.string(),
    countryCode,
    category: propertyCategory,
    subtype: propertySubtype,
    transactionIntent,
    lifecycleStatus: propertyLifecycleStatus,
    visibilityState,
    visibilityReasons: v.array(visibilityReason),
    isVisible: v.boolean(),
    manualHidden: v.boolean(),
    complianceHold: v.boolean(),
    regulatoryHold: v.boolean(),
    confidential: v.boolean(),
    title: v.string(),
    description: v.optional(v.string()),
    city: v.string(),
    district: v.optional(v.string()),
    neighborhood: v.optional(v.string()),
    region: v.optional(v.string()),
    nationalAddress: v.optional(v.any()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    geospatialAccuracy: v.optional(v.string()),
    rerPropertyNumber: v.optional(v.string()),
    realEstateSheetNumber: v.optional(v.string()),
    titleDeedNumber: v.optional(v.string()),
    titleDeedDate: v.optional(v.string()),
    titleDeedSource: v.optional(v.string()),
    planNumber: v.optional(v.string()),
    plotNumber: v.optional(v.string()),
    blockNumber: v.optional(v.string()),
    areaSqm: v.optional(v.number()),
    builtUpAreaSqm: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    parkingSpaces: v.optional(v.number()),
    priceAmount: v.optional(v.number()),
    priceCurrency: v.literal("SAR"),
    rentPeriod: v.optional(v.union(v.literal("monthly"), v.literal("quarterly"), v.literal("semi_annual"), v.literal("annual"))),
    ejarContractId: v.optional(v.string()),
    ejarStatus: v.optional(v.union(v.literal("none"), v.literal("pending"), v.literal("active"), v.literal("expired"), v.literal("cancelled"))),
    wafiLicenseNumber: v.optional(v.string()),
    offPlanProjectId: v.optional(v.id("offPlanProjects")),
    nonSaudiOwnershipZoneCode: v.optional(v.string()),
    nonSaudiOwnershipAllowed: v.optional(v.boolean()),
    listedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    soldAt: v.optional(v.number()),
    leasedAt: v.optional(v.number()),
    withdrawnAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_publisherId", ["publisherId"])
    .index("by_canonicalReference", ["canonicalReference"])
    .index("by_visibility", ["isVisible", "visibilityState"])
    .index("by_lifecycleStatus", ["lifecycleStatus"])
    .index("by_city_category", ["city", "category"])
    .index("by_rerPropertyNumber", ["rerPropertyNumber"])
    .index("by_titleDeedNumber", ["titleDeedNumber"])
    .index("by_ejarContractId", ["ejarContractId"])
    .index("by_offPlanProjectId", ["offPlanProjectId"]),

  propertyVersions: defineTable({
    propertyId: v.id("properties"),
    publisherId: v.id("publishers"),
    versionNumber: v.number(),
    sourceSubmissionId: v.optional(v.id("submissions")),
    changeType: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("corrected"),
      v.literal("status_changed"),
      v.literal("visibility_changed"),
      v.literal("merged"),
      v.literal("superseded"),
    ),
    snapshot: v.any(),
    changedFields: v.array(v.string()),
    changeSummary: v.string(),
    createdByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_propertyId_version", ["propertyId", "versionNumber"])
    .index("by_publisherId", ["publisherId"])
    .index("by_sourceSubmissionId", ["sourceSubmissionId"]),

  approvalHistory: defineTable({
    submissionId: v.id("submissions"),
    propertyId: v.optional(v.id("properties")),
    reviewerId: v.id("users"),
    action: v.union(
      v.literal("claimed"),
      v.literal("requested_evidence"),
      v.literal("approved_new"),
      v.literal("approved_update"),
      v.literal("rejected"),
      v.literal("merged"),
      v.literal("escalated"),
    ),
    reason: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_reviewerId", ["reviewerId"]),

  complianceIssues: defineTable({
    submissionId: v.optional(v.id("submissions")),
    propertyId: v.optional(v.id("properties")),
    severity: complianceSeverity,
    code: v.string(),
    message: v.string(),
    fieldPath: v.optional(v.string()),
    isBlocking: v.boolean(),
    resolved: v.boolean(),
    resolvedByUserId: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_submissionId", ["submissionId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_severity", ["severity"])
    .index("by_resolved", ["resolved"]),

  visibilityRules: defineTable({
    name: v.string(),
    description: v.string(),
    enabled: v.boolean(),
    priority: v.number(),
    scope: v.union(v.literal("global"), v.literal("publisher"), v.literal("platform"), v.literal("property")),
    publisherId: v.optional(v.id("publishers")),
    connectedPlatformId: v.optional(v.id("connectedPlatforms")),
    condition: v.any(),
    resultState: visibilityState,
    resultReason: visibilityReason,
    isHardHide: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_enabled_priority", ["enabled", "priority"])
    .index("by_scope", ["scope"])
    .index("by_publisherId", ["publisherId"])
    .index("by_connectedPlatformId", ["connectedPlatformId"]),

  visibilityEvaluations: defineTable({
    propertyId: v.id("properties"),
    propertyVersionId: v.optional(v.id("propertyVersions")),
    connectedPlatformId: v.optional(v.id("connectedPlatforms")),
    previousState: visibilityState,
    nextState: visibilityState,
    reasons: v.array(visibilityReason),
    evaluatedBy: v.union(v.literal("system"), v.literal("admin")),
    evaluatedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_propertyId", ["propertyId"])
    .index("by_connectedPlatformId", ["connectedPlatformId"])
    .index("by_createdAt", ["createdAt"]),

  connectedPlatformVisibility: defineTable({
    propertyId: v.id("properties"),
    connectedPlatformId: v.id("connectedPlatforms"),
    publisherId: v.id("publishers"),
    state: visibilityState,
    reasons: v.array(visibilityReason),
    lastDistributedVersionId: v.optional(v.id("propertyVersions")),
    lastDistributionEventId: v.optional(v.id("distributionEvents")),
    updatedAt: v.number(),
  })
    .index("by_property_platform", ["propertyId", "connectedPlatformId"])
    .index("by_platform_state", ["connectedPlatformId", "state"])
    .index("by_publisherId", ["publisherId"]),

  distributionEvents: defineTable({
    propertyId: v.id("properties"),
    propertyVersionId: v.optional(v.id("propertyVersions")),
    connectedPlatformId: v.id("connectedPlatforms"),
    publisherId: v.id("publishers"),
    eventType: v.union(
      v.literal("property.created"),
      v.literal("property.updated"),
      v.literal("property.hidden"),
      v.literal("property.visible"),
      v.literal("property.withdrawn"),
      v.literal("property.deleted_from_feed"),
    ),
    status: v.union(v.literal("queued"), v.literal("delivering"), v.literal("delivered"), v.literal("failed"), v.literal("dead_letter")),
    payload: v.any(),
    idempotencyKey: v.string(),
    attempts: v.number(),
    nextAttemptAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_propertyId", ["propertyId"])
    .index("by_connectedPlatform_status", ["connectedPlatformId", "status"])
    .index("by_status_nextAttemptAt", ["status", "nextAttemptAt"])
    .index("by_idempotencyKey", ["idempotencyKey"]),

  propertyDocuments: defineTable({
    propertyId: v.optional(v.id("properties")),
    submissionId: v.optional(v.id("submissions")),
    publisherId: v.id("publishers"),
    type: documentType,
    storageId: v.string(),
    fileName: v.string(),
    mimeType: v.string(),
    checksumSha256: v.string(),
    extractedMetadata: v.optional(v.any()),
    verificationStatus: v.union(v.literal("unverified"), v.literal("pending"), v.literal("verified"), v.literal("rejected"), v.literal("expired")),
    expiresAt: v.optional(v.number()),
    uploadedByUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_propertyId", ["propertyId"])
    .index("by_submissionId", ["submissionId"])
    .index("by_publisherId_type", ["publisherId", "type"])
    .index("by_verificationStatus", ["verificationStatus"]),

  propertyMedia: defineTable({
    propertyId: v.id("properties"),
    publisherId: v.id("publishers"),
    storageId: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("floor_plan"), v.literal("map"), v.literal("document_preview")),
    title: v.optional(v.string()),
    altText: v.optional(v.string()),
    sortOrder: v.number(),
    complianceStatus: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_propertyId_sortOrder", ["propertyId", "sortOrder"])
    .index("by_publisherId", ["publisherId"])
    .index("by_complianceStatus", ["complianceStatus"]),

  offPlanProjects: defineTable({
    publisherId: v.id("publishers"),
    name: v.string(),
    city: v.string(),
    district: v.optional(v.string()),
    wafiLicenseNumber: v.string(),
    developerQualificationNumber: v.optional(v.string()),
    escrowReference: v.optional(v.string()),
    projectStatus: v.union(v.literal("planned"), v.literal("licensed"), v.literal("under_construction"), v.literal("completed"), v.literal("suspended"), v.literal("cancelled")),
    expectedDeliveryDate: v.optional(v.string()),
    unitCount: v.optional(v.number()),
    complianceHold: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_publisherId", ["publisherId"])
    .index("by_wafiLicenseNumber", ["wafiLicenseNumber"])
    .index("by_projectStatus", ["projectStatus"]),

  idempotencyRecords: defineTable({
    publisherId: v.id("publishers"),
    connectedPlatformId: v.id("connectedPlatforms"),
    endpoint: v.string(),
    idempotencyKey: v.string(),
    requestHash: v.string(),
    responseStatus: v.number(),
    responseBody: v.any(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_key", ["publisherId", "connectedPlatformId", "endpoint", "idempotencyKey"])
    .index("by_expiresAt", ["expiresAt"]),

  auditLog: defineTable({
    actorUserId: v.optional(v.id("users")),
    actorAuthSubject: v.optional(v.string()),
    actorType: v.union(v.literal("user"), v.literal("system"), v.literal("api_key"), v.literal("webhook")),
    publisherId: v.optional(v.id("publishers")),
    connectedPlatformId: v.optional(v.id("connectedPlatforms")),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    requestId: v.optional(v.string()),
    idempotencyKey: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_actorUserId", ["actorUserId"])
    .index("by_publisherId", ["publisherId"])
    .index("by_connectedPlatformId", ["connectedPlatformId"])
    .index("by_resource", ["resourceType", "resourceId"])
    .index("by_createdAt", ["createdAt"]),
});
```

### 5.1 Schema Relationships

- `publishers` own submissions, properties, documents, media, off-plan projects, and distribution events.
- `connectedPlatforms` may belong to a publisher or be independent distribution consumers.
- `submissions` are immutable intake records with mutable workflow status.
- `properties` are canonical current summaries.
- `propertyVersions` are immutable version snapshots.
- `approvalHistory` records human decision steps.
- `complianceIssues` attaches to submissions or properties.
- `visibilityRules` defines rule configuration.
- `visibilityEvaluations` records each evaluation.
- `connectedPlatformVisibility` stores current per-platform visibility.
- `distributionEvents` stores outbound delivery state.
- `auditLog` records every sensitive read/write/action.

### 5.2 Versioning

No approved property update modifies reality without a version:

- new approval creates property version 1;
- material update increments version;
- status change increments version when externally relevant;
- visibility-only change may create `visibilityEvaluations` without full property version unless the public status field changes;
- merge creates a supersession version on losing property and update version on surviving property.

### 5.3 Visibility in Schema

Visibility is stored at two levels:

- `properties.isVisible`, `visibilityState`, `visibilityReasons`: global summary.
- `connectedPlatformVisibility.state`, `reasons`: platform-specific distribution truth.

Rules may hide a property globally or only from one platform/channel. A public portal might receive only visible sale listings; a regulatory observer might see hidden records; an analytics platform might receive anonymized aggregate updates only.

---

## 6. Project Folder Structure

```text
anan/
  hub/
    README.md
    package.json
    next.config.mjs
    tsconfig.json
    postcss.config.mjs
    components.json
    app/
      layout.tsx
      globals.css
      (auth)/
        signin/page.tsx
      (hub)/
        dashboard/page.tsx
        submissions/page.tsx
        submissions/[submissionId]/page.tsx
        properties/page.tsx
        properties/[propertyId]/page.tsx
        integrations/page.tsx
        publishers/page.tsx
        audit/page.tsx
        settings/page.tsx
      api/
        v1/properties/route.ts
        v1/submissions/route.ts
        v1/webhooks/test/route.ts
        auth/[...all]/route.ts
    components/
      layout/
        HubShell.tsx
        Sidebar.tsx
        Topbar.tsx
      submissions/
        SubmissionInboxTable.tsx
        SubmissionReviewPanel.tsx
        EvidenceChecklist.tsx
      properties/
        PropertyDataTable.tsx
        PropertyVisibilityToggle.tsx
        PropertyStatusBadge.tsx
        PropertyHistoryTimeline.tsx
      integrations/
        ConnectedPlatformCard.tsx
        WebhookDeliveryTable.tsx
        ApiKeyManager.tsx
      compliance/
        ComplianceIssueList.tsx
        ApprovalWorkflow.tsx
        AuditTrailViewer.tsx
      ui/
        button.tsx
        badge.tsx
        card.tsx
        dialog.tsx
        table.tsx
        input.tsx
        select.tsx
        tabs.tsx
    convex/
      schema.ts
      auth.config.ts
      users.ts
      publishers.ts
      connectedPlatforms.ts
      submissions.ts
      properties.ts
      approvals.ts
      visibility.ts
      distribution.ts
      audit.ts
      compliance.ts
      http.ts
    lib/
      contracts/
        propertyPayload.ts
        webhookEvents.ts
        errors.ts
      domain/
        normalizeSaudiProperty.ts
        evaluateVisibility.ts
        detectDuplicates.ts
        complianceRules.ts
      auth/
        permissions.ts
        requireRole.ts
      formatting/
        money.ts
        dates.ts
    docs/
      00-master-specification.md
      01-product-vision.md
      02-system-architecture.md
      03-saudi-compliance.md
      04-data-model.md
      05-integration-spec.md
      06-visibility-rules.md
      design-system.md
  partners/
    existing separate developer integration project
```

`partners/` remains a sibling project. It owns partner signup, partner app registration, app lifecycle, and developer docs. The hub consumes partner app registration through explicit versioned contracts, never by importing `partners/convex/_generated`.

---

## 7. Documentation Files (Full Content)

The implementation must maintain these documentation files:

- `docs/01-product-vision.md`: source-of-truth product concept, Saudi market framing, data lifecycle, success metrics.
- `docs/02-system-architecture.md`: architecture, modules, scaling, queues, Convex function boundaries, security.
- `docs/03-saudi-compliance.md`: REGA/RER/Ejar/Wafi/PDPL/Vision 2030 compliance analysis and operational controls.
- `docs/04-data-model.md`: schema, field dictionary, relationships, versioning, Saudi property types.
- `docs/05-integration-spec.md`: API/webhook contracts, auth, payloads, errors, sandbox, examples.
- `docs/06-visibility-rules.md`: complete visibility rule model, hard/soft hides, platform-specific visibility, lifecycle transitions.
- `docs/design-system.md`: visual identity and component system.

---

## 8. System UI Design System (Fucking Extreme Detail)

### 8.1 Brand Identity

Brand posture:

- precise;
- official-adjacent but not pretending to be government;
- sober;
- data-forward;
- Saudi-market specific;
- compliance-first;
- high-trust.

Logo rules:

- Use a geometric Arabic/Latin-compatible wordmark.
- Avoid official Saudi emblem misuse.
- Avoid green-only national cliche palette.
- Use a small data-node mark inspired by cadastral grid intersections.
- Clear space equals height of the mark.
- Minimum digital height: 28px.
- Do not stretch, rotate, glow, outline, or place over low-contrast imagery.

### 8.2 Color Palette

Primary:

- `#0B3D2E` Deep Registry Green: primary navigation, primary buttons.
- `#146B4D` Authority Green: hover and selected states.
- `#D8B45A` Survey Gold: focus accents, premium regulatory highlights.

Secondary:

- `#1E4966` Cadastral Blue: integration and system status.
- `#6B4E16` Deed Brown: legal/document references.
- `#4B5563` Slate Neutral: secondary text.

Neutrals:

- `#F8FAF9` app background light
- `#EEF3F1` surface band
- `#FFFFFF` surface
- `#D8E1DD` border
- `#8A9691` muted text
- `#111827` primary text
- `#07130F` dark background
- `#111C18` dark surface
- `#23332D` dark border

Status:

- Approved: `#16834A`
- Pending: `#B7791F`
- Rejected: `#B42318`
- Needs Evidence: `#C05621`
- Hidden: `#475467`
- Visible: `#027A48`
- Limited: `#175CD3`
- Suspended: `#7A271A`
- Dead Letter: `#912018`

### 8.3 Typography

- Font: Inter or equivalent Latin UI font; pair with a high-quality Arabic UI font when Arabic support is added.
- H1: 32px / 40px / 700.
- H2: 24px / 32px / 700.
- H3: 20px / 28px / 650.
- Section heading: 16px / 24px / 650.
- Body: 14px / 22px / 400.
- Table: 13px / 20px / 400.
- Caption: 12px / 18px / 500.
- Mono tokens: 12px / 18px.
- Letter spacing: 0.

### 8.4 Spacing, Radius, Shadow

- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Radius:
  - buttons: 6px;
  - inputs: 6px;
  - cards: 8px maximum;
  - modals: 8px;
  - badges: 999px only for pills.
- Shadows:
  - none by default;
  - `shadow-sm` for popovers;
  - `shadow-md` for modals;
  - avoid decorative elevation.

### 8.5 Component Library

Buttons:

- Primary: "Approve", "Save Rule", "Create Platform".
- Secondary: "Request Evidence", "Export", "Retry".
- Destructive: "Reject", "Suspend", "Revoke Key".
- Ghost icon: search, filter, refresh, copy, more.
- Sizes: sm 32px, md 40px, lg 48px.
- States: default, hover, focus-visible, disabled, loading.

Data tables:

- Sticky header.
- Compact row height 44px.
- Checkbox selection only where bulk action is valid.
- Columns support sort, filter, density, visibility.
- Row click opens detail.
- Action column fixed right.
- Empty state includes one next action.

Cards:

- Use for metric tiles and repeated objects.
- Do not nest cards.
- Use subtle border, not heavy shadow.

Modals:

- Max width 560px for decisions, 880px for evidence comparison.
- Destructive modals require typed reason for rejection/suspension.
- Approval modal shows summary of fields that will become authoritative.

Badges:

- Status badges are semantic and consistent.
- Visibility badges must include reason tooltip.
- Compliance severity badges use icon plus label.

Forms:

- Label above input.
- Required fields use text, not only color.
- Validation appears below field.
- Saudi-specific formats have examples.
- Long evidence fields use document picker.

Dark mode:

- Preserve status color semantics.
- Avoid low-contrast green on black.
- Tables use borders, not large tinted blocks.

---

## 9. Page-by-Page + Component-by-Component Specification (Brutal Detail)

### 9.1 Dashboard

Purpose: real-time operational command center.

Layout:

- Topbar: current environment, search, notifications, profile menu.
- Left sidebar: Dashboard, Submissions, Properties, Integrations, Publishers, Audit, Settings.
- Metric row:
  - Pending submissions
  - Needs evidence
  - Approved today
  - Hidden by visibility rules
  - Failed deliveries
  - Compliance holds
- Main panels:
  - Submission volume chart
  - Visibility changes feed
  - Distribution health
  - Compliance issue breakdown
  - Recently approved properties

Buttons:

- `Refresh`: refetches active Convex queries.
- `Export Snapshot`: opens export modal with date range and scope.
- `Review Oldest`: navigates to oldest pending submission.

States:

- Loading: skeleton metric cards and table rows.
- Empty: "No submissions received yet" with link to integration docs.
- Error: inline retry with trace ID.
- Real time: metrics update when Convex tables change.

### 9.2 Submissions Inbox

Purpose: triage external payloads.

Filters:

- Status
- Publisher
- Source platform
- Property category
- Transaction intent
- Compliance severity
- Duplicate status
- City
- Date range
- Assignee

Columns:

- Checkbox
- Priority
- Submission ID
- Publisher
- Source system
- Source record ID
- Category
- Intent
- City/District
- Compliance score
- Blocking issues
- Duplicate signal
- Status
- Received at
- Assignee
- Actions

Buttons:

- `Claim`: assigns current reviewer.
- `Open Review`: navigates to review screen.
- `Request Evidence`: opens evidence modal.
- `Reject`: opens rejection modal.
- `Bulk Assign`: assigns selected rows.
- `Bulk Request Evidence`: creates evidence requests for selected rows.

### 9.3 Submission Review & Approval Screen

Purpose: convert submission into authoritative hub data or reject it.

Sections:

- Header: submission ID, publisher, source, status, priority.
- Raw Payload tab: formatted JSON, source metadata, idempotency key.
- Normalized Data tab: canonical field comparison.
- Evidence tab: documents, media, licenses, verification state.
- Duplicate tab: possible matches with similarity explanation.
- Compliance tab: blocking/warning/info issues.
- Decision panel: approval/rejection actions.

Buttons:

- `Approve as New Property`: creates property and version.
- `Approve as Update`: updates selected canonical property.
- `Merge with Existing`: requires chosen property and reason.
- `Request Evidence`: moves to needs evidence.
- `Reject Submission`: requires rejection code and reason.
- `Escalate to Compliance`: assigns compliance officer queue.
- `Preview Distribution`: shows what each platform would receive.

Approval modal:

- Shows authoritative fields.
- Shows visibility result.
- Shows downstream platforms affected.
- Requires reviewer confirmation.

### 9.4 Approved Properties List

Columns:

- Visibility badge
- Canonical reference
- Title
- Category/subtype
- Transaction intent
- City/district
- Publisher
- Price/rent
- Lifecycle status
- RER property number
- Title deed number
- Ejar status
- Wafi license
- Last approved
- Distribution health
- Actions

Buttons:

- `Open`: property detail.
- `Hide`: manual hide modal.
- `Withdraw`: lifecycle withdrawal modal.
- `Export`: export selected records.
- `Recompute Visibility`: triggers visibility evaluation.

### 9.5 Single Property Detail View

Tabs:

- Overview
- Location & Registry
- Ownership & Rights
- Listing & Pricing
- Media & Documents
- Visibility
- Distribution
- History
- Audit

Overview fields:

- canonical reference
- lifecycle status
- visibility state
- title
- description
- category/subtype
- transaction intent
- publisher
- approved version
- created/updated timestamps

Visibility tab:

- global visibility state
- per-platform visibility table
- active rules matched
- hard-hide reasons
- soft-hide reasons
- manual override controls

Buttons:

- `Manual Hide`: requires reason.
- `Lift Manual Hide`: requires reason and recomputes rules.
- `Place Compliance Hold`: compliance officer only.
- `Lift Hold`: compliance officer only.
- `Recompute`: records visibility evaluation.
- `Send Withdrawal`: enqueues withdrawal to platforms.

History tab:

- version timeline
- changed fields
- submission source
- reviewer
- before/after diff

### 9.6 Connected Platforms / Integrations Management

Columns:

- Platform name
- Type
- Publisher
- Client ID
- Status
- Scopes
- Webhook URL
- Last delivery
- Failure rate
- Rate limit
- Created at
- Actions

Buttons:

- `Create Platform`: opens create modal.
- `Rotate Secret`: generates new secret once and stores hash.
- `Suspend`: stops ingestion/distribution.
- `Test Webhook`: sends signed test event.
- `View Deliveries`: opens delivery log.

### 9.7 Publishers/Developers Directory

Columns:

- Legal name
- Display name
- Status
- CR number
- REGA license
- Ejar office ID
- Wafi developer number
- Risk level
- Active properties
- Pending submissions
- Compliance holds
- Created at
- Actions

Buttons:

- `Approve Publisher`
- `Suspend Publisher`
- `Request Documents`
- `Open`

### 9.8 Activity & Full Audit Log

Columns:

- Timestamp
- Actor
- Actor type
- Publisher
- Platform
- Action
- Resource type
- Resource ID
- IP
- Request ID
- Reason
- Actions

Buttons:

- `Open Event`
- `Export`
- `Copy Request ID`

Audit detail drawer:

- before/after JSON
- related records
- user/session metadata
- export hash

### 9.9 Settings & Compliance Center

Sections:

- RBAC roles
- Visibility rules
- Compliance rule configuration
- Data retention
- PDPL processing records
- Breach register
- Export templates
- Security settings
- Environment health

Buttons:

- `Create Rule`
- `Disable Rule`
- `Run Simulation`
- `Export Compliance Pack`
- `Record Breach Triage`
- `Save Retention Policy`

### 9.10 Reusable Components

Approval Workflow:

- shows current status, assignee, evidence, issues, and allowed next actions.

Property Visibility Toggle:

- displays current visibility but does not naively flip a boolean.
- opens modal explaining rule consequences.

Data Table:

- supports server-indexed filters, sort, column visibility, row actions, loading, empty, and error state.

Evidence Checklist:

- lists required documents by property category and transaction intent.

Status Badge:

- consistent label/color/icon for lifecycle, submission, visibility, and delivery states.

---

## 10. Integration & Developer Platform

### 10.1 Separate Developer Project

The `partners/` app is the developer-facing integration project. It owns:

- partner programmer signup;
- app registration;
- OAuth app metadata;
- allowed scopes;
- partner review state;
- developer docs;
- integration events.

The hub owns:

- property data;
- publisher compliance;
- submission review;
- approval;
- visibility;
- distribution.

The boundary is versioned contracts. Do not import generated Convex APIs across apps.

### 10.2 Authentication

Supported:

- OAuth client credentials for server-to-server systems.
- API keys for initial controlled partner integrations.
- Webhook signatures for outbound events.

Required headers:

```http
Authorization: Bearer <token>
Content-Type: application/json
Idempotency-Key: subm_01HUB...
X-Anan-Source: crm
```

### 10.3 Submission Endpoint

```http
POST /api/v1/submissions
```

Minimal payload:

```json
{
  "sourceSystem": "acme-crm",
  "sourceRecordId": "CRM-49291",
  "transactionIntent": "sale",
  "property": {
    "category": "residential",
    "subtype": "villa",
    "title": "Villa in Riyadh",
    "description": "Publisher supplied description.",
    "location": {
      "countryCode": "SA",
      "city": "Riyadh",
      "district": "Al Narjis",
      "latitude": 24.8461,
      "longitude": 46.6701
    },
    "registry": {
      "rerPropertyNumber": "RER-OPTIONAL",
      "titleDeedNumber": "TD-123456",
      "planNumber": "P-21",
      "plotNumber": "14",
      "blockNumber": "B"
    },
    "areas": {
      "landSqm": 400,
      "builtUpSqm": 320
    },
    "pricing": {
      "amount": 2500000,
      "currency": "SAR"
    }
  },
  "evidence": [
    {
      "type": "title_deed",
      "url": "https://publisher.example/documents/title-deed.pdf",
      "checksumSha256": "..."
    }
  ]
}
```

Response:

```json
{
  "submissionId": "sub_123",
  "status": "pending_review",
  "canonicalPropertyId": null,
  "complianceScore": 78,
  "blockingIssues": [
    {
      "code": "AD_LICENSE_REQUIRED",
      "field": "evidence.advertisingLicense",
      "message": "Advertising license evidence is required for this distribution channel."
    }
  ]
}
```

### 10.4 Webhook Events

Outbound event shape:

```json
{
  "eventId": "evt_123",
  "eventType": "property.hidden",
  "occurredAt": "2026-05-04T10:00:00.000Z",
  "propertyId": "prop_123",
  "version": 7,
  "visibility": {
    "state": "hidden",
    "reasons": ["leased_ejar"]
  },
  "data": {
    "canonicalReference": "SA-RUH-000001",
    "lifecycleStatus": "leased"
  }
}
```

Webhook requirements:

- include signature header;
- include timestamp header;
- include event ID;
- retry with exponential backoff;
- dead-letter after configured attempts;
- consumers must treat events as idempotent.

### 10.5 Data Movement Summary

External system -> hub:

- authenticated submission;
- raw evidence preserved;
- normalized and reviewed;
- canonical property/version created.

Hub -> platforms:

- visibility evaluated;
- payload redacted by scope;
- event delivered;
- status tracked;
- withdrawal sent when hidden.

### 10.6 Error Format

```json
{
  "error": {
    "code": "idempotency_conflict",
    "message": "The same idempotency key was used with a different request body.",
    "requestId": "req_123",
    "details": {}
  }
}
```

Common codes:

- `unauthorized`
- `forbidden_scope`
- `publisher_suspended`
- `platform_suspended`
- `invalid_payload`
- `idempotency_conflict`
- `rate_limited`
- `unsupported_property_category`
- `evidence_required`
- `duplicate_possible`
- `internal_error`


# Saudi Compliance

## Compliance Posture

The hub is compliance-aware infrastructure, not a legal authority. It must be built to preserve evidence, enforce conservative visibility, and make review decisions inspectable. Production launch requires Saudi legal review and formal API agreements where official integrations are used.

## REGA

REGA supervises and regulates Saudi real estate activities. For the hub this means:

- publisher onboarding should capture commercial registration and REGA license references where applicable;
- real estate advertising/distribution should require advertising license metadata where legally required;
- misleading property information, concealment of material facts, and insufficient verification must be treated as compliance risks;
- brokerage/service providers must not be allowed to distribute records as if licensed unless license evidence exists.

Controls:

- publisher license fields;
- license expiry checks;
- advertising-license document type;
- compliance issue codes for missing/mismatched licenses;
- hard visibility hides for expired/suspended license states.

## Real Estate Registry (RER)

RER records property number, property sheet, title deed references, location, planning data, boundaries, area, rights, obligations, restrictions, judgments, permits, and related documents.

Hub implications:

- RER property number is a top-tier identity key.
- Title deed number/date/source must be stored separately, not buried in notes.
- Location and planning data must include city, district, plan number, plot number, and block number where available.
- Boundaries and area should support future geospatial verification.
- Corrections must be traceable by actor, time, reason, and changed fields.
- Confidential or restriction-bearing properties must support hard visibility holds.

## Ejar

Ejar organizes and documents residential and commercial leases. Licensed brokers are required to register residential and commercial unit lease contracts electronically through the approved network under Council of Ministers Resolution No. 405.

Hub implications:

- Ejar contract references are mandatory for rental records when available.
- Active Ejar lease status hides the same unit from available-rent distribution.
- Future-availability listings require explicit dates and reviewer approval.
- Lease cancellation, expiry, or renewal should recompute visibility.

## Wafi / Off-Plan

Off-plan property records require stronger project-level controls:

- Wafi license number;
- developer qualification reference;
- project status;
- expected delivery date;
- unit inventory;
- escrow/reference evidence where required;
- construction phase;
- disclosure of whether the unit is off-plan, ready, completed, suspended, or cancelled.

Hard holds:

- missing Wafi license for off-plan sale/lease;
- suspended/cancelled project;
- missing developer authority;
- materially misleading delivery/completion data.

## Non-Saudi Ownership

The updated non-Saudi ownership law entered force on January 22, 2026. The hub must store eligibility-sensitive geography and restriction metadata but must not make final buyer eligibility decisions.

Required handling:

- store non-Saudi ownership zone code where available;
- store whether publisher asserts non-Saudi ownership is allowed;
- store source and date of the assertion;
- do not distribute eligibility claims to public channels unless approved;
- support audience restrictions for Saudi-only, GCC-only, resident, non-resident, corporate, fund, or regulator-only contexts.

## PDPL

PDPL-aware requirements:

- collect only data needed for clear purposes;
- store processing legal basis;
- document consent when consent is used;
- support consent withdrawal workflows where applicable;
- support data-subject access, correction, and destruction requests subject to legal retention;
- avoid disclosing personal data identifying another person in access responses;
- document third-party collection basis;
- conduct privacy impact/risk assessments for sensitive processing and cross-border transfer;
- notify competent authority within 72 hours of awareness of qualifying personal data breach incidents;
- notify data subjects without undue delay where required.

Hub controls:

- `pdplControllerType` on publishers;
- consent evidence records in future extension;
- export reason fields;
- sensitive document access audit;
- breach triage register;
- data retention policies;
- KSA-primary data residency default.

## Advertising and Misleading Data Controls

The hub should block or hold distribution when:

- advertising license is required but absent;
- publisher lacks ownership/usufruct/brokerage evidence;
- property is sold, leased, withdrawn, expired, or off-market;
- material fields conflict with evidence;
- area, city, title deed, or RER number mismatch is unresolved;
- media is fake, low-quality, misleading, or unrelated;
- off-plan status is represented as completed without evidence.

## Audit Requirements

Every sensitive event must log:

- actor;
- actor type;
- publisher;
- platform;
- action;
- resource;
- request ID;
- idempotency key;
- IP/user agent where available;
- before/after values for mutations;
- reason;
- timestamp.

No application workflow may delete audit logs.


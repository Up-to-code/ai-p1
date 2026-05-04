# Data Model

## Modeling Rules

- Property identity is separate from submission identity.
- Submission raw payload is evidence, not truth.
- Approved property summary is current truth.
- Property versions are immutable truth snapshots.
- Visibility is a computed distribution state, not a simple user preference.
- Saudi-specific identifiers outrank generic listing identifiers.

## Core Entities

### users

Stores authenticated hub users and service accounts.

Fields:

- `authSubject`
- `displayName`
- `email`
- `phone`
- `status`
- `preferredLocale`
- `createdAt`
- `updatedAt`
- `lastSeenAt`

Indexes:

- `by_authSubject`
- `by_status`

### roleAssignments

Tenant-aware RBAC assignments.

Fields:

- `userId`
- `role`
- `publisherId`
- `connectedPlatformId`
- `countryCode`
- `grantedByUserId`
- `reason`
- `createdAt`
- `expiresAt`

### publishers

Organizations that submit or own property data.

Fields:

- legal/display names;
- status;
- country `SA`;
- commercial registration;
- REGA license;
- Ejar brokerage office ID;
- Wafi developer number;
- National Address;
- contact details;
- PDPL controller/processor posture;
- onboarding risk;
- suspension metadata.

### connectedPlatforms

External systems connected to the hub.

Fields:

- publisher link;
- partner app ID;
- client ID;
- name;
- type;
- status;
- scopes;
- distribution channels;
- webhook URL;
- signing secret hash;
- rate limit;
- suspension metadata.

### submissions

Raw intake and review workflow.

Fields:

- publisher/platform/source identifiers;
- idempotency key and hash;
- status;
- transaction intent;
- property category;
- raw payload;
- normalized snapshot;
- canonical property link;
- duplicate candidates;
- compliance score;
- blocking issue count;
- assignee;
- priority;
- rejection metadata;
- timestamps.

### properties

Canonical current property summary.

Critical fields:

- canonical reference;
- publisher;
- category/subtype;
- transaction intent;
- lifecycle status;
- global visibility state;
- visibility reasons;
- manual/compliance/regulatory/confidential flags;
- title/description;
- Saudi location fields;
- geospatial coordinates and accuracy;
- RER property number;
- real estate sheet number;
- title deed number/date/source;
- plan/plot/block;
- area and built-up area;
- residential/commercial feature fields;
- price/rent;
- Ejar contract and status;
- Wafi license/off-plan project link;
- non-Saudi ownership metadata;
- lifecycle timestamps.

Indexes:

- publisher;
- canonical reference;
- visibility;
- lifecycle status;
- city/category;
- RER number;
- title deed;
- Ejar contract;
- off-plan project.

### propertyVersions

Immutable snapshots after approval/correction/status change.

Fields:

- property ID;
- version number;
- source submission;
- change type;
- full snapshot;
- changed fields;
- summary;
- actor;
- timestamp.

### approvalHistory

Human review trail.

Actions:

- claimed;
- requested evidence;
- approved new;
- approved update;
- rejected;
- merged;
- escalated.

### complianceIssues

Machine and human compliance findings.

Fields:

- submission/property link;
- severity;
- code;
- message;
- field path;
- blocking flag;
- resolution metadata.

### visibilityRules

Rule configuration.

Fields:

- name;
- description;
- enabled;
- priority;
- scope;
- optional publisher/platform;
- condition JSON;
- result state;
- reason;
- hard-hide flag.

### visibilityEvaluations

Append-only rule outcomes.

Fields:

- property;
- property version;
- platform;
- previous state;
- next state;
- reasons;
- evaluator;
- timestamp.

### connectedPlatformVisibility

Current per-platform visibility truth.

Fields:

- property;
- platform;
- publisher;
- state;
- reasons;
- last distributed version;
- last distribution event;
- updated timestamp.

### distributionEvents

Outbound webhook/feed events.

Fields:

- property;
- version;
- platform;
- publisher;
- event type;
- status;
- payload;
- idempotency key;
- attempts;
- next attempt;
- last error;
- timestamps.

### propertyDocuments

Evidence and document storage metadata.

Types:

- title deed;
- RER sheet;
- ownership authorization;
- usufruct right;
- brokerage contract;
- advertising license;
- Ejar contract;
- Wafi license;
- building permit;
- completion certificate;
- survey map;
- valuation certificate;
- insurance policy;
- court judgment;
- other.

### propertyMedia

Media linked to property with compliance status.

Types:

- image;
- video;
- floor plan;
- map;
- document preview.

### offPlanProjects

Project-level off-plan context.

Fields:

- publisher;
- name;
- city/district;
- Wafi license;
- developer qualification;
- escrow/reference;
- status;
- delivery date;
- unit count;
- compliance hold.

### auditLog

Append-only system memory.

Fields:

- actor;
- actor type;
- publisher/platform;
- action;
- resource;
- request/idempotency IDs;
- IP/user agent;
- before/after;
- reason;
- timestamp.

## Property Type Field Needs

Residential:

- bedrooms, bathrooms, parking, floor, unit number, furnished status, amenities, area, price/rent, Ejar status.

Commercial:

- frontage, fit-out, license suitability, floor, parking, loading access, rent period.

Industrial:

- warehouse/factory type, power capacity, loading docks, clear height, yard area, industrial permits.

Agricultural:

- farm area, water/well permits, crop/greenhouse details, agricultural use constraints.

Land:

- plan/plot/block, zoning, frontage, street widths, land use, subdivision status.

Off-plan:

- Wafi license, project phase, delivery date, developer, escrow, unit inventory, construction status.

## Versioning Policy

Create a property version when:

- property is first approved;
- material field changes;
- lifecycle status changes;
- RER/title deed/ownership evidence changes;
- off-plan status changes;
- merge/supersession occurs;
- correction is made.

Do not rely on overwritten current fields as history.


# RULES.md - Saudi Real Estate Synchronization Hub

These rules are mandatory. If implementation conflicts with this document, the implementation is wrong. This hub is a Saudi Arabia real estate synchronization engine. It is not a product playground. It is not a CRM. It is not a marketplace. It is a single source of truth for property data, synchronization, approval, visibility, audit, and distribution.

Reference baseline:

- Next.js 16.2 release notes: https://nextjs.org/blog/next-16-2
- Convex + Better Auth component: https://labs.convex.dev/better-auth
- Convex Better Auth component client: https://labs.convex.dev/better-auth/api/component-client
- Better Auth organization plugin: https://better-auth.com/docs/plugins/organization
- Convex Components overview: https://docs.convex.dev/components/understanding
- Convex Rate Limiter component: https://github.com/get-convex/rate-limiter
- Convex Aggregate component: https://github.com/get-convex/aggregate

## 1. Platform Boundary

- The platform is strictly the Saudi Arabia Central Real Estate Data Synchronization Hub.
- The hub is the canonical source of truth for approved Saudi property data.
- External CRMs, workspaces, marketplaces, mobile apps, developer tools, partner systems, and legal/government systems submit claims to the hub.
- External systems do not become source of truth because they submitted data.
- Admin review converts external claims into authoritative hub versions.
- Visibility evaluation controls which audience can see which property fields.
- Synchronization distributes scoped authoritative data to connected platforms.
- Suppression events remove or hide property data that is no longer eligible for distribution.
- The hub owns canonical property data.
- The hub owns submissions.
- The hub owns approval workflow.
- The hub owns visibility evaluation.
- The hub owns synchronization jobs.
- The hub owns outbound distribution events.
- The hub owns audit records.
- The hub owns compliance holds.
- The hub owns idempotency records.
- The separate developer integration project remains separate.
- Do not import generated APIs, schema, functions, or runtime internals from `partners/`.
- Do not create a CRM product.
- Do not create lead management.
- Do not create deal pipelines.
- Do not create customer interaction timelines.
- Do not create commission tracking.
- Do not create consumer search pages.
- Do not create a marketplace product.
- Do not create saved searches.
- Do not create recommendation features.
- Do not create chat.
- Do not create contract signing.
- Do not add any feature that does not directly support intake, review, approval, canonicalization, visibility, synchronization, audit, compliance, or integration authorization.

## 2. Mandatory Stack

- Runtime framework: Next.js 16.2.4.
- Package lock target: `next@16.2.4`.
- Next.js routing: App Router only.
- Language: TypeScript.
- Backend and database: Convex Database.
- Authentication component: `@convex-dev/better-auth`.
- Authentication provider implementation: Better Auth through the Convex Component.
- Organization membership: Better Auth organization plugin.
- UI primitives: official ShadCN/UI components only.
- Styling: Tailwind CSS.
- Icons: Lucide React.
- Validation: Zod.
- Rate limiting: Convex Rate Limiter component when rate limiting is needed.
- Aggregated counters: Convex Aggregate component when counters would otherwise require table scans.
- Future backend utilities: prefer official Convex Components from https://www.convex.dev/components when a relevant component exists.
- Do not use plain Convex Auth.
- Do not use a custom authentication database adapter when `@convex-dev/better-auth` provides the adapter.
- Do not write a custom organization membership system when Better Auth organization plugin covers membership.
- Do not write custom rate-limit persistence when Convex Rate Limiter covers it.
- Do not write custom aggregate counter tables when Convex Aggregate covers the counter safely.
- Do not introduce a second UI kit.
- Do not introduce Prisma, Drizzle, Supabase, Firebase, Clerk, Auth0, or custom SQL for the hub unless explicitly requested later.

Required package version targets:

```json
{
  "next": "16.2.4",
  "@convex-dev/better-auth": "0.12.2",
  "@convex-dev/rate-limiter": "0.3.2",
  "@convex-dev/aggregate": "0.2.1",
  "convex": "^1.31.6",
  "better-auth": "^1.5.6",
  "zod": "^4.4.1",
  "lucide-react": "^0.577.0"
}
```

Version updates require a separate explicit task.

## 3. Exact Folder Structure

The hub uses domain-driven, feature-based zones. A file has one responsibility. Do not collapse zones to save time.

Required root structure:

```text
hub/
  app/
    layout.tsx
    globals.css
    api/
    (auth)/
    (hub)/
  components/
    ui/
    layout/
  features/
    dashboard/
    submissions/
    properties/
    visibility/
    synchronization/
    integrations/
    publishers/
    organizations/
    audit/
    settings/
    compliance/
  domains/
    property/
    submission/
    visibility/
    synchronization/
    authorization/
    organization/
    compliance/
    audit/
    integration/
    publisher/
    security/
  convex/
    convex.config.ts
    http.ts
    schema.ts
    auth.config.ts
    betterAuth/
    components/
    submissions.ts
    properties.ts
    visibility.ts
    synchronization.ts
    integrations.ts
    organizations.ts
    publishers.ts
    audit.ts
    compliance.ts
  lib/
    auth/
    contracts/
    env/
    formatting/
    security/
    shadcn/
    validation/
  docs/
  tests/
    unit/
    integration/
    contract/
    smoke/
```

Required feature zone structure:

```text
features/<feature>/
  components/
  hooks/
  actions/
  tables/
  dialogs/
  schemas/
  types.ts
  index.ts
```

Required domain zone structure:

```text
domains/<domain>/
  constants.ts
  types.ts
  schema.ts
  validators.ts
  policy.ts
  index.ts
```

Rules:

- `components/ui/` contains official ShadCN/UI primitives only.
- `components/layout/` contains shell, sidebar, topbar, and layout-only wrappers.
- `features/` contains React components and page-specific presentation logic.
- `domains/` contains pure domain logic.
- `convex/` contains Convex queries, mutations, actions, schema, components, and HTTP routes.
- `lib/contracts/` contains public API and webhook Zod schemas.
- `lib/security/` contains hashing, signatures, redaction helpers, and request utilities.
- `lib/env/` contains environment parsing.
- `tests/unit/` tests pure functions.
- `tests/integration/` tests multi-step hub workflows.
- `tests/contract/` tests API and webhook schemas.
- `tests/smoke/` tests page render and route protection.
- No feature component may define domain policy inline.
- No Convex function may embed long authorization decisions inline.
- No API route may validate request data without a Zod schema from a contract or feature schema file.
- No domain file may import React.
- No ShadCN primitive may import a feature module.

## 4. Better Auth + Convex Components Rules

- Use `@convex-dev/better-auth` for all authentication.
- Never use plain Convex Auth.
- Configure the Better Auth component in `convex/convex.config.ts`.
- Name the component `betterAuth`.
- Keep Better Auth component data isolated from app-domain tables.
- Keep Better Auth local schema files under `convex/betterAuth/`.
- Keep Better Auth server configuration under `convex/betterAuth/auth.ts`.
- Keep the Better Auth client bridge under `lib/auth/auth-client.ts`.
- Keep the Next.js auth bridge under `lib/auth/auth-server.ts`.
- Register Better Auth HTTP routes with `authComponent.registerRoutesLazy` in `convex/http.ts`.
- Use the Better Auth organization plugin for organization membership.
- Use Better Auth organization roles for membership-level identity.
- Use hub projection tables for indexed domain authorization and resource ownership checks.
- Do not query Better Auth component internals directly from UI.
- Do not store property permissions only inside Better Auth metadata.
- Do not use organization hooks for property approval, property visibility, or synchronization jobs.
- Organization hooks may enforce organization lifecycle rules only.
- Organization hooks may reject invalid organization creation.
- Organization hooks may restrict role changes.
- Organization hooks may create or update hub projection records.
- Organization hooks may write audit events for organization lifecycle changes.
- Organization hooks must not approve submissions.
- Organization hooks must not modify property records.
- Organization hooks must not enqueue synchronization events.
- Use Convex Rate Limiter component for authentication-sensitive actions, API ingestion, webhook tests, exports, and retry endpoints.
- Use Convex Aggregate component for dashboard counters and queue counts where indexed queries would become repeated count scans.
- Before writing a custom backend utility, check whether a relevant official Convex Component exists.
- If no relevant component exists, document the reason in the implementing task or code comment.

Required Convex component configuration shape:

```ts
import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import aggregate from "@convex-dev/aggregate/convex.config.js";

const app = defineApp();

app.use(betterAuth, { name: "betterAuth" });
app.use(rateLimiter, { name: "rateLimiter" });
app.use(aggregate, { name: "aggregate" });

export default app;
```

Required lazy route pattern:

```ts
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

authComponent.registerRoutesLazy(http, createAuth, {
  basePath: "/api/auth",
  cors: true,
  trustedOrigins: [process.env.SITE_URL!],
});

export default http;
```

## 5. Organization and Permission Rules

Organization types:

- `platform_operator`: internal hub operator organization.
- `publisher_developer`: property publisher, real estate developer, broker organization, or data owner.
- `integration_partner`: technical platform authorized to submit or consume synchronization events.
- `government_legal_observer`: legal, regulator, government, or compliance observer organization.
- `internal_workspace`: internal workspace allowed to view scoped operational records.

Organization roles:

- `owner`
- `admin`
- `integration_admin`
- `publisher_manager`
- `publisher_editor`
- `reviewer`
- `compliance_officer`
- `auditor`
- `legal_observer`
- `workspace_viewer`
- `support_operator`

Platform operator rules:

- Only platform admins can create a `platform_operator` organization.
- Only platform admins can assign platform-wide roles.
- Platform admins can suspend any organization.
- Platform admins can authorize integration partners.
- Platform admins can grant Legal/Government visibility.
- Platform admins cannot delete audit records.

Publisher/developer rules:

- Publisher owner can manage publisher users.
- Publisher admin can request an integration.
- Publisher admin can submit source systems for review.
- Publisher editor can submit property data.
- Publisher users cannot approve their own submissions.
- Publisher users cannot authorize platform-wide distribution.
- Publisher users cannot grant Legal/Government visibility.
- Publisher users cannot bypass marketplace visibility rules.

Integration partner rules:

- Integration partner can request API credentials.
- Integration partner can configure webhook endpoints after approval.
- Integration partner can rotate its own webhook secret if authorized.
- Integration partner cannot authorize itself.
- Integration partner cannot expand its own scopes.
- Integration partner cannot access hidden records unless a visibility type explicitly permits it.
- Integration partner cannot see Legal/Government payloads unless its organization type and scope permit it.

Government/legal observer rules:

- Legal/Government visibility requires compliance officer or platform admin authorization.
- Legal/Government visibility is read-only unless a later explicit task grants mutation.
- Legal/Government observers can see hidden records only through approved visibility scopes.
- Legal/Government observers cannot distribute property data to marketplace channels.
- Legal/Government observers cannot edit canonical property data.

Internal workspace rules:

- Workspace visibility is scoped to workspace authorization.
- Workspace viewers can see only records granted to their workspace.
- Workspace viewers cannot approve submissions.
- Workspace viewers cannot modify synchronization rules.

Integration authorization rules:

- Publisher admin may request an integration.
- Integration security officer or platform admin must approve integration activation.
- Compliance officer must approve integrations that request Legal/Government visibility.
- Platform admin must approve marketplace distribution scope.
- Workspace admin must approve workspace visibility for workspace-specific integrations.
- Every integration authorization requires an audit event.
- Every integration authorization requires explicit scopes.
- Every integration authorization has status: `requested`, `approved`, `rejected`, `suspended`, or `revoked`.
- Rejected authorization requires reason.
- Suspended authorization blocks ingestion and distribution.

## 6. Authorization System Design

Authorization must be extracted into pure reusable functions.

Required files:

```text
domains/authorization/permissions.ts
domains/authorization/roles.ts
domains/authorization/can.ts
domains/authorization/assertPermission.ts
domains/authorization/visibility-access.ts
domains/authorization/organization-access.ts
domains/authorization/integration-access.ts
domains/authorization/resource-scope.ts
domains/authorization/types.ts
domains/authorization/index.ts
```

Rules:

- `permissions.ts` defines permission constants only.
- `roles.ts` maps organization roles to permission sets.
- `can.ts` exports a pure `can()` function.
- `assertPermission.ts` exports throwing assertion helpers for Convex functions.
- `visibility-access.ts` decides whether an actor can access a visibility type.
- `organization-access.ts` decides organization membership and organization type access.
- `integration-access.ts` decides who can request, approve, suspend, revoke, rotate, and test integrations.
- `resource-scope.ts` checks publisher, platform, workspace, and property ownership boundaries.
- `types.ts` defines authorization input and decision types.
- Every Convex query checks permission server-side.
- Every Convex mutation checks permission server-side.
- Every Convex action checks permission server-side.
- UI checks only hide or disable controls.
- UI checks never replace server-side authorization.
- Authorization decisions return structured results with `allowed`, `reason`, and optional `requiredPermission`.
- Authorization failures must not leak sensitive resource existence.
- Resource ownership checks are mandatory for publisher-owned records.
- Visibility-scope checks are mandatory for property reads.
- Audit export checks are separate from normal audit read checks.
- Sensitive document read checks are separate from property read checks.
- Organization admin does not imply platform admin.
- Publisher admin does not imply integration approval authority.
- Compliance officer authority is limited to compliance, evidence, holds, Legal/Government visibility, and audit review.

Required permission groups:

- `submissions:*`
- `properties:*`
- `visibility:*`
- `synchronization:*`
- `integrations:*`
- `organizations:*`
- `publishers:*`
- `audit:*`
- `compliance:*`
- `documents:*`
- `exports:*`
- `settings:*`

Required high-risk permissions:

- `submissions.approve`
- `submissions.reject`
- `visibility.override`
- `visibility.legalGovernment.grant`
- `integrations.approve`
- `integrations.suspend`
- `apiKeys.rotate`
- `documents.sensitive.read`
- `exports.audit.create`
- `settings.security.update`

## 7. Visibility Types and Sync Logic

Visibility is not one boolean. Visibility is computed per property, per connected platform, per audience, per channel, per version.

Required visibility types:

- `marketplace`: public marketplace/feed visibility.
- `crm`: owning publisher CRM/internal sales-system visibility.
- `workspace`: authorized workspace visibility.
- `legal_government`: legal, regulator, government, and compliance observer visibility.
- `publisher_private`: publisher-only private visibility.
- `partner`: integration partner visibility.
- `analytics`: aggregate or redacted analytics visibility.
- `suppression`: visibility state used to remove/hide previously distributed data.

Marketplace visibility:

- Sold property is hidden.
- Off-market property is hidden.
- Withdrawn property is hidden.
- Expired property is hidden.
- Rejected submission is hidden.
- Suspended property is hidden.
- Property under dispute is hidden unless explicitly approved for legal/government visibility only.
- Active Ejar-leased rental property is hidden for rental marketplace availability.
- Missing required advertising license hides marketplace visibility.
- Missing required ownership or usufruct authority hides marketplace visibility.
- Marketplace payload must exclude sensitive owner, tenant, document, and internal review fields.

CRM visibility:

- CRM visibility is allowed only for the owning publisher or explicitly authorized CRM integration.
- CRM visibility may include internal lifecycle state.
- CRM visibility may show sold, off-market, withdrawn, expired, or suppressed records if scoped to the owning publisher.
- CRM visibility must not imply marketplace availability.
- CRM visibility must not override hub canonical state.
- CRM visibility receives suppression state so the CRM can stop pushing stale claims.

Workspace visibility:

- Workspace visibility is scoped by workspace authorization.
- Workspace visibility may show internal review state only when workspace role permits it.
- Workspace visibility cannot see sensitive documents unless `documents.sensitive.read` is granted.
- Workspace visibility is revoked when workspace authorization expires.

Legal/Government visibility:

- Legal/Government visibility can see hidden records if authorized.
- Legal/Government visibility can see compliance holds, approval history, and suppression reasons when scoped.
- Legal/Government visibility is read-only by default.
- Legal/Government visibility must be granted by compliance officer or platform admin.
- Legal/Government visibility must audit every sensitive read.

Publisher private visibility:

- Publisher private visibility shows publisher-owned submissions and canonical properties.
- Publisher private visibility shows review state and requested evidence.
- Publisher private visibility does not grant approval rights.
- Publisher private visibility does not grant distribution rights.

Partner visibility:

- Partner visibility is controlled by integration authorization.
- Partner visibility must be scoped by partner app, connected platform, organization, and scopes.
- Partner visibility cannot include unapproved property data unless the partner is explicitly authorized for review tooling.

Analytics visibility:

- Analytics visibility must prefer aggregate or redacted data.
- Analytics visibility must exclude direct personal data.
- Analytics visibility must exclude sensitive documents.
- Analytics visibility must not expose exact hidden-property reasons if that would leak sensitive legal or owner information.

Suppression visibility:

- Suppression visibility exists to remove, hide, or mark unavailable data downstream.
- Suppression events are sent when a previously distributed property becomes hidden.
- Suppression events include minimum required identifiers and reason codes allowed by platform scope.
- Suppression visibility must never be blocked because a marketplace platform cannot see the full hidden record.

Per-platform visibility summary:

- Store current visibility in `connectedPlatformVisibility`.
- Store global evaluation history in `visibilityEvaluations`.
- Store outbound suppression in `distributionEvents`.
- Do not recompute visibility from scratch inside a feed endpoint.
- Recompute visibility when canonical version, lifecycle status, organization status, integration status, evidence status, or visibility policy changes.

Required visibility states:

- `visible`
- `hidden`
- `limited`
- `suppressed`
- `pending_review`
- `not_authorized`

Required hard-hide lifecycle inputs:

- `sold`
- `off_market`
- `withdrawn`
- `expired`
- `rejected`
- `suspended`
- `under_dispute`
- `leased_ejar`
- `manual_hide`
- `compliance_hold`
- `regulatory_hold`
- `publisher_suspended`
- `platform_suspended`

## 8. Synchronization Rules

- Hub canonical property wins.
- External systems submit claims.
- External systems do not submit truth.
- A submission is a claim until approved.
- An approved submission creates or updates a canonical property version.
- Property versions are immutable.
- The current canonical property points to the latest approved version.
- Sync conflicts become reviewable submissions.
- Sync conflicts do not automatically overwrite canonical data.
- Source record IDs are stored for traceability.
- Idempotency keys are required for inbound mutations.
- Outbound webhook events use event IDs as idempotency keys.
- Same inbound idempotency key and same request body returns the original response.
- Same inbound idempotency key and different request body returns conflict.
- Distribution events send scoped payloads.
- Hidden transitions send suppression or withdrawal events.
- Rejected submissions do not distribute marketplace payloads.
- Suspended integrations do not receive distribution events except permitted suspension notices.
- Every sync job has status: `queued`, `processing`, `delivered`, `failed`, `dead_letter`, or `cancelled`.
- Every sync job stores attempts.
- Every failed sync job stores last error.
- Every dead-letter job is visible in the synchronization monitor.
- Retrying dead-letter jobs requires permission and reason.

Required synchronization event types:

- `submission.received`
- `submission.normalized`
- `submission.conflict_detected`
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
- `suppression.enqueued`
- `suppression.delivered`

## 9. Validation Rules

- All public API schemas use Zod.
- All webhook schemas use Zod.
- All form schemas use Zod.
- All environment schemas use Zod.
- Use `@hookform/resolvers/zod` for ShadCN form flows.
- Never use `null`.
- Use omitted optional fields for absent data.
- Use explicit state literals for known absence.
- Do not use weak string statuses.
- Do not accept arbitrary status strings from external systems.
- External status values must be mapped through Zod and normalization.
- Use discriminated unions for property category, transaction intent, lifecycle status, visibility type, sync event type, and webhook event type.
- Saudi fields must be explicit.
- Do not hide Saudi identifiers in generic metadata.
- Do not accept property payloads without `countryCode: "SA"`.
- Do not accept marketplace distribution payloads without required approval state.

Required Saudi field groups:

- RER: `rerPropertyNumber`, `realEstateSheetNumber`.
- Title deed: `titleDeedNumber`, `titleDeedDate`, `titleDeedSource`.
- Planning: `planNumber`, `plotNumber`, `blockNumber`.
- Location: `region`, `city`, `district`, `neighborhood`, `nationalAddress`, `latitude`, `longitude`.
- Ejar: `ejarContractId`, `ejarStatus`.
- Wafi: `wafiLicenseNumber`, `wafiDeveloperNumber`, `offPlanProjectId`.
- REGA: `regaLicenseNumber`, `advertisingLicenseNumber`.
- Ownership restriction: `nonSaudiOwnershipZoneCode`, `nonSaudiOwnershipAllowed`, `ownershipRestrictionNotes`.

Required validation files:

```text
lib/contracts/property-submission.ts
lib/contracts/sync-event.ts
lib/contracts/webhook-event.ts
domains/visibility/schema.ts
domains/authorization/schema.ts
domains/organization/schema.ts
features/*/schemas/*.ts
```

## 10. Security Rules

- Hash API keys.
- Store only API key prefix and hash.
- Show raw API key once.
- Sign outbound webhooks.
- Verify inbound webhook signatures when inbound webhooks are added.
- Redact sensitive payloads by visibility scope.
- Redact owner personal data by default.
- Redact tenant personal data by default.
- Redact document URLs by default.
- Audit sensitive document reads.
- Audit export creation.
- Audit integration approval.
- Audit visibility override.
- Audit Legal/Government visibility grant.
- Never log secrets.
- Never log raw personal data.
- Never log full document contents.
- Never expose Better Auth session tokens in logs.
- Rate-limit auth endpoints.
- Rate-limit API ingestion.
- Rate-limit webhook tests.
- Rate-limit exports.
- Rate-limit manual retries.
- KSA-primary data residency remains the default production posture.
- Cross-border access or transfer requires documented approval.
- Production environment variables must be validated at startup.
- Missing production secrets must fail closed.
- Local fallback secrets are allowed only in non-production.

High-risk actions requiring reason:

- approve submission;
- reject submission;
- merge property;
- manual hide;
- lift manual hide;
- place compliance hold;
- lift compliance hold;
- grant Legal/Government visibility;
- approve integration;
- suspend integration;
- rotate API key;
- export audit data;
- retry dead-letter distribution.

## 11. Caching Strategy

- Convex reactive data is used for admin operational state.
- Do not publicly cache sensitive admin data.
- Do not use Next.js static caching for authenticated hub pages.
- Use no-store behavior for pages that display submissions, properties, audit logs, organizations, integrations, or sensitive settings.
- Cache static documentation only.
- Use Convex Aggregate component for dashboard counters when repeated counts would scan or paginate tables.
- Use Convex Aggregate component for queue counts when needed.
- Store per-platform visibility summaries in `connectedPlatformVisibility`.
- Store synchronization state in sync job tables.
- Do not recompute per-platform visibility inside feed endpoints.
- Feed endpoints read stored visibility summaries.
- Webhook delivery reads stored distribution event payloads.
- Redaction must happen before payload persistence when the payload is target-platform-specific.
- If payload is stored before redaction, the stored payload must be restricted as sensitive.

## 12. ShadCN/UI Rules

- Use official ShadCN/UI components for primitives.
- Do not create custom primitive Button.
- Do not create custom primitive Table.
- Do not create custom primitive Dialog.
- Do not create custom primitive AlertDialog.
- Do not create custom primitive Badge.
- Do not create custom primitive Input.
- Do not create custom primitive Select.
- Do not create custom primitive DropdownMenu.
- Feature components compose ShadCN primitives.
- ShadCN primitives live in `components/ui`.
- Feature-specific wrappers live in `features/<feature>/components`.
- Lucide React is the only icon source.
- Icon-only buttons require accessible labels.
- Every destructive action uses Dialog or AlertDialog.
- Every destructive action requires visible reason input unless the action is a harmless retry.
- Approval dialogs must show authoritative field impact.
- Visibility dialogs must show downstream synchronization impact.
- Integration secret dialogs must show secret once.
- Tables must show loading state.
- Tables must show empty state.
- Tables must show error state.
- Tables must show permission-denied state when authorization fails.
- Do not use in-app explanatory marketing text.
- Do not create a landing page for the hub.

## 13. Code Organization Rules

- One logic per file.
- One domain decision per pure function.
- Keep pure domain functions free of Convex context.
- Keep Convex functions thin.
- Keep React components free of authorization business logic.
- Keep Zod schemas outside React components unless the schema is feature-local form validation.
- Heavy comments are required only for authorization, visibility, synchronization conflict handling, Saudi compliance assumptions, security-sensitive code, and non-obvious Convex Component integration.
- Do not comment obvious assignments.
- Do not create decorative abstractions.
- Do not combine visibility evaluation and payload redaction in one function.
- Do not combine idempotency and normalization in one function.
- Do not combine approval and distribution in one function.
- Do not combine organization membership and property ownership in one function.
- No mixed UI/domain files.
- No direct cross-project imports from `partners`.
- No direct import from `partners/convex/_generated`.
- No shared global mutable state for authorization.
- No untyped JSON parsing.
- No unvalidated request body.
- No raw `fetch` webhook sender without signing and retry wrapper.
- No table scan for dashboard counters when Aggregate component is available and appropriate.

Required pure function categories:

- validation mapping;
- authorization decision;
- visibility evaluation;
- payload redaction;
- duplicate/conflict detection;
- idempotency key comparison;
- Saudi field normalization;
- synchronization event construction.

## 14. Testing Rules

Required unit tests:

- visibility evaluator;
- authorization `can()` function;
- organization integration authorization;
- Zod property submission validation;
- Zod visibility policy validation;
- Zod webhook event validation;
- synchronization conflict detection;
- payload redaction;
- idempotency comparison;
- Saudi field normalization.

Required integration tests:

- submission received -> normalized -> pending review.
- submission approved -> property version created.
- property approved -> marketplace visibility evaluated.
- sold property -> marketplace hidden -> suppression event enqueued.
- off-market property -> marketplace hidden -> suppression event enqueued.
- CRM visibility retains owning-publisher internal state.
- Legal/Government visibility can read hidden record when authorized.
- suspended integration stops distribution.
- dead-letter distribution can be retried only with permission and reason.

Required contract tests:

- inbound property submission schema.
- status update schema.
- visibility policy schema.
- sync event schema.
- webhook event schema.
- standard error schema.

Required UI smoke tests:

- dashboard renders authorized state.
- submissions inbox renders table states.
- submission review renders tabs.
- property detail renders visibility tab.
- synchronization monitor renders dead-letter state.
- integrations page renders authorization actions.
- organizations page renders role state.
- audit page renders filtered table.
- settings page renders security and visibility policy sections.

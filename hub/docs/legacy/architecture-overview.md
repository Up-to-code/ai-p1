# Ara Strict Mode - ARCHITECTURE-OVERVIEW.md Full System Architecture

Current date: May 2026.

Platform: Saudi Arabia Central Real Estate Data Hub. This is a true synchronization engine. External CRMs, mobile apps, developer systems, publisher systems, government/legal observers, workspace tools, and partner platforms push property data and changes into the hub. The hub validates incoming data, runs approval workflows when required, creates or updates canonical property state, computes the correct visibility per connected platform and audience, and synchronizes authoritative state back to all approved systems.

Mandatory stack:

- Next.js `16.2.4+` App Router.
- TypeScript.
- Convex Database.
- Better Auth `1.6.9` with OAuth 2.1 Provider plugin.
- Better Auth Organization plugin.
- `@convex-dev/better-auth` `0.12.2`.
- ShadCN/UI.
- Tailwind CSS.
- Lucide React.
- Zod.

Plain Convex Auth is forbidden.

## 1. Product Vision & Core Concept

### 1.1 Product Vision

The Saudi Arabia Central Real Estate Data Hub is the authoritative synchronization layer for Saudi property data. It is not a CRM. It is not a marketplace. It is not a listing website. It is the controlled source of truth that receives data claims, validates them, determines authority, controls visibility, and synchronizes approved state to connected platforms.

The hub exists because real estate data in Saudi Arabia has multiple authorities and multiple visibility obligations:

- A CRM may know what a publisher entered.
- A developer app may know a project update.
- A marketplace may show only externally visible inventory.
- Ejar may determine lease state.
- Real Estate Registry concepts may determine title deed and property identity references.
- REGA-related licensing, brokerage, advertising, and registration constraints affect what data can be trusted and distributed.
- Legal/government observers may require visibility into records that are not marketplace-visible.

The hub turns fragmented property claims into controlled synchronized state.

### 1.2 Core Concept

Every external system submits claims.

The hub determines truth.

Approved truth becomes canonical.

Canonical state is distributed according to visibility rules.

Visibility is not one boolean. Visibility is a matrix:

```txt
Property
  x Platform
  x Organization
  x Audience
  x Channel
  x Lifecycle status
  x Legal/compliance status
  x Consent/scope
  x Approval state
  = Visible or hidden with reason
```

### 1.3 Core Responsibilities

The hub owns:

- Inbound property data ingestion.
- Payload validation.
- Saudi-specific property normalization.
- Duplicate detection.
- Canonical property identity.
- Submission review.
- Compliance review.
- Approval/rejection.
- Canonical property versioning.
- Visibility computation.
- Marketplace suppression.
- CRM/workspace/legal visibility separation.
- Distribution event creation.
- Webhook delivery.
- Sync retry.
- Dead-letter handling.
- Full audit trail.
- OAuth authorization provider behavior.
- Organization-scoped access.
- Developer integration approval.

### 1.4 Explicit Non-Goals

The hub does not own:

- CRM pipeline management.
- Lead management.
- Buyer inquiry management.
- Marketplace search UX.
- Marketing pages for properties.
- Negotiation workflow.
- Payment collection.
- Brokerage workflow beyond required data/compliance fields.

### 1.5 Saudi-Specific Authority Context

The architecture must account for official Saudi real estate concepts:

- REGA Real Estate Registry describes real estate records, property numbers, title deed information, ownership registration deeds, and geospatially surveyed property identity in announced real estate areas.
- The Law of Real Estate Registration defines the real estate register as records containing property description, location, physical condition, legal status, rights, obligations, and modifications.
- Real Estate Registration regulations and REGA materials reference property registration deed, previous title deed number/date/source, property number, maps, boundaries, area, restrictions, obligations, and ownership data.
- Ejar is the official rental services network for regulating rental contracts and lease registration. Ejar materials describe lease registration as an official approved reference for residential and commercial lease relationships.
- Saudi PDPL requirements create obligations around personal data processing, data breach reporting, access controls, minimization, and breach notification within 72 hours where applicable.

Architecture implication:

- Property identity must support RER/property number and title deed references.
- Lease state must support Ejar references.
- Ownership and legal fields must be access-controlled.
- Marketplace visibility must be suppressible when sold, leased, withdrawn, off-market, expired, rejected, suspended, disputed, or manually hidden.
- Audit records must be regulator-ready.

## 2. Authorization System (OAuth 2.1 Provider)

### 2.1 Authorization System Decision

The hub acts as an OAuth 2.1 Provider using Better Auth OAuth Provider plugin.

The hub supports "Continue with Anand" for third-party apps.

The hub uses Better Auth Organization plugin for tenant organization membership and role context.

The hub uses Convex for resource authorization, canonical data, visibility, sync, audit, and organization projections.

### 2.2 Authorization Boundary

Better Auth owns:

- User authentication.
- Sessions.
- OAuth clients.
- OAuth authorization code flow.
- PKCE enforcement.
- Consent endpoint.
- Token endpoint.
- Refresh tokens.
- Token revocation.
- Token introspection.
- OIDC userinfo when `openid` is granted.
- Organization records and memberships.
- Organization roles and Better Auth access-control primitives.

Convex hub owns:

- Resource authorization.
- Scope-to-permission mapping.
- Publisher self-approval denial.
- Visibility access.
- Integration approval.
- Platform distribution authorization.
- Audit.
- Data redaction.
- Canonical property access.

Rule:

```txt
OAuth scope permits a client to request access.
Organization membership permits a user to act for a tenant.
Hub permissions permit a specific action.
Visibility rules decide which fields and records can leave the hub.
```

### 2.3 "Continue with Anand" Flow

"Continue with Anand" is OAuth 2.1 Authorization Code + PKCE.

Flow:

1. Third-party app displays `Continue with Anand`.
2. User clicks the button.
3. Third-party app generates `state`.
4. Third-party app generates PKCE `code_verifier`.
5. Third-party app derives `code_challenge` using SHA-256 and base64url.
6. Third-party app opens popup or full-page redirect to Anand authorization endpoint.
7. Anand validates OAuth client.
8. Anand validates redirect URI exact match.
9. Anand validates requested scopes.
10. Anand validates resource audience.
11. User signs in if no active session exists.
12. User selects organization if organization scopes are requested.
13. Anand shows consent screen.
14. User grants or denies access.
15. Anand redirects to third-party callback with authorization code, state, and issuer.
16. Third-party app validates `state`.
17. Third-party app validates issuer.
18. Third-party app exchanges code plus original verifier at token endpoint.
19. Anand returns access token and optionally refresh token.
20. Third-party app calls hub resource APIs with bearer token.
21. Hub validates token, scope, organization, client approval, permissions, and visibility.

Authorization request:

```txt
GET https://hub.anand.sa/api/auth/oauth2/authorize
  ?response_type=code
  &client_id=anand_client_123
  &redirect_uri=https%3A%2F%2Fcrm.example.com%2Foauth%2Fanand%2Fcallback
  &scope=openid%20profile%20email%20organization.read%20properties.read%20properties.sync
  &state=CLIENT_RANDOM_STATE
  &code_challenge=BASE64URL_SHA256_CODE_VERIFIER
  &code_challenge_method=S256
  &resource=https%3A%2F%2Fapi.anand.sa%2Fhub
```

Rules:

- `response_type=code` only.
- PKCE required.
- `code_challenge_method=S256` only.
- `plain` PKCE forbidden.
- `state` required by hub policy.
- Redirect URI exact match.
- HTTPS required in production.
- Token exchange must not expose client secret in browser.

### 2.4 Organization and Organization-Level Login

User login is personal first.

Hub action is organization-context second.

Flow:

1. User authenticates with Better Auth.
2. Better Auth session identifies the user.
3. Organization plugin lists organizations where user is a member.
4. User selects active organization.
5. Better Auth active organization context is set.
6. Organization membership resolves role.
7. Consent screen binds access grant to selected organization.
8. Token includes or references organization context.
9. Convex resource APIs enforce organization access.

Required organization types:

```ts
export const hubOrganizationTypes = [
  "platform_operator",
  "publisher_developer",
  "integration_partner",
  "government_legal_observer",
  "internal_workspace",
] as const;
```

Required roles:

```ts
export const hubOrganizationRoles = [
  "owner",
  "admin",
  "integration_admin",
  "publisher_manager",
  "publisher_editor",
  "reviewer",
  "compliance_officer",
  "auditor",
  "legal_observer",
  "workspace_viewer",
  "support_operator",
] as const;
```

Role meanings:

- `owner`: owns organization administration and OAuth app registration inside organization.
- `admin`: manages organization settings and members, except owner-only actions.
- `integration_admin`: registers clients, URLs, webhook endpoints, and integration approval requests.
- `publisher_manager`: manages publisher data workflows.
- `publisher_editor`: submits property claims and corrections.
- `reviewer`: reviews submissions when self-approval denial permits it.
- `compliance_officer`: approves compliance-restricted visibility.
- `auditor`: reads audit records within scope.
- `legal_observer`: reads approved legal/government visibility.
- `workspace_viewer`: reads workspace-scoped records.
- `support_operator`: support access only.

### 2.5 Consent Screen and Permission Granting

Consent screen must show:

- App name.
- App owner organization.
- App environment: sandbox or production.
- App verification status.
- Redirect domain.
- Selected organization granting access.
- Requested scopes.
- Explanation per scope.
- Whether offline access is requested.
- Data categories affected.
- Risk indicator for high-risk scopes.

Consent actions:

- `Allow access`.
- `Deny`.
- `Change organization`.
- `Cancel`.

Consent rules:

- Third-party production apps require consent.
- Trusted first-party apps may skip consent only when explicitly configured.
- Consent does not bypass hub approval.
- Consent does not bypass visibility.
- Consent does not bypass Saudi compliance restrictions.
- Consent is tied to organization context.

### 2.6 Recommended Scopes

Identity:

- `openid`
- `profile`
- `email`
- `offline_access`

Organization:

- `organization.read`
- `organization.members.read`

Property:

- `properties.read`
- `properties.write`
- `properties.sync`
- `properties.visibility.read`
- `properties.visibility.write`

Submissions:

- `submissions.read`
- `submissions.write`
- `submissions.review`

Webhooks:

- `webhook.read`
- `webhook.manage`

Integrations:

- `integrations.read`
- `integrations.manage`

Audit:

- `audit.read`

MCP future:

- `mcp.tools.read`
- `mcp.tools.call`

Scope-to-permission rule:

```ts
export const oauthScopePermissionMap = {
  "organization.read": ["organizations:read_active"],
  "properties.read": ["properties:read", "visibility:read_scoped"],
  "properties.write": ["submissions:create", "properties:submit_claim"],
  "properties.sync": ["synchronization:read", "synchronization:write"],
  "webhook.manage": ["webhooks:update_own", "webhooks:test_own"],
  "integrations.manage": ["integrations:update_own", "integrations:request_approval"],
  "audit.read": ["audit:read_scoped"],
} as const;
```

### 2.7 Better Auth Organization Plugin Usage

Use Organization plugin for:

- Organization creation lifecycle.
- Membership.
- Invitation.
- Active organization.
- Role assignment.
- Permission statements.

Do not use Organization plugin for:

- Property approval.
- Visibility computation.
- Sync conflict resolution.
- Legal/government access final decision.
- Saudi compliance validation.

Convex projection required:

- `organizationProfiles`: hub-specific organization type/status.
- `membershipProfiles`: indexed membership/role projection.
- `oauthClientProfiles`: hub review and integration approval state.

## 3. Developer Integration Experience

### 3.1 Developer Registration Flow

Flow:

1. Developer creates account in separate developer integration project.
2. Developer creates or joins integration partner organization.
3. Developer registers an app.
4. Developer enters app name, owner organization, support URL, privacy URL, terms URL.
5. Developer selects app type: public or confidential.
6. Developer enters redirect URIs.
7. Developer enters allowed origins.
8. Developer enters webhook URLs.
9. Developer requests scopes.
10. Hub validates URLs and scope request.
11. Hub creates sandbox OAuth client.
12. Developer receives Client ID.
13. Confidential client receives Client Secret once.
14. Developer tests "Continue with Anand".
15. Developer submits production review.
16. Platform admin or integration security officer approves production.

### 3.2 Client ID and Secret

Rules:

- `client_id` is public.
- `client_secret` is confidential.
- Public clients use PKCE and no secret.
- Confidential clients keep secret server-side.
- Client Secret shown once.
- Client Secret rotation invalidates prior secret.
- Client Secret is not an API key.

### 3.3 Trusted URLs

Developer must register:

- Redirect URIs.
- Allowed origins.
- Webhook URLs.
- Support URL.
- Privacy URL.
- Terms URL.

Validation:

- HTTPS required in production.
- Exact redirect match only.
- No wildcard production redirect URIs.
- No private IP ranges.
- No localhost in production.
- No userinfo in URLs.
- No fragments.
- No redirect chain to untrusted host.
- Webhook endpoint must pass challenge test.
- Production URL changes require review.

### 3.4 Popup Authorization Implementation

Developer button:

```ts
import { AnandOAuthClient } from "@anand/sdk";

const anand = new AnandOAuthClient({
  clientId: process.env.NEXT_PUBLIC_ANAND_CLIENT_ID!,
  redirectUri: "https://crm.example.com/oauth/anand/callback",
  resource: "https://api.anand.sa/hub",
  scopes: [
    "openid",
    "profile",
    "email",
    "organization.read",
    "properties.read",
    "properties.sync",
  ],
});

document.querySelector("#continue-with-anand")?.addEventListener("click", () => {
  anand.authorizeWithPopup();
});
```

Popup mechanics:

- Generate `state`.
- Generate PKCE verifier.
- Store verifier temporarily.
- Open Anand OAuth URL in popup.
- Complete callback.
- Validate issuer and state.
- Exchange authorization code.
- Notify opener through `postMessage`.
- Parent verifies message origin.
- Popup closes.

### 3.5 Official SDK Package

Package:

```txt
@anand/sdk
```

SDK responsibilities:

- Build authorization URL.
- Generate PKCE verifier/challenge.
- Generate and verify state.
- Open popup.
- Provide redirect fallback.
- Exchange authorization code on server.
- Refresh access token.
- Wrap API calls.
- Add idempotency keys.
- Verify webhook signatures.
- Provide Express middleware.
- Provide Next.js route handler helpers.
- Provide TypeScript types for scopes, tokens, webhook events, property claims, and sync payloads.

SDK does not:

- Approve integrations.
- Bypass consent.
- Store client secrets in browser.
- Decide visibility.
- Convert submitted claims into canonical truth.

SDK structure:

```txt
packages/
  sdk/
    src/
      auth/
        anand-oauth-client.ts
        pkce.ts
        state.ts
        token-exchange.ts
        token-store.ts
      api/
        anand-api-client.ts
        request.ts
        errors.ts
      webhooks/
        verify-signature.ts
        express-middleware.ts
        next-route-handler.ts
      types/
        scopes.ts
        tokens.ts
        property.ts
        submissions.ts
        webhooks.ts
      index.ts
```

SDK class:

```ts
export class AnandOAuthClient {
  constructor(
    private readonly config: {
      clientId: string;
      redirectUri: string;
      resource: string;
      scopes: string[];
      issuer?: string;
    }
  ) {}

  async authorizeWithPopup() {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();

    saveTransientOAuthState({ verifier, state });

    const url = this.buildAuthorizeUrl({ challenge, state });
    return openOAuthPopup(url);
  }

  buildAuthorizeUrl(input: { challenge: string; state: string }) {
    const issuer = this.config.issuer ?? "https://hub.anand.sa/api/auth";
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state: input.state,
      code_challenge: input.challenge,
      code_challenge_method: "S256",
      resource: this.config.resource,
    });

    return `${issuer}/oauth2/authorize?${params}`;
  }
}
```

Webhook middleware:

```ts
import { verifyAnandWebhook } from "@anand/sdk/webhooks";

export async function POST(request: Request) {
  const body = await request.text();
  const event = verifyAnandWebhook({
    body,
    headers: request.headers,
    secret: process.env.ANAND_WEBHOOK_SECRET!,
  });

  await handleEvent(event);
  return new Response(null, { status: 204 });
}
```

## 4. Synchronization & Visibility Engine

### 4.1 Synchronization Principle

External systems push claims. The hub owns authoritative state after validation and approval.

The hub never treats a third-party update as automatically canonical.

### 4.2 Visibility Types

Marketplace visibility:

- External public listing visibility.
- Strictest visibility type.
- Hidden when property is sold, off-market, withdrawn, expired, rejected, suspended, under dispute, manually hidden, or leased when withdrawal is required.

CRM visibility:

- Internal visibility for owning publisher or approved CRM integration.
- May retain records hidden from marketplace.
- Must stay scoped to owning organization and approved CRM platform.

Workspace Tool visibility:

- Internal operational visibility for approved workspaces.
- Can show draft, review, or suppressed records only when role permits it.

Legal/Government visibility:

- Regulator, legal, audit, compliance, and government-approved visibility.
- Can see hidden records only when explicitly authorized.
- Requires compliance officer or platform admin approval.

Partner visibility:

- Platform-specific partner access.
- Redacted by app scopes, organization consent, platform approval, and visibility policy.

Analytics visibility:

- Aggregated operational visibility.
- Must not expose personal data or sensitive legal data unless explicitly approved.

Suppression visibility:

- Negative visibility state.
- Records why a platform must hide or withdraw a property.

### 4.3 Visibility Decision Inputs

Inputs:

- Property lifecycle status.
- Submission approval status.
- Canonical version status.
- Publisher organization status.
- Connected platform status.
- OAuth client approval state.
- Requested scope.
- Organization consent.
- Visibility policy.
- Property transaction status.
- Ejar lease state.
- RER/title deed confidence.
- Compliance flags.
- Manual hide flag.
- Legal dispute flag.
- Expiry date.
- Media/document approval state.

### 4.4 Visibility Evaluation Output

```ts
type VisibilityEvaluation = {
  propertyId: string;
  platformId: string;
  organizationId: string;
  visibilityType:
    | "marketplace"
    | "crm"
    | "workspace"
    | "legal_government"
    | "partner"
    | "analytics"
    | "suppression";
  isVisible: boolean;
  redactionProfile: "public" | "partner" | "publisher_private" | "legal";
  reasons: string[];
  evaluatedAt: number;
};
```

### 4.5 Sold or Off-Market Behavior

When property becomes sold:

1. Hub receives sold claim or admin marks sold.
2. Hub validates source and authority.
3. If approval is required, creates submission.
4. Approved sold state updates canonical version.
5. Marketplace visibility becomes false.
6. Suppression event is created for every platform that previously received marketplace-visible state.
7. CRM visibility may remain true only for owning publisher/approved CRM.
8. Legal/Government visibility may remain true for authorized observers.
9. Audit records are written.

When property becomes off-market:

1. Lifecycle status becomes `off_market`.
2. Marketplace visibility becomes false.
3. Distribution sends withdrawal/suppression event.
4. Property remains in canonical history.
5. Re-publication requires new approved state.

Suppression event example:

```json
{
  "eventType": "property.suppressed",
  "propertyId": "property_123",
  "reason": "sold",
  "effectiveAt": 1770000000000,
  "visibilityType": "marketplace",
  "platformId": "platform_456"
}
```

## 5. Data Flow

### 5.1 End-to-End Flow

1. External system authenticates with OAuth token or approved API key.
2. External system submits property payload or change event.
3. Hub rate-limits request.
4. Hub validates token/key.
5. Hub validates organization and platform authorization.
6. Hub checks idempotency key.
7. Hub validates payload with Zod.
8. Hub normalizes Saudi-specific fields.
9. Hub checks duplicate candidates.
10. Hub determines whether approval is required.
11. If approval required, hub creates submission.
12. Admin/reviewer reviews submission.
13. Compliance officer reviews restricted cases.
14. Approved submission creates canonical property version.
15. Rejected submission records rejection reason.
16. Visibility engine recomputes visibility for all connected platforms.
17. Synchronization engine creates distribution events.
18. Webhook sender delivers scoped payloads.
19. Delivery success/failure recorded.
20. Failed deliveries retry.
21. Exhausted deliveries move to dead-letter state.
22. Audit records are written for every sensitive transition.

### 5.2 Inbound Payload Categories

Create:

- New property/project claim.

Update:

- Change to existing property data.

Lifecycle:

- Sold.
- Off-market.
- Withdrawn.
- Leased.
- Expired.
- Reactivated.

Visibility request:

- Request hide/show by platform or channel.

Document:

- Title deed reference.
- Ejar reference.
- Wafi/off-plan reference.
- Media/document evidence.

### 5.3 Canonical Versioning

Rules:

- Every approved change creates a property version.
- Current canonical property points to latest approved version.
- Rejected submissions do not update canonical state.
- Hidden state does not delete canonical history.
- Every synchronization event references property version ID.

### 5.4 Outbound Sync Events

Events:

- `property.created`
- `property.updated`
- `property.visibility.changed`
- `property.suppressed`
- `property.unsuppressed`
- `submission.rejected`
- `integration.suspended`

Outbound rules:

- Payload is redacted before queueing.
- Payload includes idempotency key.
- Payload is signed.
- Retry is bounded.
- Dead-letter is visible to admins.

## 6. Backend Architecture & Folder Structure

### 6.1 SOLID Rules

Single Responsibility:

- One file owns one decision.
- Validation files validate.
- Authorization files authorize.
- Visibility files compute visibility.
- Sync files enqueue/distribute.
- Repositories persist.

Open/Closed:

- Add new visibility type through new policy entry, not by rewriting every function.
- Add new scope through scope map entry and tests.

Liskov:

- Token verifiers implement same interface.
- Webhook senders implement same interface.

Interface Segregation:

- Small interfaces for token verification, permission assertion, visibility evaluation, distribution.

Dependency Inversion:

- Domain use cases depend on interfaces.
- Convex functions wire concrete implementations.

### 6.2 Required Folder Structure

```txt
hub/
  app/
    (auth)/
    (hub)/
    api/
  components/
    ui/
    layout/
    feedback/
  convex/
    _generated/
    betterAuth/
      auth.ts
      permissions.ts
      schema.ts
    authProvider/
      oauthClients.ts
      oauthConsents.ts
      tokenAudit.ts
    property/
      queries.ts
      mutations.ts
      actions.ts
    submission/
      queries.ts
      mutations.ts
      actions.ts
    visibility/
      queries.ts
      mutations.ts
      actions.ts
    synchronization/
      mutations.ts
      actions.ts
    integration/
      queries.ts
      mutations.ts
      actions.ts
    audit/
      queries.ts
      mutations.ts
    schema.ts
    http.ts
    convex.config.ts
    auth.config.ts
  domains/
    authorization/
      permissions.ts
      roles.ts
      can.ts
      assert-permission.ts
      oauth-scope-map.ts
      organization-access.ts
      resource-access.ts
      visibility-access.ts
    property/
      property-types.ts
      property-status.ts
      saudi-identifiers.ts
      normalize-property.ts
      property-conflict.ts
    submission/
      submission-status.ts
      submission-decision.ts
      requires-approval.ts
      normalize-submission.ts
    visibility/
      visibility-types.ts
      visibility-policy.ts
      evaluate-visibility.ts
      suppression-reasons.ts
      redact-property.ts
    synchronization/
      sync-event-types.ts
      distribution-policy.ts
      idempotency.ts
      retry-policy.ts
      conflict-detection.ts
    organization/
      organization-types.ts
      organization-projection.ts
    integration/
      trusted-redirect-uri.ts
      allowed-origin.ts
      webhook-policy.ts
      api-key-policy.ts
    compliance/
      rega-fields.ts
      ejar-fields.ts
      pdpl-redaction.ts
      audit-requirements.ts
  validations/
    property/
      saudi-property-submission.schema.ts
      property-update.schema.ts
      lifecycle-event.schema.ts
    visibility/
      visibility-policy.schema.ts
      suppression.schema.ts
    integration/
      oauth-client.schema.ts
      trusted-url.schema.ts
      webhook.schema.ts
    auth/
      scope.schema.ts
      consent.schema.ts
  lib/
    auth/
    crypto/
    http/
    logging/
    rate-limit/
    dates/
  tests/
    unit/
    integration/
    contract/
```

### 6.3 Convex Function Rules

Queries:

- Read data only.
- Enforce authorization.
- Redact before return.

Mutations:

- Change Convex state.
- Enforce authorization.
- Validate inputs.
- Write audit records when sensitive.

Actions:

- External calls only.
- Webhook delivery.
- Official registry checks when available.
- URL validation probes.

Rules:

- No direct cross-domain writes without use case function.
- No custom UI logic in Convex functions.
- No raw secret returned to client except one-time reveal flow.

## 7. Security & Compliance

### 7.1 Secure API Key Handling

Rules:

- OAuth preferred.
- API keys only for approved server-to-server or legacy ingestion cases.
- Raw API key shown once.
- Store hash only.
- Use high-entropy random secret.
- Scope API key to organization, platform, environment, endpoint group.
- Support expiry, rotation, revocation.
- Track last used timestamp and source metadata.
- Never log raw key.

### 7.2 Trusted URLs and Allowed Origins

Rules:

- Parse with `URL`.
- HTTPS required in production.
- Reject wildcard production origins.
- Reject localhost in production.
- Reject private IP ranges.
- Reject loopback.
- Reject link-local.
- Reject metadata service IPs.
- Reject userinfo.
- Reject fragments.
- Validate redirects.
- Revalidate on update.

### 7.3 Rate Limiting and IP Blocking

Use:

- Better Auth OAuth Provider rate limits for OAuth endpoints.
- `@convex-dev/rate-limiter` for hub APIs.
- Edge/WAF controls for broad IP blocking.
- App-level IP allow/block lists for integration-specific policy.

Rate-limit:

- OAuth authorize.
- OAuth token.
- OAuth register.
- OAuth introspection.
- API ingestion.
- API key failures.
- Webhook tests.
- Sync retries.
- Exports.
- Sensitive document reads.

### 7.4 XSS Protection

Rules:

- React escaping remains default.
- Do not render external property descriptions as HTML.
- Reject or sanitize rich HTML if ever accepted.
- No `dangerouslySetInnerHTML` for external data.
- Validate URL protocols.
- Reject `javascript:` URLs.
- Use CSP headers.

### 7.5 Saudi Regulatory Considerations

REGA / Real Estate Registry:

- Store property number where available.
- Store title deed references.
- Store previous title deed number/date/source where relevant.
- Store boundaries, area, location, rights, restrictions, obligations, and legal status where provided and authorized.
- Track confidence and verification status for RER-linked fields.

Ejar:

- Store Ejar lease reference where applicable.
- Use Ejar lease state to determine rental visibility and marketplace suppression where required.
- Lease data is sensitive and must be role/visibility protected.

PDPL:

- Minimize personal data.
- Redact personal data by visibility scope.
- Audit sensitive personal data access.
- Prepare 72-hour breach notification workflow where applicable.
- Avoid unnecessary cross-border transfer.
- Keep KSA-primary data residency posture documented.

Compliance rule:

- This architecture is a technical compliance plan, not legal advice.
- Production launch requires Saudi legal review.

## 8. Recommended Convex Components & Libraries

### 8.1 Required Convex Components

`@convex-dev/better-auth`

- Better Auth integration with Convex.
- Required for sessions, tokens, and Convex auth provider integration.

`@convex-dev/rate-limiter`

- Application-layer rate limiting.
- Use for ingestion, auth-related abuse controls, webhook tests, exports, retries.

`@convex-dev/workpool`

- Async work queue.
- Use for heavy validation, normalization, fanout, document checks, sync jobs.

`@convex-dev/workflow`

- Durable workflows.
- Use for submission-to-approval-to-visibility-to-distribution lifecycle.

`@convex-dev/action-retrier`

- Retry idempotent actions.
- Use for webhook delivery retries and external verification calls.

`@convex-dev/aggregate`

- Efficient counts and sums.
- Use for dashboard counters, queue counts, visibility summaries, sync health.

`@convex-dev/migrations`

- Data migrations.
- Use for schema evolution and backfills.

### 8.2 Conditional Convex Components

`@convex-dev/action-cache`

- Cache safe expensive external checks.
- Do not cache permissions or visibility decisions.

`@convex-dev/crons`

- Periodic jobs.
- Use for stale integration checks, retry sweeps, expiry scans.

`@convex-dev/r2`

- Object storage.
- Use only after KSA data residency/security review.

`@convex-dev/geospatial`

- Geospatial indexing.
- Use for duplicate detection and location validation.

### 8.3 Community Packages to Evaluate

`@vllnt/convex-api-keys`

- Candidate for API key create, validate, revoke, rotate, usage tracking.
- Must pass security review.

`convex-webhook-sender`

- Candidate for queued webhook delivery, retries, HMAC signing, delivery tracking.
- Must pass security review.

`@djpanda/convex-authz`

- Candidate for RBAC/ABAC/ReBAC graph lookup.
- Must remain behind hub-owned `can()` and `assertPermission()`.

### 8.4 Required TypeScript Libraries

`zod`

- All public API schemas.
- All form schemas.
- All integration configuration schemas.

`lucide-react`

- Icons in ShadCN buttons, badges, navigation, actions.

`react-hook-form` and `@hookform/resolvers`

- Forms with Zod resolver.

`@tanstack/react-table`

- Data table behavior.

`@tanstack/react-virtual`

- Large audit/sync/property tables.

`sonner`

- Toast notifications.

`recharts`

- Dashboard charts if needed.

`nuqs`

- URL-backed filters for admin pages.

### 8.5 Strict Final Architecture Rule

Components reduce plumbing.

Libraries reduce repetitive UI and validation work.

Neither replaces:

- Saudi property domain rules.
- Authorization checks.
- Visibility evaluation.
- Approval workflows.
- Sync conflict handling.
- Audit.
- Compliance restrictions.

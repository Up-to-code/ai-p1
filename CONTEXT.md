# Qentrah Context

This file gives architecture skills a shared domain language for Qentrah. Use these terms when proposing Modules, Interfaces, Seams, and Adapters.

## Runtime Apps

- **Workspace**: customer product runtime. Owns organizations, members, roles, OAuth consent, organization grants, partner resource APIs, Convex business data, and Better Auth OAuth runtime projection.
- **Partners**: developer portal. Owns partner developer accounts, app drafts, redirect URIs, allowed scopes, review status, published catalog state, platform APIs, docs, and sandbox OAuth.
- **Admin Review**: internal operator console. Reads partner submissions from Partners APIs and writes review decisions back to Partners.
- **Demo Partner App**: reference external partner product proving OAuth with PKCE, server-side token exchange, server-side token storage, and Workspace resource API calls.
- **Marketing**: public content app with no dependency on private runtime data.

## Source Of Truth

- **Partners app catalog**: partner app metadata, client id, redirect URIs, allowed scopes, publisher identity, review notes, and published status. Owned by Partners.
- **Partner app integration profile**: Partners-owned app information that explains what the app does and where it is in the integrate/debug/sandbox/workspace/production path. Includes category, description, support contact, webhook endpoint, policy links, and current integration mode.
- **OAuth runtime projection**: minimal Better Auth OAuth client state needed for Workspace to authorize/token partner apps. Owned operationally by Workspace, projected from Partners.
- **Organization partner grant**: Workspace Convex `organizationPartnerConnections` record binding an organization to a Partners app/client, approved scopes, status, authorizing user/member, expiry, and last verification time.
- **Partner resource access**: Workspace API enforcement that validates Better Auth token claims, organization grant state, scopes, and resource/action permission before business data is returned or mutated.
- **Data security backfill**: Workspace Convex job system for encrypting legacy plaintext data, redacting old fields, and tracking resumable migration progress.

## Important Flows

- **Partner app lifecycle**: developer creates app in Partners, submits for review, Admin approves/rejects/suspends through Partners, Partners publishes catalog state and sends minimal OAuth runtime projection to Workspace.
- **Organization consent**: organization owner/member opens Workspace OAuth consent, Workspace verifies requested app/client/scopes with Partners, Better Auth handles OAuth mechanics, Workspace stores only the organization grant.
- **Partner API request**: partner product sends a Better Auth access token to Workspace, Workspace parses canonical claims, checks `organizationPartnerConnections`, then routes to resource read/write logic.
- **Webhook delivery**: Workspace stores encrypted inbound/outbound payloads, signs outbound deliveries, retries with backoff, and records delivery state.

## Architecture Preferences

- Prefer a **deep Module** when it hides cross-app auth, service tokens, retry behavior, or Convex details behind a small Interface.
- Prefer an explicit **Seam** only when at least two Adapters exist or are genuinely needed.
- Shared packages should contain contracts or pure logic used by more than one app. They should not load app-specific secrets or import generated Convex APIs.
- Lifecycle docs under `docs/lifecycles/<slug>/` are the dependency map for connected workflows.

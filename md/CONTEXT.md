# Qentrah Context

This file gives architecture skills a shared domain language for Qentrah. Use these terms when proposing Modules, Interfaces, Seams, and Adapters.

## Runtime Apps

- **Workspace**: customer product runtime. Owns organizations, members, roles, partner app authorization, organization grants, WorkOS partner API key projection, partner resource APIs, Convex business data, and WorkOS AuthKit identity projection.
- **Partners**: developer portal. Owns partner developer accounts, app drafts, redirect URIs, allowed scopes, review status, published catalog state, platform APIs, docs, and sandbox integration tooling.
- **Admin Review**: internal operator console. Reads partner submissions from Partners APIs and writes review decisions back to Partners.
- **Demo Partner App**: reference external partner product proving partner app authorization, server-side WorkOS partner API key storage, and Workspace resource API calls.
- **Marketing**: public content app with no dependency on private runtime data.

## Source Of Truth

- **Work OS core records**: Workspace-owned business records for clients, opportunities, projects, tasks, calendar events, assets, automations, templates, and agents. These are the default product model across UI, APIs, MCP tools, partner resources, and AI context.
- **Workspace template**: Workspace-owned preset that applies labels, stages, statuses, views, custom fields, and automation recipes to core records. Real estate is a workspace template, not the default product model.
- **Custom field definition**: Template-scoped input definition with key, label, type, requirement state, options, applicable core records, and template id.
- **Custom field value**: Typed stored value for a custom field. Exactly one typed value channel should carry the value for the declared field type.
- **Record link**: Typed relationship between Work OS core records. Used to connect clients, opportunities, projects, tasks, calendar events, and assets without making every table know every other table.
- **Automation rule**: Workspace-owned rule that reacts to record creation, stage changes, due dates, or status changes and creates a task, schedules an event, sends a notification, or updates a field.
- **Partners app catalog**: partner app metadata, client id, redirect URIs, allowed scopes, publisher identity, review notes, and published status. Owned by Partners.
- **Partner app integration profile**: Partners-owned app information that explains what the app does and where it is in the integrate/debug/sandbox/workspace/production path. Includes category, description, support contact, webhook endpoint, policy links, and current integration mode.
- **Partner key projection**: Convex `workosPartnerApiKeys` state binding a WorkOS API key id to `partner_id`, Partners client id, Workspace organization, approved connection, permissions, status, expiry, and key metadata. Owned by Workspace.
- **Organization partner grant**: Workspace Convex `organizationPartnerConnections` record binding an organization to a Partners app/client, approved scopes, status, authorizing user/member, expiry, and last verification time.
- **Partner resource access**: Workspace API enforcement that validates a WorkOS partner API key, Convex key projection, organization grant state, scopes, and resource/action permission before business data is returned or mutated.
- **Data security backfill**: Workspace Convex job system for encrypting legacy plaintext data, redacting old fields, and tracking resumable migration progress.

## Important Flows

- **Partner app lifecycle**: developer creates app in Partners, submits for review, Admin approves/rejects/suspends through Partners, and Partners publishes catalog state for Workspace verification.
- **Organization authorization**: organization owner/member connects a partner app in Workspace, WorkOS AuthKit proves user and organization identity, Workspace verifies requested app/client/scopes with Partners, and Convex stores only the organization grant.
- **Partner key issuance**: Workspace issues a WorkOS organization API key only for an active `organizationPartnerConnections` grant, then records the WorkOS key id and partner tuple in Convex.
- **Partner API request**: partner product sends a WorkOS partner API key to Workspace, Workspace validates it with WorkOS, checks `workosPartnerApiKeys` and `organizationPartnerConnections`, then routes to resource read/write logic.
- **Webhook delivery**: Workspace stores encrypted inbound/outbound payloads, signs outbound deliveries, retries with backoff, and records delivery state.

## Architecture Preferences

- Prefer a **deep Module** when it hides cross-app auth, service tokens, retry behavior, or Convex details behind a small Interface.
- Prefer an explicit **Seam** only when at least two Adapters exist or are genuinely needed.
- Shared packages should contain contracts or pure logic used by more than one app. They should not load app-specific secrets or import generated Convex APIs.
- Lifecycle docs under `docs/lifecycles/<slug>/` are the dependency map for connected workflows.

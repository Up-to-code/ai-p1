# Enterprise Data Scale

This document defines repo-level data rules for larger enterprise deployments,
many organizations, many integrations, and many teams working in parallel.

## Data Ownership

| Data | Owner | Rule |
| --- | --- | --- |
| Organizations, members, roles, permissions | Workspace | Workspace is authoritative for customer organization access. |
| Partner app drafts, submissions, review state, catalog | Partners | Partners is authoritative for developer app lifecycle state. |
| OAuth runtime projection | Workspace | Workspace stores only the minimum runtime data needed to authorize and issue tokens. |
| Organization partner grants | Workspace | Grants bind an organization to an approved partner app and approved scopes. |
| Partner resource access | Workspace | Resource APIs enforce token claims, grants, scopes, and resource/action permissions. |
| Demo OAuth session | Demo Partner App | Demo storage is non-production reference behavior only. |
| Public content | Marketing | Public copy must not depend on private runtime state. |

## Isolation Rules

- Scope enterprise business data by organization.
- Keep partner developer identity separate from customer organization identity.
- Do not import another app's generated Convex APIs.
- Use explicit HTTP/API contracts between apps.
- Keep secrets, client secrets, access tokens, refresh tokens, and service
  tokens server-side.
- Keep browser-exposed configuration limited to public URLs, public client IDs,
  and non-sensitive flags.

## Integration Data Rules

- External partners call Workspace resource APIs through approved OAuth access.
- Partners app catalog data is projected into Workspace only as minimal OAuth
  runtime state.
- Resource handlers should receive an authorized context rather than rebuilding
  token, grant, and scope checks.
- Webhook payloads must be signed, auditable, retryable, and safe to redact.
- Integration logs must avoid raw secrets and unnecessary personal data.

## Retention And Auditability

- Retention policy belongs with the owning data domain.
- Audit events should name actor, organization, target resource, action,
  result, and correlation/request id where available.
- Sensitive payloads must be encrypted or redacted according to the owning
  domain's security docs.
- Migration and backfill work must be resumable and documented in lifecycle
  docs when it touches connected workflows.

## Team Scale Rules

- Teams should edit the smallest owning surface and link to shared policy docs.
- Repeated local README boilerplate should be replaced by parent index guidance
  unless the local file carries real ownership or export rules.
- Cross-app data changes require lifecycle docs and review from each affected
  owner.
- Enterprise data changes require explicit success states, failure states, and
  validation evidence in the implementation PR.

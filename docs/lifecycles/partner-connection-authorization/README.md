# Partner Connection Authorization

## Purpose

This lifecycle covers partner authorization between Partners, Workspace, WorkOS, Convex grants, and organization-scoped resource APIs. It exists so partner app creation/review, Workspace authorization, WorkOS partner API key issuance, Convex grant projection, and resource access remain aligned.

## Owner

- Owner app for app catalog and review: `apps/partners`
- Owner app for organization grants and partner APIs: `apps/workspace`
- Supporting app for review UI: `apps/admin`
- Shared package: `packages/partner-auth-core`

## Entrypoints

- Partner app creation/review/catalog: Partners app and Partners Admin/platform APIs.
- Partner catalog verification: Partners platform API.
- Workspace user/org identity: WorkOS AuthKit session and Convex membership projection.
- Partner connection UI: Workspace integrations routes and organization partner connection endpoints.
- Organization grant persistence: Workspace Convex `organizationPartnerConnections`.
- WorkOS partner API key projection: Workspace Convex `workosPartnerApiKeys`.
- Resource enforcement: Workspace partner API bearer-token guard that validates WorkOS keys plus Convex grants.

## Current Status

The intended state is source-of-truth split: Partners owns app metadata and review, WorkOS owns Workspace identity and partner API key validation, and Workspace Convex owns organization-approved grants, key projection, resource authorization, and audit history.

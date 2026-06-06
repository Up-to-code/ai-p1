# Partner Connection Authorization

## Purpose

This lifecycle covers partner authorization between Partners, Workspace, Convex grants, organization API keys, and organization-scoped resource APIs. It exists so partner app creation/review, Workspace authorization, Convex grant state, and resource access remain aligned.

## Owner

- Owner app for app catalog and review: `apps/partners`
- Owner app for organization grants and partner APIs: `apps/workspace`
- Supporting app for review UI: `apps/admin`
- Shared package: `packages/partner-auth-core`

## Entrypoints

- Partner app creation/review/catalog: Partners app and Partners Admin/platform APIs.
- Partner catalog verification: Partners platform API.
- Workspace user/org identity: Workspace session plus Convex membership and permission projection.
- Partner connection UI: Workspace integrations routes and organization partner connection endpoints.
- Organization grant persistence: Workspace Convex `organizationPartnerConnections`.
- Resource enforcement: Workspace partner API bearer-token guard that validates Workspace organization API keys and Convex key permissions.

## Current Status

The current source keeps the source-of-truth split: Partners owns app metadata and review, and Workspace Convex owns organization-approved grants, local organization API keys, resource authorization, and audit history. Legacy Better Auth/OAuth partner bearer tokens are rejected with `410`. WorkOS partner-key files described in older lifecycle history are not present in the current worktree, so future reviews should not assume a live WorkOS partner-key Adapter exists without adding it back explicitly.

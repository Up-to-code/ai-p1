# Partner Connection Authorization

## Purpose

This lifecycle covers partner OAuth authorization between Partners, Workspace, Better Auth, and organization-scoped resource APIs. It exists so partner app creation/review, OAuth runtime sync, user consent, organization grants, token claims, and resource access remain aligned.

## Owner

- Owner app for app catalog and review: `apps/partners`
- Owner app for organization grants and partner APIs: `apps/workspace`
- Supporting app for review UI: `apps/admin`
- Shared package: `packages/partner-auth-core`

## Entrypoints

- Partner app creation/review/catalog: Partners app and Partners Admin/platform APIs.
- Better Auth OAuth client runtime sync: Workspace admin runtime-sync endpoint.
- Partner catalog verification: Partners platform API.
- OAuth provider runtime: Workspace Better Auth OAuth provider.
- Consent UI: Workspace `/oauth/consent`.
- Organization grant persistence: Workspace Convex `organizationPartnerConnections`.
- Resource enforcement: Workspace partner API bearer-token guard.

## Current Status

The intended state is source-of-truth split: Partners owns app metadata and review, Better Auth owns OAuth 2.1 protocol mechanics, and Workspace Convex owns organization-approved grants.

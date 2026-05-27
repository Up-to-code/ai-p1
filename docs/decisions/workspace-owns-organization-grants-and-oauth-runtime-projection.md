# ADR: Workspace Owns Organization Grants And OAuth Runtime Projection

## Status

Accepted

## Context

Workspace hosts Better Auth OAuth authorize/token routes and owns organization-scoped business data. Partners owns app metadata, but Workspace must enforce organization consent and partner resource access.

## Decision

Workspace owns organization partner grants in `organizationPartnerConnections` and owns the Better Auth OAuth runtime projection required for OAuth mechanics. The projection is not a catalog; it is minimal runtime enforcement data.

## Consequences

- Organization grants store organization id, Partners app id, Partners client id, approved scopes, status, authorizing actor, expiry, and verification time.
- Workspace validates partner API calls using token claims plus the organization grant.
- Partners sends Workspace only OAuth runtime sync data: client id, client type, name/icon/homepage, redirect URIs, allowed scopes, and status.
- Callers should not need to know Better Auth adapter details or service-token headers.

# ADR: Workspace Owns Organization Grants And WorkOS Partner Key Projection

## Status

Accepted

## Context

Workspace owns organization-scoped business data and WorkOS AuthKit is now the Workspace identity/session provider. Partners owns app metadata and review, but Workspace must enforce organization authorization, partner key issuance, and partner resource access.

## Decision

Workspace owns organization partner grants in `organizationPartnerConnections` and owns the Convex `workosPartnerApiKeys` projection required to bind WorkOS API keys to Qentrah partner grants. The projection is not a catalog; it is minimal runtime enforcement data for partner API access.

## Consequences

- Organization grants store organization id, Partners app id, Partners client id, approved scopes, status, authorizing actor, expiry, and verification time.
- Workspace issues WorkOS partner API keys only after an active organization grant exists and the requested key permissions are a subset of approved scopes.
- Workspace validates partner API calls using WorkOS API key validation plus the Convex key projection and organization grant.
- Partners sends Workspace only catalog/verification data: app id, client id, redirect URIs, allowed scopes, app status, and public app metadata.
- Callers should not need to know WorkOS adapter details, Convex bridge tokens, or service-token headers.

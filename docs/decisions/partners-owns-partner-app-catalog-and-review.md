# ADR: Partners Owns Partner App Catalog And Review

## Status

Accepted

## Context

Partner app creation, review, redirect URIs, allowed scopes, publisher identity, review notes, and published status were previously easy to confuse with Workspace OAuth runtime concerns.

## Decision

Partners is the source of truth for partner app catalog and review state. Admin Review reads and mutates this state through Partners APIs. Workspace must not store canonical partner app catalog or review records.

## Consequences

- Workspace integrations fetch published apps from Partners platform APIs.
- Admin Review writes approve/reject/suspend decisions to Partners.
- Workspace may keep only a minimal Better Auth OAuth runtime projection needed to authorize and token partner apps.
- Architecture reviews must not suggest moving catalog or review ownership back into Workspace unless this ADR is explicitly reopened.

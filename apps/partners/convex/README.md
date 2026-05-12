# Partners Convex Backend

This directory is the independent backend boundary for the root Partners app.

- Partners uses one independent Convex project/deployment/database for all Partners-owned data.
- Partners owns partner profiles, programmer organizations, app registrations, credentials, app review state, portal audit events, Anan workspace link records, and Anan integration delivery logs.
- Anan remains the authority for Anan workspace data, workspace scopes, OAuth consent, and workspace-side authorization.
- Cross-app communication must go through explicit contracts in `lib/anan-integration/contracts.ts`; do not import Anan generated Convex APIs into this app.

## Domain Split Points

- `partnerProfiles`: programmer identity attached to Partners auth.
- `partnerOrganizations`: programmer-owned organizations only.
- `partnerApps`: app registration, credentials, scopes, redirects, and lifecycle state.
- `partnerAppReviews`: app review decisions and notes owned by Partners.
- `partnerEvents`: portal audit trail and programmer/app actions.
- `ananWorkspaceLinks`: workspace authorization relationships, not workspace data.
- `ananIntegrationEvents`: delivery, retry, and failure logs for calls between Partners and Anan.

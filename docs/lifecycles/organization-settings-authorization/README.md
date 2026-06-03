# Organization Settings Authorization

## Purpose
Keep Workspace organization settings actions authorized by organization roles and permissions instead of the platform operator email allowlist.

## Owner
`apps/workspace`

## Entrypoints
- Workspace organization settings profile, members, invitations, invite links, work roles, API keys, and agent links.
- Hono organization routes under `/api/v1/organizations/:organizationId`.
- Convex organization profile and invite-link mutations.

## Actor/System Flow
Organization owners and permitted custom roles manage organization-owned settings. Platform admins are separate operator accounts for internal/admin surfaces and should not be required for normal Workspace organization administration.

## Current Status
Active. Organization settings writes should use WorkOS organization memberships, custom roles, permission slugs, the Convex projection, and Qentrah safety policy. `PLATFORM_ADMIN_EMAILS` remains only for platform/operator actions.

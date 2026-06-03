# Changes

## 2026-06-02 WorkOS Organization Adapter Migration

- Replaced the Better Auth organization HTTP proxy with the WorkOS organization Adapter for members, invitations, custom roles, and role permission slugs.
- Kept the Hono and browser organization Interfaces stable while moving WorkOS SDK details behind one service Module.
- Preserved Qentrah owner-retention policy, Convex permission enforcement, and audit writes.

## 2026-05-16

- Created lifecycle docs for Workspace organization member management.
- Documented that member removal should rely on organization `member:delete` permission plus Qentrah removal policy, not the platform-admin email allowlist.
- Removed the platform-admin allowlist gate from `removeOrganizationMember`.
- Added a regression test proving member removal uses organization permission and does not call `requirePlatformAdmin`.

## 2026-05-28 Action Workflow Depth

- Added an organization action workflow Module for repeated permission assertion, organization list access, action execution, and audit recording.
- Kept Hono handlers and exported service functions stable while moving duplicated workflow mechanics out of individual action implementations.

## 2026-05-28 Access Policy Owner Retention Depth

- Deepened the organization access-policy Module with one owner-retention Interface shared by member removal and member role changes.
- Preserved existing self-removal, missing-member, assignable-role, built-in-role, and last-owner error behavior.

## 2026-06-03 Auth Organization Selection Redirects

- Hardened Workspace `choose-org` so organization APIs mount only after Better Auth session hydration confirms the user is signed in.
- Centralized Mobile post-auth route decisions in the auth navigation Module so social sign-in and OAuth callback return through the Workspace gate instead of hard-coding home.
- Required Mobile app and auth layouts to resolve active Workspace identity before opening the app shell, so a signed-in user without an active organization lands on create/select workspace instead of home or app content.
- Fixed Mobile invite sign-in to target the actual auth entry route and preserve the invite callback path.
- Renamed the Mobile account-switch handler so React hook linting does not misclassify it as a hook.

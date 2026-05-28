# Changes

## 2026-05-16

- Created lifecycle docs for Workspace organization member management.
- Documented that member removal should rely on organization `member:delete` permission plus Qentrah removal policy, not the platform-admin email allowlist.
- Removed the platform-admin allowlist gate from `removeOrganizationMember`.
- Added a regression test proving member removal uses organization permission and does not call `requirePlatformAdmin`.

## 2026-05-28 Action Workflow Depth

- Added an organization action workflow Module for repeated permission assertion, Better Auth list access, action execution, and audit recording.
- Kept Hono handlers and exported service functions stable while moving duplicated workflow mechanics out of individual action implementations.

## 2026-05-28 Access Policy Owner Retention Depth

- Deepened the organization access-policy Module with one owner-retention Interface shared by member removal and member role changes.
- Preserved existing self-removal, missing-member, assignable-role, built-in-role, and last-owner error behavior.

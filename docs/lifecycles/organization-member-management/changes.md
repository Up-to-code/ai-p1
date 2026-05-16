# Changes

## 2026-05-16

- Created lifecycle docs for Workspace organization member management.
- Documented that member removal should rely on organization `member:delete` permission plus Qentrah removal policy, not the platform-admin email allowlist.
- Removed the platform-admin allowlist gate from `removeOrganizationMember`.
- Added a regression test proving member removal uses organization permission and does not call `requirePlatformAdmin`.

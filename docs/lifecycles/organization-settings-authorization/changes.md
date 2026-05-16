# Changes

## 2026-05-16

- Created lifecycle docs for organization settings authorization.
- Removed platform-admin gates from organization profile, invite-link, identity, invitation, member-role, and work-role write paths.
- Kept organization permission checks and Qentrah safety policies as the enforcement boundary.
- Diagnosed stale `Platform admin required` runtime errors as a blocked Convex deployment caused by legacy partner-connection schema validation failure.
- Redeployed Convex successfully after the partner-connection data backfill, so the current organization profile write function is active.
- Revoked the exposed organization API key record whose last four characters matched the pasted key.
- Planned and implemented the capability endpoint as one Convex snapshot query instead of many per-permission queries to reduce organization settings load time and repeated Better Auth warning noise.
- Added focused evaluator, access-checker, and capability handler tests for role capability calculation, single-query loading, and dev-only slow-load warnings.

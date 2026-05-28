# Changes

## 2026-05-28 Organization Logo Crop Depth

- Added an Organization logo view-model Module for crop layout, output sizing, and crop position clamping.
- Preserved logo upload/crop UI behavior, output dimensions, zoom bounds, and Better Auth organization update semantics while removing pure crop math from the component.

## 2026-05-28 Permission Toggle Depth

- Deepened the Organization settings view-model Module with Agent link, organization API key, and custom role permission toggle commands.
- Preserved grantable-permission checks, selected permission shapes, custom role permission payloads, and Organization screen state behavior while removing repeated toggle logic from the screen.

## 2026-05-28 Organization Permission Projection Depth

- Moved Agent link and organization API key permission projection, cloning, clamping, defaults, and summary formatting into the Organization settings view-model Module.
- Moved settings count and bucket projections for owners, pending invites, custom-role members, Agent links, and API keys into the same view-model Module.
- Preserved existing Organization screen UI areas, permission checkboxes, grantable capability semantics, default API key read-only behavior, and summary text shape.

## 2026-05-28 Settings View-Model Depth

- Added the Organization settings view-model Module so the settings screen no longer owns tab vocabulary, role templates, permission work areas, or role/member formatting helpers.
- Preserved Better Auth ownership, organization permission checks, existing routes, and all settings mutation behavior.

## 2026-05-28 Organization Request Module Depth

- Added the browser organization request Module so exported organization API wrappers share route segment encoding, JSON request construction, and error fallback behavior behind one Interface.
- Preserved all exported organization API function names, route URLs, methods, response mapping, invite-link acceptance, and Better Auth ownership.
- Added focused tests for encoded organization paths, static organization routes, JSON error fallbacks, and body/no-body request construction.

## 2026-05-16

- Created lifecycle docs for organization settings authorization.
- Removed platform-admin gates from organization profile, invite-link, identity, invitation, member-role, and work-role write paths.
- Kept organization permission checks and Qentrah safety policies as the enforcement boundary.
- Diagnosed stale `Platform admin required` runtime errors as a blocked Convex deployment caused by legacy partner-connection schema validation failure.
- Redeployed Convex successfully after the partner-connection data backfill, so the current organization profile write function is active.
- Revoked the exposed organization API key record whose last four characters matched the pasted key.
- Planned and implemented the capability endpoint as one Convex snapshot query instead of many per-permission queries to reduce organization settings load time and repeated Better Auth warning noise.
- Added focused evaluator, access-checker, and capability handler tests for role capability calculation, single-query loading, and dev-only slow-load warnings.

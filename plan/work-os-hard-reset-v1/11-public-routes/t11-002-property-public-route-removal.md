# T11-002 - Property Public Route Removal

Status: [ ]
Workstream: Public Routes
Depends on: T00-002, T02-006

Goal:
Remove property public routes and stale property links.

Inputs:
- Route map
- Deleted property modules
- Public pages and docs links

Steps:
- Remove property routes from Workspace app router.
- Remove public links to property pages.
- Update route tests and route manifests.
- Confirm no generated docs point to old property routes.

Traps:
- Do not re-add deleted property files.
- Do not leave dynamic route imports broken.

Acceptance:
- No active public property route remains.

Tests:
- `find apps/workspace/src/app -path '*properties*' -type f`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:

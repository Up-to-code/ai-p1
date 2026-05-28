# Files

- `apps/admin/src/lib/admin-domain-service.ts`: Admin app domain service that routes requests to Partners or Workspace Convex.
- `apps/admin/src/lib/admin-domain-sources.ts`: Admin domain source Adapter Module for local security, Partners, and Workspace Convex sources.
- `apps/admin/src/lib/admin-convex.ts`: Admin app Convex bridge for Workspace admin list/detail/action functions.
- `apps/workspace/convex/admin.ts`: stable Convex facade for Workspace admin list/detail/action exports.
- `apps/workspace/convex/admin/domainAdapters.ts`: internal domain Adapter registry for Workspace admin list, find, summarize, detail, and action behavior.
- `apps/workspace/convex/admin/listSurface.ts`: internal Admin list surface Module for pagination bounds, bounded-search warnings, search matching, and mapped page responses.
- `apps/workspace/convex/admin/organizationDashboard.ts`: internal Admin organization dashboard projection Module for member id discovery and actionable notification rows.
- `apps/workspace/convex/serviceTokens.ts`: shared Workspace Convex service-token assertion used by the admin facade.

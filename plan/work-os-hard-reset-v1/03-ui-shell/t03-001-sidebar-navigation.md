# T03-001 - Sidebar Navigation

Status: [x]
Workstream: UI Shell
Depends on: T01-001

Goal:
Finalize sidebar navigation for the Work OS product.

Inputs:
- `apps/workspace/src/components/layout/sidebar.tsx`
- Workspace route map
- Message dictionaries

Steps:
- Use Work OS nav items: Dashboard, Clients, Opportunities, Projects, Tasks, Calendar, Assets, Automations, Team, Integrations, Settings.
- Remove property, broker, developer, and real-estate labels.
- Ensure active state and icons work for every route.
- Update English and Arabic sidebar messages.

Traps:
- Do not add explanatory text in navigation.
- Do not keep hidden dead routes as sidebar destinations.

Acceptance:
- Sidebar is industry-neutral and route-complete.
- No duplicate message keys are introduced.

Tests:
- `npm --workspace @qentrah/workspace run lint -- src/components/layout/sidebar.tsx`
- `npm --workspace @qentrah/workspace run typecheck`

Completion note:
- Completed 2026-06-06.
- Sidebar navigation now uses the Work OS item set in order: Dashboard, Clients, Opportunities, Projects, Tasks, Calendar, Assets, Automations, Team, Integrations, Settings.
- Removed sidebar-only Usage and Activity destinations and removed the disabled/coming-soon Integrations state.
- Enabled the sidebar Integrations destination by rendering the existing integration screens at `/web-apps` and `/web-apps/[id]`; legacy `/integrations` route aliases still redirect away.
- Updated English and Arabic Sidebar messages, including the missing Team key and duplicate Assets key cleanup.
- Added `apps/workspace/src/components/layout/sidebar-source.test.ts` to guard nav order, active destinations, and unique Sidebar message keys.
- Validation:
  - `npm --workspace @qentrah/workspace test -- src/components/layout/sidebar-source.test.ts src/domains/integrations/integrations-routes-source.test.ts src/domains/dashboard/dashboard-mode.test.ts`
  - `npm --workspace @qentrah/workspace run lint -- src/components/layout/sidebar.tsx`
  - `npm --workspace @qentrah/workspace run typecheck`
  - `git diff --check` on changed sidebar, route, message, and test files.
- Runtime note: an existing dev server is reachable on port 3000, but authenticated app routes redirect to `/en/sign-in` when signed out. The in-app browser navigation timed out, so no browser screenshot evidence was recorded for this task.

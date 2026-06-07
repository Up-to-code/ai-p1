# T00-002 - Current Route Map

Status: [x]
Workstream: Baseline
Depends on: T00-001

Goal:
Map active Workspace, public, partner, and demo routes before deleting or replacing real-estate surfaces.

Inputs:
- `apps/workspace/src/app`
- `apps/demo-partner-app/app`
- `apps/partners/app`
- `apps/marketing/app`

Steps:
- List authenticated Workspace routes.
- List public routes that still expose broker, developer, property, or real-estate framing.
- List partner/demo API routes that expose old resource names.
- Mark each old route as remove, rename, or keep as allowed exception.

Traps:
- Do not delete routes during this task.
- Do not classify docs routes as product routes without inspecting content.

Acceptance:
- Route map supports T11 route cleanup tasks.
- Each old route has a planned action.

Tests:
- `find apps/workspace/src/app -type f | sort`
- `find apps/demo-partner-app/app -type f | sort`

Completion note:
- Completed on 2026-06-06.
- Evidence commands:
  - `find apps/workspace/src/app -type f | sort`
  - `find apps/demo-partner-app/app -type f | sort`
- Authenticated Workspace app routes currently include Dashboard, Activity,
  Clients, Projects, Calendar, Assets, Opportunities, Tasks, Automations,
  Billing, Integrations, Organization, Team, Usage, Web Apps, profile settings,
  and organization settings.
- Workspace property app route files are no longer present under
  `apps/workspace/src/app`.
- Old public Workspace routes still present and planned for T11 cleanup:
  `apps/workspace/src/app/[locale]/(public)/broker/page.tsx` and
  `apps/workspace/src/app/[locale]/(public)/developer/page.tsx`.
- Demo Partner App property API route is deleted, while generic routes exist for
  assets, calendar, clients, media, projects, tasks, webhooks, and auth.
- Planned actions:
  - Remove or replace public broker/developer pages in T11-001.
  - Keep partner developer portal routes where they mean external app developers,
    not real-estate developers.
  - Verify robots, metadata, and public links in T11-003 and T11-004.

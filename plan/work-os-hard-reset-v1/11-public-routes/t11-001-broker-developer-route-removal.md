# T11-001 - Broker Developer Route Removal

Status: [ ]
Workstream: Public Routes
Depends on: T00-002

Goal:
Remove or replace broker/developer public routes and links.

Inputs:
- Route map
- Workspace, marketing, and partners public app routes

Steps:
- Identify broker/developer routes and links.
- Remove routes that only support old positioning.
- Redirect or replace links with Work OS destinations if needed.
- Update tests and metadata.

Traps:
- Do not remove partner developer portal routes by confusing developer persona with old real-estate developer.
- Do not leave robots or sitemap entries pointing to deleted routes.

Acceptance:
- Old broker/developer product routes are gone or replaced.

Tests:
- `rg -n "/broker|/developer|broker|developer" apps/workspace/src/app apps/marketing apps/partners`

Completion note:

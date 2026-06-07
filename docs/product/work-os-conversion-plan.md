# Qentrah Work OS Conversion Plan

## Summary

Convert Qentrah from a real-estate operating workspace into an industry-agnostic Work OS with a hard schema and data reset. The new core model is clients, opportunities, projects, tasks, calendar, assets, team, templates, automations, and agents.

Use a hybrid input model: every core object has stable fields for search, permissions, AI/MCP tools, and UI consistency, plus typed custom fields for industry templates. Real estate becomes one workspace template, not the default product model.

## Core Records

- **Clients**: person/company records with contact, segment, stage, owner, priority, and custom fields.
- **Opportunities**: funnel records linked to clients, projects, assets, tasks, and calendar events.
- **Projects**: generic delivery/work records with status, health, owner, dates, value, and custom fields.
- **Tasks**: standalone or linked work items.
- **Calendar events**: meetings, calls, appointments, deadlines, and linked work.
- **Assets**: flexible records for products, inventory, documents, locations, properties, deliverables, equipment, or any industry object.
- **Record links**: typed relationships between clients, opportunities, projects, tasks, assets, and calendar events.
- **Workspace templates**: presets for stages, statuses, custom fields, views, sample automations, and labels.
- **Automations**: rules for record creation, stage changes, due dates, and status changes.

## Keep

Keep organization, billing, partner app grants, API keys, MCP connections, audit events, agents, media, notifications, WorkOS partner authorization, and partner API architecture.

## Remove As Defaults

- Real-estate default vocabulary.
- Property/unit APIs and routes.
- `propertyUnits`, `clientUnitLinks`, and property-specific contracts.
- Broker/developer audience defaults.
- REGA, ad-license, unit inventory, and broker/developer fields outside the real-estate legacy template.

## Public Routes

- `/dashboard`
- `/clients`
- `/opportunities`
- `/projects`
- `/tasks`
- `/calendar`
- `/assets`
- `/automations`
- `/team`
- `/integrations`
- `/activity`
- `/billing`
- `/organization`

## API And Agent Resources

Partner and internal API resources should be organization, client, opportunity, project, task, calendar, asset, media, and automation.

Agent/MCP tools should converge on:

- `clients_list/get/create/update/delete`
- `opportunities_list/get/create/update/delete/move_stage`
- `projects_list/get/create/update/delete`
- `tasks_list/get/create/update/complete/delete`
- `calendar_list_range/get/create/update/delete`
- `assets_list/get/open/create/update/update_field/delete`
- `automations_list/create/update/delete`
- `media_list/attach_url`

## Visual Direction

Use a dense operating desk: quiet shell, compact navigation, table/board/calendar views, clear status, strong global search, restrained color, and minimal explanatory copy.

Preserve dashboard AI mode and add a contextual Agent Drawer on record pages. The drawer reads the current record context and proposes tool actions with confirmations.

## Implementation Order

1. Update domain language and product docs.
2. Replace shared contracts, permission resources, MCP registry, and API-key validators.
3. Hard reset Convex schema to Work OS records.
4. Rebuild backend modules around clients, opportunities, projects, tasks, calendar, assets, and automations.
5. Replace Workspace UI domains and routes.
6. Update global search, dashboard, activity, organization permissions, API keys, MCP screens, agent presets, and integrations copy.
7. Update partner gateway and demo partner app.
8. Update marketing and public docs.
9. Run full typecheck, tests, workspace build, and targeted E2E smoke checks.

## Test Plan

- Template creation creates fields, stages, statuses, views, and automation recipes.
- Custom field validation accepts only matching typed values.
- Record linking allows valid core-resource pairs and rejects missing or deleted records.
- MCP permission map protects all new resources.
- AI tool registry maps each tool to correct resource, action, and risk.
- CRUD works for clients, opportunities, projects, tasks, calendar events, assets, and automations.
- Hard delete removes records and linked rows where required.
- Search/index routes return active records only.
- UI covers onboarding template selection, dashboard states, table/board/detail flows, calendar links, and agent confirmations.
- Partner API and MCP agents can use only scoped Work OS resources.

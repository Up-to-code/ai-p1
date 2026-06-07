# T01-010 - Workspace Template Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001, T05-001, T06-001

Goal:
Define Workspace Template as the only place where industry-specific presets live.

Inputs:
- Custom field model
- Automation model
- Existing Workspace organization settings

Steps:
- Define template fields: name, category, description, statuses, stages, views, custom fields, automation recipes.
- Define application behavior for new workspaces.
- Define how real estate can exist as an optional template.
- Define template versioning expectations.

Traps:
- Do not let templates mutate core record identities.
- Do not make real estate the default template.

Acceptance:
- Industry-specific behavior is configurable without contaminating core records.
- Real estate can be added later as a template safely.

Tests:
- `rg -n "workspaceTemplates|template|real estate" apps/workspace packages/domain-contracts/src CONTEXT.md`

Completion note:
- Completed on 2026-06-06.
- Dependencies T01-001, T05-001, and T06-001 are complete.
- Evidence: [flexible-layer-spec.md](../flexible-layer-spec.md) defines the
  Workspace template Interface: fields, status, application behavior,
  real-estate template rule, versioning, and guardrails.
- The model keeps industry-specific behavior in templates and prevents templates
  from changing core record identities or weakening permissions.

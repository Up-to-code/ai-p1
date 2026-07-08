# Scalable Database and Modelization Blueprint

Status: Proposed architecture  
Scope: `apps/workspace` Convex schema, Hono backend, domain modules, shared UI/model contracts

## Goal

Qentrah is not an MVP codebase. The database and backend must support a medium-to-large modular monolith where new product domains can be added without copying old logic, adding unindexed tables, or leaking implementation details across domain modules.

The root product model is:

```
Organization workspace
  -> Spaces
    -> Projects
      -> work records: tasks, docs, calendar events, media, deals, etc.
  -> Surfaces
    -> tabs
      -> saved views or pinned records from any domain
  -> Configuration
    -> workflows, fields, layouts, templates, permissions
```

`user/account` data should stay small and security-focused. Business data belongs to `organizationId`.

## Current Friction

- Two view systems exist: `views` and `userTableViews`.
- `workspaceSettings.defaultViews`, `projects.customTabs`, and local UI tab state compete with each other.
- `pipeline_stages` is a one-off configuration table instead of a general workflow model.
- Hardcoded statuses/stages still exist in code, while the product wants removable default configuration.
- Some high-traffic queries collect broad organization lists and filter in memory.
- Some schema fields use `v.any()` for durable product configuration.
- Soft delete is mixed: some tables use `deletedAt`, some use `isDeleted`, and some high-traffic indexes cannot ask for active records directly.
- Domain tables sometimes use string IDs for cross-record links, which weakens referential clarity.
- Backend routes, helpers, retry/error behavior, authorization, and audit are not yet governed by a single folder rule.

## Database Principles

1. **Organization is the workspace root.** Every business table starts with `organizationId`.
2. **Account data is not business data.** User tables hold profile, devices, preferences, and session-related data only.
3. **Every high-traffic table has a queryable lifecycle field.** Use `recordState: "active" | "archived" | "deleted"` plus timestamp metadata like `deletedAt`.
4. **Configuration is data, not code.** Statuses, stages, views, tabs, field layouts, and default templates are organization-owned rows seeded from system templates.
5. **Surfaces reference domain records.** A workspace tab that shows a Doc does not copy the Doc. It references the Doc record owned by the Docs domain.
6. **No durable `v.any()` for product configuration.** Use typed config unions. Keep `v.any()` only for external raw payload archives, migration snapshots, or intentionally opaque webhook payloads.
7. **One write path per behavior.** If Function B does Function A plus extra work, Function B calls Function A's implementation module instead of reimplementing it.
8. **Routes are adapters.** Hono routes parse and return HTTP. They do not own business rules.

## Target Schema Layers

### Layer 1: Account

Keep:

- `userProfiles`
- `notificationDevices`
- Better Auth users, sessions, accounts

Move out of account layer:

- `userTableViews` should become organization-owned view rows with `ownerUserId`.
- User-specific preferences should be scoped by `organizationId` when they affect workspace rendering.

### Layer 2: Organization Workspace Core

Keep and harden:

- `organizations`
- Better Auth organization/membership tables
- `organizationWorkRoles`
- `organizationAuditEvents`
- `organizationApiKeys`
- `organizationMcpConnections`
- `spaces`
- `spaceMembers`
- `projects`
- `projectSpaces`

Add:

- `projectMembers`
  - `organizationId`
  - `projectId`
  - `userId`
  - `role: "admin" | "member" | "viewer"`
  - indexes: `by_project_user`, `by_user`, `by_project_role`

Change:

- Add `recordState` to high-traffic workspace records.
- Prefer typed Convex IDs for internal relations where possible.
- Keep denormalized `spaceId` / `projectId` on child records only when it serves indexed workspace surfaces.

### Layer 3: Work Records

Core records:

- `tasks`
- `docs`
- `docFolders`
- `calendarEvents`
- `clients`
- `deals`
- `opportunities`
- `mediaAssets`
- `mediaFolders`
- `channels`
- `messages`
- `threads`
- `timeEntries` later
- `milestones`
- `taskDependencies`

Rules:

- All have `organizationId`.
- All high-traffic records have `recordState`, `createdAt`, `updatedAt`, `createdByUserId`.
- Records that render inside Space/Project surfaces should carry indexed scope fields:
  - `spaceId?`
  - `projectId?`
  - resource-specific parent IDs
- Queries must prefer scope indexes over organization-wide scans.

### Layer 4: Surfaces, Tabs, and Views

Replace `views`, `userTableViews`, `workspaceSettings.defaultViews`, and `projects.customTabs` with a unified model.

#### `surfaces`

Represents a place where tabs render.

```ts
{
  organizationId: string;
  scopeType: "workspace" | "space" | "project" | "resource";
  scopeId?: string;
  key: string; // e.g. "workspace:home", "project:<id>:main"
  title: string;
  ownerUserId?: string;
  visibility: "private" | "space_members" | "organization";
  recordState: "active" | "archived" | "deleted";
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
```

Indexes:

- `by_organization_scope`: `["organizationId", "scopeType", "scopeId"]`
- `by_organization_state_updated`: `["organizationId", "recordState", "updatedAt"]`
- `by_organization_key`: `["organizationId", "key"]`

#### `surfaceTabs`

Represents tabs in a surface. A tab can show a saved view, a pinned domain record, or a built-in system panel.

```ts
{
  organizationId: string;
  surfaceId: Id<"surfaces">;
  tabType: "savedView" | "record" | "system";
  label: string;
  icon?: string;
  order: number;
  savedViewId?: Id<"savedViews">;
  recordType?: WorkspaceResourceType;
  recordId?: string;
  systemKey?: string;
  ownerUserId?: string;
  visibility: "private" | "space_members" | "organization";
  recordState: "active" | "archived" | "deleted";
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
```

Indexes:

- `by_surface_state_order`: `["organizationId", "surfaceId", "recordState", "order"]`
- `by_saved_view`: `["organizationId", "savedViewId"]`
- `by_record`: `["organizationId", "recordType", "recordId"]`

#### `savedViews`

One saved rendering/query configuration for one resource type.

```ts
{
  organizationId: string;
  resourceType: WorkspaceResourceType; // "task", "doc", "project", etc.
  viewType: "table" | "board" | "list" | "calendar" | "timeline" | "dashboard" | "fileManager";
  name: string;
  description?: string;
  ownerUserId?: string;
  scopeType: "workspace" | "space" | "project" | "resource";
  scopeId?: string;
  visibility: "private" | "space_members" | "organization";
  config: SavedViewConfig; // typed union
  isDefault?: boolean;
  sourceTemplateId?: string;
  isSystemDefault?: boolean;
  isRemovable: boolean;
  recordState: "active" | "archived" | "deleted";
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
```

Indexes:

- `by_resource_scope_state`: `["organizationId", "resourceType", "scopeType", "scopeId", "recordState"]`
- `by_owner_resource`: `["organizationId", "ownerUserId", "resourceType"]`
- `by_default`: `["organizationId", "resourceType", "scopeType", "scopeId", "isDefault"]`
- `by_state_updated`: `["organizationId", "recordState", "updatedAt"]`

This supports:

- Workspace task table tab.
- Workspace doc tab that references one Doc.
- Project task board tab.
- Space calendar tab.
- Personal saved views and organization-shared views.

### Layer 5: Configurable Workflows and Fields

#### Replace `pipeline_stages` with `workflowDefinitions` and `workflowStates`

`workflowDefinitions`:

```ts
{
  organizationId: string;
  resourceType: WorkspaceResourceType;
  key: string; // "task-status", "deal-stage"
  name: string;
  isDefault: boolean;
  isRemovable: boolean;
  sourceTemplateId?: string;
  recordState: "active" | "archived" | "deleted";
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
}
```

`workflowStates`:

```ts
{
  organizationId: string;
  workflowId: Id<"workflowDefinitions">;
  key: string;
  label: string;
  color: string;
  order: number;
  category?: "not_started" | "active" | "blocked" | "done" | "canceled";
  isTerminal?: boolean;
  isDefault?: boolean;
  isRemovable: boolean;
  recordState: "active" | "archived" | "deleted";
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
```

Indexes:

- `workflowDefinitions.by_resource_key`: `["organizationId", "resourceType", "key"]`
- `workflowStates.by_workflow_order`: `["organizationId", "workflowId", "recordState", "order"]`
- `workflowStates.by_workflow_key`: `["organizationId", "workflowId", "key"]`

Domain records keep indexed `statusKey` / `stageKey` string columns, not arbitrary enum-only code constants. The workflow state rows define allowed display, order, color, and removability.

#### Harden Custom Fields

Keep the broad shape of:

- `customFieldDefinitions`
- `customFieldValues`

Change:

- Remove optional `workspaceId`; use `organizationId`.
- Add `scopeType` / `scopeId` for workspace, space, project, or resource-specific fields.
- Add `recordState`.
- Move reusable select options to `fieldOptions` when option lists are edited often or reused.
- Add layout configuration in `fieldLayouts` instead of embedding all display concerns inside definitions.

Add:

- `fieldLayouts`
  - `organizationId`
  - `resourceType`
  - `scopeType`
  - `scopeId?`
  - `layoutType: "form" | "table" | "detail" | "boardCard"`
  - `fieldOrder: string[]`
  - `visibility: Record<fieldKey, boolean>` should become typed entries if it grows.

## Indexing Rules

Every new table must declare its query surface before being merged.

Required for organization-owned records:

- `by_organization_id`: only for low-volume admin reads.
- `by_org_state_updated`: `["organizationId", "recordState", "updatedAt"]`
- Parent scope index: `["organizationId", "projectId", "recordState", "updatedAt"]` or equivalent.
- Actor/owner index if the UI filters by person.
- Status/workflow index if the UI filters or groups by status/stage.
- Time index if sorted by due/start/scheduled date.

Avoid:

- Organization-wide `.collect()` followed by `.filter()` on high-traffic tables.
- Indexes that start with `status` without `organizationId` unless they are global job queues.
- Duplicate indexes that do not match an actual query.
- `by_updated` global indexes on tenant data unless used by a maintenance job.

Preferred high-traffic patterns:

```ts
.index("by_org_state_updated", ["organizationId", "recordState", "updatedAt"])
.index("by_org_project_state_updated", ["organizationId", "projectId", "recordState", "updatedAt"])
.index("by_org_space_state_updated", ["organizationId", "spaceId", "recordState", "updatedAt"])
.index("by_org_assignee_state_due", ["organizationId", "assigneeUserId", "recordState", "dueDate"])
.index("by_org_workflow_state_order", ["organizationId", "statusKey", "recordState", "pipelineOrder"])
```

Pagination rule: every high-traffic list query returns a cursor page, not an unbounded array.

Search rule: basic search can scan a capped indexed page. Full text or cross-domain search must use a dedicated search index/module, not ad hoc scans in every domain.

## Backend Folder Rules

### Convex Domain Module

Each Convex domain should follow:

```
convex/<domain>/
  validators.ts   // args and returns validators
  data.ts         // pure-ish database helpers, no public function exports
  policy.ts       // access checks for this domain
  read.ts         // public/internal queries
  write.ts        // public/internal mutations
  present.ts      // record -> view model projection
  lifecycle.ts    // status/workflow/business transitions when needed
```

Rules:

- `read.ts` and `write.ts` are thin orchestration modules.
- Business rules live in `data.ts`, `policy.ts`, or `lifecycle.ts`.
- All public Convex functions have `args` and `returns`.
- All durable configs avoid `v.any()`.
- Domain writes emit audit through one shared audit module.
- Domain writes are idempotent when retry is possible.

### Hono Backend Module

Each Hono domain should follow:

```
src/server/domains/<domain>/
  routing/        // route registration only
  handlers/       // HTTP adapter: params/body/response
  validation/     // Zod request schemas
  services/       // calls Convex and composes business workflows
  errors/         // domain error normalization when needed
```

Rules:

- Routes do not call Convex directly.
- Handlers do not contain business rules.
- Services do not parse raw HTTP.
- Authorization is enforced server-side in Convex/Hono, never only in UI.
- Retry behavior is centralized in `src/server/utils/retry` or a domain-specific adapter when the operation is external.
- Errors use one action-error path and structured codes where possible.

## Shared Helper Rules

Shared helpers are allowed only when at least two real modules use them or the helper protects a fragile invariant.

Good shared helper categories:

- authorization and policy checks
- audit writing
- retry/backoff
- structured errors
- typed pagination
- typed date/time parsing
- resource reference parsing
- search/query normalization
- workflow state resolution
- field value coercion

Bad shared helper categories:

- one-off domain business logic
- UI-only formatting for one screen
- wrappers that simply rename another function
- generic helpers with no second caller

Deletion test: deleting a helper should concentrate complexity in one real module. If deletion only moves one line back to the caller, the helper is shallow.

## UI and Shared Model Rules

Shared UI belongs in `components/shared` or a package only when it is genuinely cross-domain and registered in `component-registry.json`.

Domain UI belongs in `src/domains/<domain>/components`.

Domain parent interfaces should expose:

- types
- read hooks
- write hooks or request functions
- view models
- allowed UI entry components

Other domains should not import deep implementation paths unless the parent domain explicitly exports that module as a supported interface.

Statuses, stages, labels, field options, and tabs should come from organization configuration rows once migrated. Code constants can remain as seed defaults and fallback guards only.

## What To Remove Or Consolidate

Remove or migrate:

- `views` -> `savedViews` and `surfaceTabs`
- `userTableViews` -> `savedViews` with `ownerUserId`
- `workspaceSettings.defaultViews` -> organization surface defaults
- `projects.customTabs` -> `surfaceTabs`
- `pipeline_stages` -> `workflowDefinitions` + `workflowStates`
- `isDeleted` duplicates -> `recordState` + timestamps
- `workspaceId` in custom fields -> `organizationId` + scope
- `clientDocs` naming -> `docs` module naming once routes are stable
- durable `v.any()` in view configs, automation configs, and field configs where product behavior depends on shape

Keep `v.any()` only for:

- migration archive payloads
- external webhook raw payloads
- raw integration payloads that are not queried by product features

## Migration Waves

### Wave 1: Schema Design Contract

- Add this blueprint as the schema review contract.
- Create typed shared validators for resource types, scope types, lifecycle state, view config, workflow config, and field config.
- Add schema tests that fail on new organization-owned tables without `organizationId`.

### Wave 2: Views and Tabs Consolidation

- Introduce `surfaces`, `surfaceTabs`, and `savedViews`.
- Backfill from `views`, `userTableViews`, `workspaceSettings`, and `projects.customTabs`.
- Move UI to the new read interface.
- Stop writing to old tables.
- Delete old tables after migration archive verification.

### Wave 3: Workflow Configuration

- Introduce `workflowDefinitions` and `workflowStates`.
- Seed task status, project status, deal stage, client pipeline stage from templates.
- Replace `pipeline_stages`.
- Move hardcoded UI constants to fallback seed files only.

### Wave 4: Custom Fields and Layouts

- Add `scopeType`, `scopeId`, `recordState`.
- Add `fieldLayouts` and optional `fieldOptions`.
- Migrate embedded display config to layouts.
- Add value coercion module and contract tests.

### Wave 5: High-Traffic Index Pass

- Add `recordState` indexes to high-volume tables.
- Replace scan/filter reads with indexed cursor queries.
- Remove unused global `by_updated` indexes unless maintenance jobs need them.

### Wave 6: Backend Rule Enforcement

- Add lint/source tests for forbidden patterns:
  - Hono handler directly calling Convex.
  - new Convex public function without `returns`.
  - organization-owned table without `organizationId`.
  - high-traffic query using `.collect()` then `.filter()` without a documented cap.
  - durable product config using `v.any()`.

## New Domain Checklist

Before adding a domain:

- Define resource type and owner module.
- Define scope: organization, space, project, or resource.
- Define lifecycle: recordState plus optional workflow.
- Define default seed configuration.
- Define read surfaces and indexes.
- Define permissions and audit events.
- Define Hono write gateway only if needed.
- Define parent domain interface.
- Add tests at the interface, not only internal functions.


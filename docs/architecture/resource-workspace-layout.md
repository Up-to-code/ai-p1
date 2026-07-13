# Resource Workspace Layout

Status: Packet 1 implemented; Task route migration next

Date: 2026-07-12

## Purpose

Qentrah needs one deep Resource Workspace module that can support Tasks, Clients, Deals, Projects, and future resources without copying domain screens or forcing unrelated business rules into a generic component.

The shared module owns layout and placement. Domain Adapters own business behavior.

## Ownership model

### Route layout owns the persistent workspace chrome

For a resource route such as Tasks, the route layout renders:

- resource title;
- live resource count or count state;
- route-linked view navigation;
- resource-wide primary actions;
- the content outlet for the active view page;
- stable placement seams for view toolbars and extension panels.

The header must not be recreated by Table, Board, or List pages.

### View pages own view behavior

Each bookmarkable view is a real route page:

```text
/tasks
  layout.tsx
  page.tsx              -> compatibility redirect to /tasks/table
  table/page.tsx
  board/page.tsx
  list/page.tsx
```

Each page imports only its own view Adapter. There is no client-side switch importing every view into one bundle.

Examples:

- Task Table owns columns, grouping, row actions, sorting, and its Fields extension.
- Task Board owns stages, cards, drag/drop, and board-specific settings.
- Task List owns its compact row model and list-specific controls.
- Client Table may use the same shared table module while supplying Client columns, Client row actions, and Client field definitions.

### Domain Adapters own business rules

The shared module must not know what a Task, Client, Deal, or Project is.

A domain Adapter supplies:

- row identity and row data;
- column definitions;
- permitted actions;
- view toolbar content;
- extension panels;
- empty/loading/error states;
- domain mutation callbacks;
- permission-derived visibility.

Task custom fields and Client custom fields remain separate domain Adapters even when both use the same extension-panel placement and shared field-list UI.

## Target shared interface

```ts
type ResourceViewDefinition = {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
};

type ResourceWorkspaceConfig = {
  resourceId: string;
  title: string;
  count: ResourceCountState;
  views: ResourceViewDefinition[];
  activeViewId: string;
  actions?: ResourceAction[];
};

type ResourceViewLayoutProps = {
  toolbar?: ReactNode;
  extensionPanel?: ReactNode;
  extensionPanelOpen?: boolean;
  onExtensionPanelOpenChange?: (open: boolean) => void;
  children: ReactNode;
};
```

The interface describes placement and navigation. It does not accept Task-specific fields, statuses, mutation inputs, or custom-field schemas.

## Extension panels

An extension panel is owned by the active view page and rendered through the Resource View Layout seam.

Examples:

- Task Table passes `TaskFieldsPanelAdapter` when Add Field is activated.
- Client Table passes `ClientFieldsPanelAdapter` with Client definitions and permissions.
- Task Board may pass a board settings panel.
- A view with no extension panel passes nothing and pays no UI or bundle cost.

The shared layout controls docking, sizing, responsive behavior, focus management, and close behavior. The Adapter controls content, queries, mutations, permissions, and errors.

## Shared table module

`QentrahTable` remains the generic table implementation. A resource table Adapter configures it with:

- rows;
- row key;
- columns;
- selection behavior;
- row and bulk actions;
- grouping and sorting configuration;
- field-extension trigger;
- empty/loading/error states.

The table module does not import `TaskTableFieldsPanel` or any other domain module.

## Permission rule

Configuration is derived from trusted capability data. Hidden actions and extension panels are omitted from the Adapter configuration; the shared layout does not infer authorization from labels or client-supplied IDs. Backend mutations continue to enforce authorization independently.

## Migration packets

### Packet 1: Shared Resource Workspace shell

Current behavior: `DomainHeader` and view placement are composed inside domain screens.

Structural improvement: create `components/shared/resource-workspace/` with route-linked header navigation and extension-panel placement.

Validation:

- header remains stable when navigating between views;
- active view derives from the route;
- panel placement works with and without an Adapter;
- keyboard and mobile close behavior remain available.

Implementation checkpoint: Tasks Adapter complete. `components/shared/resource-workspace/` provides the registered `ResourceWorkspaceLayout`, `ResourceViewMenu`, and extension-panel context. The Tasks route layout supplies the resource configuration while `/tasks/table`, `/tasks/board`, and `/tasks/list` render independent view bodies. The Table Adapter alone opens `TaskTableFieldsPanel` through the shared dock; leaving Table closes it. A second domain Adapter should exercise the interface before it is treated as fully stable.

Route-transition invariant: pathname transitions are scoped to the Resource Workspace body. The persistent header and view navigation must never be placed inside a pathname-keyed animation or loading boundary. Each resource route provides a local `loading.tsx` that renders only the view body.

### Packet 2: Task route layout and provider

Current behavior: the canonical Task provider owns the reactive Convex read,
optimistic command overlay, scope, filtering, pagination, and modal lifecycle.
Pagination is cursor-owned by `clientTasks.read.listPage`; the Workspace loads
additional authorized pages instead of slicing a bounded 500-record snapshot.
`domains/tasks/workspace/task-workspace-view-state.ts` is the canonical URL and
saved-view codec. It owns Task filter, grouping, sort, density, and search
normalization. Board, list, and table retain layout behavior but consume the
same selected record set; route switches preserve the complete serialized
state. Saved-view reads subscribe directly to Convex and do not introduce a
TanStack copy of server-owned configuration.
`QentrahTableColumnState` is the shared grid boundary for order, widths, and
visibility. The grid publishes completed interactions and accepts controlled
state, while domain adapters decide whether and where that state is persisted.
`TaskQuickCreateCommand` is the single capture interface used by Task table,
list, board, the creation dialog, and embedded Project Task views. It
normalizes one draft, performs one Hono-owned write, and opens the returned
URL-addressable `/tasks/{id}` identity. Convex subscriptions deliver the new
record; no TanStack invalidation mirrors the read model.
Filesystem pages are server adapters that render board, list, or table client
islands. Route state distinguishes authentication, query loading/failure, true
empty, filtered empty, and populated results. The former
`TasksPageRedesigned` duplicate was removed.

Structural improvement: move shared Task query/mutation context into a Task route provider composed by `/tasks/layout.tsx`. The layout configures the shared Resource Workspace.

Validation:

- sidebar filters remain in the URL and affect every Task view;
- counts and pagination remain correct;
- create/edit modals work from every view;
- no duplicate Task queries are introduced.

### Packet 3: Real Task view routes

Current behavior: `TaskViewFrame` switches between Table, Board, and List and bundles all three.

Structural improvement: create `/tasks/table`, `/tasks/board`, and `/tasks/list` pages, each importing one Adapter. `/tasks` redirects to `/tasks/table` while preserving supported query parameters.

Validation:

- direct links and refresh work for every view;
- browser back/forward preserves view and filters;
- each route has its own loading/error boundary;
- `TaskViewFrame` becomes deletable.

### Packet 4: View-owned Task Fields Adapter

Current behavior: `TaskTableView` renders a fixed Task-specific panel directly.

Structural improvement: Task Table owns open state and passes `TaskFieldsPanelAdapter` to the shared extension-panel seam. Shared layout owns docking only.

Validation:

- Add Field opens only in Task Table;
- leaving Table unmounts the panel;
- create, show/hide, and delete remain permission-safe;
- Board and List do not import the Fields Adapter.

### Packet 5: Second domain Adapter

Current behavior: reusability is hypothetical until another domain uses the seam.

Structural improvement: adapt one Client view without adding Client conditions to shared modules.

Validation:

- shared interfaces remain unchanged;
- Task and Client field rules stay local;
- deleting either Adapter leaves the shared layout coherent.

## Deletion tests

- Deleting Resource Workspace should force every domain to rebuild header, route navigation, and panel placement. This demonstrates depth.
- Deleting a domain Adapter should remove only that domain behavior, not shared layout behavior.
- Deleting `TaskViewFrame` after Packet 3 should remove complexity rather than scatter its switch elsewhere.

## Non-goals

- One universal custom-field schema for every domain.
- One configuration object containing all possible Table, Board, Calendar, and List behavior.
- Client-side search-parameter switching between large view implementations.
- Moving domain authorization or mutations into shared UI.

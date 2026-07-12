# Qentrah Domain Context

## Core Concepts

- **Organization** — top-level tenant. All data belongs to an organization.
- **Space** — a first-class organization-level grouping entity with its own name, slug, color, visibility settings, and members. Owned by the `domains/spaces/` module. Linked to projects via the many-to-many `projectSpaces` junction table. The deepened module provides `useActiveSpace()`, `useWorkspaceSpacesQuery()`, CRUD requests, and UI components (SpaceList, SpaceCreateForm, SpaceSettings, SpaceSwitcher) through a single barrel at `domains/spaces/`.
- **Project** — a container for tasks, docs, calendar events, and team collaboration.
- **Task** — a unit of work with status, priority, assignee, pipeline order, tags, and custom fields.
- **Client** — a CRM entity tracked through pipeline stages (new, contacted, qualified, proposal, negotiation, closedWon, closedLost).
- **SalesOpportunity** — the canonical sales aggregate for prospective revenue, linked to a Client and optionally a delivery Project. The product displays this aggregate as a **Deal**.
- **Deal** — customer-facing copy for a SalesOpportunity. Deals and opportunities must never be exposed as separate writable product modules.
- **Calendar** — events and task due dates in a month-grid layout.
- **Workspace** — the unified UI layer combining sidebar rail, topbar, and content views.
- **Resource Workspace** — the route-level UI shell for a domain resource such as Tasks or Clients. It owns the persistent resource header, count, view navigation, shared actions, and placement seams for view-owned toolbars and extension panels. A Resource Workspace never owns domain mutations or switches between view implementations in memory; each bookmarkable view is a real route page backed by a domain Adapter.
- **Organization API Key** — an organization-owned secret credential with explicit permissions, expiry, quota, rotation, revocation, and last-use tracking. Secret material is owned by the Convex API-key Adapter; Qentrah stores only lifecycle metadata.
- **Push Notification** — a user-targeted mobile delivery request. Device-token registration and provider delivery are owned by the Convex Expo Push Adapter; Qentrah owns schedules, retry state, and audit metadata.

## Deepened Modules

- **Space** — `domains/spaces/`. Single seam for all space concerns: API hooks (`useWorkspaceSpacesQuery`, `createSpaceRequest`, etc.), active-space derivation (`useActiveSpace`), UI components (`SpaceList`, `SpaceCreateForm`, `SpaceSettings`, `SpaceSwitcher`, `SpaceNavItem`, `MemberPicker`), validation (`spaceSchema`), and the `Space` type. Server counterpart at `server/domains/spaces/` with split junction module (`spaces-junction`). Schemas in `@qentrah/domain-contracts`.
- **Task Mutation** — `domains/tasks/hooks/use-task-mutations.ts`. Single seam for all task mutations across workspace views. Provides `createTask`, `updateTask`, `deleteTask`, `moveTask` (async functions) plus `createTaskMutation`, `updateTaskMutation`, `deleteTaskMutation`, `moveTaskMutation` (TanStack `UseMutationResult` objects). Uses TanStack Query `useMutation` with `onMutate` rollback for optimistic UI (same pattern as clients). Consistent error handling (transaction revert + toast). Auto-derives project/space from navigation context. Accepts partial changes.
- **Task Workspace** — `domains/tasks/components/task-workspace-provider.tsx` and `task-resource-layout.tsx`. The provider owns Task querying, Project/Space scoping, sidebar filters, pagination, and editor/create orchestration. The resource Adapter configures the persistent header and route-linked views. `/tasks/table`, `/tasks/board`, and `/tasks/list` own their concrete view bodies; all writes cross the Task Mutation module.
- **Resource Workspace** — `components/shared/resource-workspace/`. Deep shared seam for persistent headers, route-linked view navigation, view-local toolbar placement, and a context-driven extension-panel dock. Domain route layouts provide configuration; domain view pages provide concrete Adapters such as Task Table or Client Pipeline. It does not import domain schemas or mutations.
- **Document Draft** — `domains/docs/hooks/use-document-draft.ts`. Single seam for Document draft reconciliation, IndexedDB recovery, debounced local persistence, scheduled server autosave, save-version ordering, and recovery after failed writes. Pure conflict and restore rules live in `domains/docs/document-draft.ts`; the Document editor remains a UI adapter.
- **Organization API Key** — `convex/organizationApiKeyLifecycle.ts` with the concrete Adapter in `convex/apiKeys.ts`. The lifecycle seam owns creation, validation, rotation, revocation, expiry, quota reservation, and metadata reconciliation across frontend, Hono, and Convex callers.
- **Push Notification** — `convex/notifications/` with the concrete Adapter in `convex/notifications/push.ts`. The notification seam owns device registration, scheduled dispatch, retry state, provider delivery, and token removal for mobile and workspace callers.

## Architecture Decisions

See `docs/decisions/` and `docs/lifecycles/` for ADRs and lifecycle documentation.

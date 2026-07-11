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

## Deepened Modules

- **Space** — `domains/spaces/`. Single seam for all space concerns: API hooks (`useWorkspaceSpacesQuery`, `createSpaceRequest`, etc.), active-space derivation (`useActiveSpace`), UI components (`SpaceList`, `SpaceCreateForm`, `SpaceSettings`, `SpaceSwitcher`, `SpaceNavItem`, `MemberPicker`), validation (`spaceSchema`), and the `Space` type. Server counterpart at `server/domains/spaces/` with split junction module (`spaces-junction`). Schemas in `@qentrah/domain-contracts`.
- **Task Mutation** — `domains/tasks/hooks/use-task-mutations.ts`. Single seam for all task mutations across workspace views. Provides `createTask`, `updateTask`, `deleteTask`, `moveTask` (async functions) plus `createTaskMutation`, `updateTaskMutation`, `deleteTaskMutation`, `moveTaskMutation` (TanStack `UseMutationResult` objects). Uses TanStack Query `useMutation` with `onMutate` rollback for optimistic UI (same pattern as clients). Consistent error handling (transaction revert + toast). Auto-derives project/space from navigation context. Accepts partial changes.
- **Task Workspace** — `domains/tasks/components/TasksPageRedesigned.tsx`. Canonical Workspace seam for Task querying, Project/Space scoping, sidebar filters, pagination, view selection, and Task detail/create modals. Board, table, and list rendering share `TaskViewFrame`; all writes cross the Task Mutation module.
- **Document Draft** — `domains/docs/hooks/use-document-draft.ts`. Single seam for Document draft reconciliation, IndexedDB recovery, debounced local persistence, scheduled server autosave, save-version ordering, and recovery after failed writes. Pure conflict and restore rules live in `domains/docs/document-draft.ts`; the Document editor remains a UI adapter.

## Architecture Decisions

See `docs/decisions/` and `docs/lifecycles/` for ADRs and lifecycle documentation.

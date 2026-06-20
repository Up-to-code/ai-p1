# Tasks Domain — Deep Codebase Report

## 1. Overview

The **Tasks** domain is a core Work OS module inside the Workspace runtime app. It provides a Kanban-style task management interface with rich document editing, drag-and-drop status changes, context-aware mentions, and calendar integration. Tasks can exist at either the **workspace scope** (global) or **project scope**, and the UI adapts routing, mention sources, and actions accordingly.

---

## 2. File Structure

```
apps/workspace/src/domains/tasks/
├── api/
│   └── tasks.ts                 # Hooks + request functions (CRUD + stats)
├── components/
│   ├── tasks-screen.tsx         # Main split-pane screen (board + editor)
│   ├── task-grouped-list.tsx    # Kanban columns + draggable cards
│   └── slash-command-menu.tsx   # Editor slash-command helper
├── task-pipeline-order.ts       # Pipeline ordering logic
├── tasks.types.ts               # Domain types (TaskRecord, TaskFormValues, enums)
└── (implicit: docs/lifecycles/task-document-context/)
    ├── changes.md               # Lifecycle changelog
    └── risks.md                 # Known risks / trade-offs
```

---

## 3. Schema / Types (`tasks.types.ts`)

### Enums
- **`TaskStatus`**: `"todo" | "inProgress" | "waiting" | "done" | "canceled"`
- **`TaskPriority`**: `"low" | "normal" | "high" | "urgent"`
- **`TaskVisibility`**: `"private" | "team" | "workspace"`

### `TaskRecord` (server shape)
| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Unique identifier |
| `title` | `string` | Display title |
| `status` | `TaskStatus` | Pipeline column |
| `pipelineOrder?` | `number` | Float-based ordering within a column |
| `priority` | `TaskPriority` | Flag priority |
| `visibility?` | `TaskVisibility` | Sharing scope |
| `assigneeUserId?` | `string` | Assigned member |
| `clientId?` | `string` | Linked client |
| `projectId?` | `string` | Linked project (empty = global/workspace task) |
| `dueDate?` | `string` | ISO date (YYYY-MM-DD) |
| `description?` | `string` | HTML body (TipTap) |
| `tags?` | `string[]` | Categorization |
| `createdByUserId` | `string` | Author |
| `createdAt` | `number` | Epoch ms |
| `updatedAt` | `number` | Epoch ms |

### `TaskFormValues` (UI/draft shape)
- Mirrors `TaskRecord` but with **nullable defaults** for easier form handling.
- `tags` is a **comma-separated string** (converted to `string[]` on payload).
- `pipelineOrder` is optional during editing.

### `TaskStats`
- Aggregated counters: `total`, `open`, `dueToday`, `urgent`, `done`.

---

## 4. API / Data Layer (`api/tasks.ts`)

### Query Hooks (React Query via `useWorkspaceResource`)
- **`useTasksQuery(organizationId, options?)`**
  - Query key: `["tasks", organizationId, status, search, projectId]`
  - Fetches `TaskRecord[]` from the `tasks` workspace resource endpoint.
  - Supports filtering by `status` (`"all"` means sent as `undefined`), `search` (string), and `projectId`.
  - Returns `{ data, error, refetch }`.

- **`useTaskStatsQuery(organizationId)`**
  - Query key: `["tasks-stats", organizationId]`
  - Fetches aggregated `TaskStats` from `tasks/stats`.

- **`useTaskQuery(organizationId, taskId)`**
  - Query key: `["task", organizationId, taskId]`
  - Fetches a single `TaskRecord | null` from `tasks/${taskId}`.

### Mutations / Request Functions
- **`taskPayloadFromForm(values)`** — Transforms `TaskFormValues` into the API payload:
  - Converts `pipelineOrder` only if finite number.
  - Converts empty strings to `undefined`.
  - Splits `tags` string into trimmed, non-empty array.

- **`createTaskRequest(organizationId, values)`** — `POST` to `organizationApiPath(orgId, "tasks")`.

- **`updateTaskRequest(organizationId, taskId, values)`** — `PATCH` to `organizationApiPath(orgId, "tasks", taskId)`.

- **`deleteTaskRequest(organizationId, taskId)`** — `DELETE` to `organizationApiPath(orgId, "tasks", taskId)`.

All request functions use `requestOrganizationAction`, which handles auth headers, error normalization, and typed responses.

---

## 5. Component Hierarchy

### `TasksScreen` (main orchestrator)
**Location**: `components/tasks-screen.tsx`  
**Pattern**: Split-pane master/detail with overlay drawer.  
**Props**: `{ hideShell?, projectId? }`

Responsibilities:
- Manages global filters: `search`, `statusFilter`, `ownership`.
- Syncs selected task with URL query param (`taskId`).
- Orchestrates optimistic drag-and-drop mutations.
- Renders the page header, left Kanban board, and right TaskEditor drawer.
- Provides context-aware mention options for the editor.

Key sections:
1. **Header (`h-14`)** — Sticky top bar containing:
   - Title (`ListTodo` icon + "Tasks")
   - Status tabs (All, Todo, In Progress, Waiting, Done)
   - Search input
   - Ownership filter dropdown (`all`, `assignedToMe`, `sentByMe`)
   - "New" button (creates task and selects it)

2. **Board (`TaskGroupedList`)** — Left pane showing Kanban columns.

3. **Editor Drawer (`TaskEditor`)** — Right overlay (max-width 980px) with:
   - Action bar (Save, Schedule meeting, Fullscreen toggle, More menu)
   - Rich doc editor (`WorkOsDocEditor`)
   - Metadata pickers (Status, Priority, Assignee, Due Date)
   - Delete confirmation dialog

### `TaskGroupedList`
**Location**: `components/task-grouped-list.tsx`  
**Props**: `{ tasks, statusFilter, onTaskDrop, onTaskClick, selectedId }`

Responsibilities:
- Groups tasks by `TaskStatus` into columns (`todo`, `inProgress`, `waiting`, `done`).
- Sorts columns using `sortPipelineTasks` (by `pipelineOrder`).
- Implements drag-and-drop using `@hello-pangea/dnd`.
- Optimistically reorders tasks in local state on drag end.
- Renders task cards with title, due-date badge, priority badge, creator/assignee avatars.

Visual behavior per card:
- Completed tasks: strikethrough + emerald check-circle.
- Due-date color: red (overdue), amber (today), muted (future).
- Priority color: red (urgent), amber (high), muted (normal/low).
- Selected card: primary ring highlight.

### `TaskEditor`
**Location**: inline within `tasks-screen.tsx`  
**Props**: `{ task, organizationId, memberOptions, mentionOptions, onSaved?, onDeleted?, onClose?, showBackLink?, routeProjectId? }`

Responsibilities:
- Manages a local draft (auto-saved to `localStorage` under `qentrah:task-draft:{orgId}:{taskId}`).
- Tracks unsaved changes by comparing draft to server snapshot.
- Provides metadata controls via `DocEditorMetaField` array:
  - **Status** (`StatusPicker`) — pill-style dropdown with colored dot.
  - **Priority** (`PriorityPicker`) — pill-style dropdown with `Flag` icon.
  - **Assignee** (`AssigneePicker`) — searchable member picker with initials.
  - **Due Date** (`DueDatePicker`) — calendar popover.
- Handles save (explicit `Save` button, debounced to single network call).
- Handles delete with confirmation dialog.
- Supports fullscreen mode (fixed inset overlay).
- Supports scheduling a calendar meeting from task context (`createCalendarEventRequest`).
- Embeds `WorkOsDocEditor` for rich-text editing with mention support.

### Supporting Inline Components (inside `tasks-screen.tsx`)
- **`StatusPicker`** — `Popover` with status pills + colored dot indicators.
- **`PriorityPicker`** — `Popover` with priority pills + `Flag` icon in priority color.
- **`DueDatePicker`** — `Popover` wrapping `Calendar` (single-select).
- **`AssigneePicker`** — `Popover` with search input + member list using initials avatars.
- **`TaskBoardSkeleton`** — Loading placeholder mimicking board columns.
- **`useMemberOptions`** — Hook fetching organization members via `listOrganizationMembers`, injecting "Me" as first option if current user not present.

---

## 6. Data Flow & State Management

### Queries
- Tasks list and stats are queried via custom hooks using `useWorkspaceResource` / `useWorkspaceResourceResult`, which wrap React Query.
- Query keys encode `organizationId`, filters, and `projectId` to enable granular invalidation.
- Errors are surfaced directly to the UI for retry UX.

### Mutations (Optimistic Updates)
- `moveTaskMutation` handles drag-and-drop:
  - `onMutate`: cancels in-flight queries, restores previous state for rollback, computes new `pipelineOrder` for the target column, updates all `["tasks", orgId]` query entries.
  - `onError`: restores previous entries from context.
  - `onSuccess`: applies server-confirmed task, invalidates only `["tasks-stats", orgId]`.
- `saveDraft` updates:
  - PATCHes task via `updateTaskRequest`.
  - Updates both list (`["tasks", orgId]`) and detail (`["task", orgId, taskId]`) caches directly.
  - Clears `localStorage` draft on success.

### Local Draft Persistence
- Draft is initialized from server task form + `localStorage` cache.
- Every draft change triggers `useEffect` writing to `localStorage`.
- "Saved in browser" status shown when draft differs from snapshot but no network request pending.

---

## 7. Key User Workflows

### Create Task
1. User clicks **New** in header.
2. `createNewTask()` calls `createTaskRequest` with empty defaults (`emptyTask`).
3. Response creates the task; UI refreshes stats and selects the new task.
4. `TaskEditor` opens in drawer with blank form.

### Edit Task
1. User clicks a task card → `TaskEditor` drawer opens with that task's data.
2. Fields are rendered from `DocEditorMetaField[]`.
3. Metadata changes update local `draft` instantly.
4. Document title/body update `draft` via blur/change.
5. User clicks **Save** → network PATCH → cache update → localStorage cleared → success toast.

### Drag-and-Drop
1. User drags a card in `TaskGroupedList`.
2. `handleDragEnd` computes `pipelineOrder` using `nextTaskPipelineOrder`.
3. Local state updates immediately for smooth UX.
4. `onTaskDrop` triggers `moveTaskMutation` in parent.
5. Mutation optimistically updates all task lists, then reconciles with server response.

### Filter & Search
- Status tabs filter columns in `TaskGroupedList`.
- `search` filters against title, description, assignee, and tags.
- `ownership` filter limits tasks to `all`, `assignedToMe`, or `sentByMe`.

### Calendar Scheduling
- From `TaskEditor`, user opens **Schedule meeting** popover.
- Sets date + start/end time.
- `scheduleMeetingFromTask` calls `createCalendarEventRequest` with:
  - Task title, assignee, client, project.
  - `taskId` linkage in notes.
- Invalidates calendar queries on success.

### Project vs Global Context
- Context determined by `taskDocumentContext(organizationId, routeProjectId, taskProjectId)`.
- Affects mention hrefs, routing, and task scope labels.

---

## 8. Integration Points

| Integration | Usage |
|-------------|-------|
| **Calendar** | `createCalendarEventRequest` from `@/domains/calendar/api/calendar` |
| **Auth / Org** | `useAccountContext`, `organizationApiPath`, `requestOrganizationAction` |
| **Projects** | `useCurrentProjectId`, `useProjectOptionsQueryResult` |
| **Clients** | `useClientOptionsQuery` |
| **Mentions** | `WorkOsDocEditor` + `useTaskMentionOptions` (members, clients, projects, tasks) |
| **Routing** | `Link`, `useRouter`, `usePathname`, `useSearchParams` for locale-aware URLs |
| **Drag & Drop** | `@hello-pangea/dnd` |
| **Dates** | `date-fns` `format` |
| **Notifications** | `useToast` |

---

## 9. Styling / Design System Patterns

- Utility-first with **Tailwind CSS**.
- Consistent component primitives from `@/components/ui/` (Button, Popover, Calendar, DropdownMenu, Skeleton, Toast).
- Design tokens: `bg-background`, `text-foreground`, `border-border`, `text-text-muted`, `bg-card`, `bg-muted`, `text-primary`, `ring-primary`.
- RTL support via logical properties (e.g., `ps-6` instead of `pl-6`).
- Animations: `transition-all`, `animate-pulse`, `duration-300`.

---

## 10. Lifecycle Documentation

- **`docs/lifecycles/task-document-context/changes.md`** — Chronological record of feature additions, fixes, and behavior changes for the context-aware task document system.
- **`docs/lifecycles/task-document-context/risks.md`** — Known risks, trade-offs, and edge cases (e.g., overlay stacking, draft persistence, optimistic update correctness).

---

## 11. Notable Implementation Details

1. **`pipelineOrder`** is a float-based ordering number allowing insertion between existing items without renumbering. `nextTaskPipelineOrder` computes it from a sorted list.
2. **Draft-first editing** avoids backend writes on every keystroke. Draft is browser-local until explicit save.
3. **Overlay drawer** uses `fixed inset-0 z-40` with backdrop blur. Delete dialogs and popovers use higher z-index (`z-[60]`) to escape the drawer.
4. **Locale-aware links**: mention hrefs are normalized at insertion time to include the current browser locale prefix (`/en`, `/ar`, etc.).
5. **Hydration safety**: `TaskGroupedList` delays render until mounted (`useEffect(() => setMounted(true), [])`) to avoid DND hydration mismatches.

---

## 12. Summary

The Tasks domain is a self-contained module with clear separation between:
- **Data fetching** (`api/tasks.ts`)
- **Domain types** (`tasks.types.ts`)
- **UI orchestration** (`tasks-screen.tsx`)
- **Board presentation** (`task-grouped-list.tsx`)
- **Ordering logic** (`task-pipeline-order.ts`)

Its architecture favors **optimistic updates**, **local draft persistence**, and **context-aware routing/mentions**, making it a representative example of the Workspace runtime's approach to interactive, stateful business tools.
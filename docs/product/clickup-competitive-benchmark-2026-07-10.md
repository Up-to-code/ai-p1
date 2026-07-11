# Qentrah × ClickUp product benchmark — 2026-07-10

Status: live product audit completed against the authenticated ClickUp workspace and Qentrah localhost workspace.

## Benchmark intent

ClickUp is a parity reference, not Qentrah's product definition. Qentrah should adopt the interaction patterns that make work fast and trustworthy while keeping its stronger agency model: Client -> Opportunity -> scoped delivery Project -> team -> schedule/time -> reporting -> durable agent execution.

The audit covered ClickUp's global navigation, sidebar hierarchy, List, Board, task detail, My Work, view controls, creation entry points, collaboration surfaces, and AI entry points. No ClickUp data was created, edited, or deleted.

## Executive finding

Qentrah's largest gap is not another view type. It is the missing operating loop between attention, capture, execution, and follow-up.

ClickUp gives a user four clear starting modes:

1. Capture something from anywhere.
2. See work requiring personal attention.
3. Enter a shared hierarchy and manipulate work inline.
4. Open a task as the complete history and control surface for that work.

Qentrah currently enters the product through an All Tasks surface and exposes domain pages, but the personalized command center, task record completeness, saved-view fidelity, and collaboration-to-work loop remain incomplete.

## Live capability comparison

| Capability | ClickUp behavior observed | Qentrah current state | Recommendation | Priority |
|---|---|---|---|---|
| Universal capture | Persistent Create Task plus quick access to Reminder, Doc, Clip, Notepad, and search | New task exists inside task surfaces; creation is fragmented by domain | Add one global Create menu with context-aware Task, Project, Client, Opportunity, Doc, Event, and Channel actions | P1 |
| Personal work | My Work separates Today, Overdue, Next, Unscheduled, Done, and Delegated | My Tasks and sidebar filters exist; `/ws` is not yet a personal command center | Implement W2.2 as the daily operating surface, including delegated/sent work | P0 |
| Attention inbox | Primary, Replies, Assigned Comments, Chat Activity, Drafts & Sent, Posts | Inbox/Replies/Activity/Posts routes exist, but several are capability-gated or incomplete | Make Inbox attention-only; add assigned comments and durable notification reasons | P1 |
| Workspace hierarchy | Workspace -> Space -> Folder -> List with sidebar search and quick settings | Organization -> Space -> Project is a cleaner domain model | Keep Qentrah's three layers; add searchable projection, favorites/recent, and inline management without copying Folder/List nesting | P1 |
| Views | List, Board, Calendar, Doc, Add View; view-specific controls | Table, Board, List are canonical; other views are partial or unavailable | Ship only real views; saved configuration and URL restoration matter more than view count | P1 |
| View controls | Group, Subtasks, Sort, Filter, Closed, Assignee, Search, Customize | Group/search/saved views are partial and inconsistent across renderers | Complete T3.4/T3.5 with one state contract shared by Table/List/Board | P0 |
| Board | Custom statuses, inline Add Task, quick due date/priority/assignee/comment controls, drag/drop | Fixed status union, drag/drop, Add Task, card action menu, assignment/status/delete | Add persisted task workflow states, inline metadata editing, and card density controls | P1 |
| Task identity | Stable task ID, breadcrumbs, share, settings, created timestamp | URL-addressable task detail exists but not all scopes have one controller | Complete T3.8; preserve context when opening/closing a task | P0 |
| Task metadata | Status, next status, close, people/teams, start/due dates, priority, time, tags, custom fields | Status, assignee, due date, priority, tags, and custom fields exist in parts; start date/time are incomplete | Unify metadata into one task profile; add start date and honest unavailable states | P1 |
| Task body | Rich description, AI actions, cover | Shared editor exists, with Task/Doc cutover still incomplete | Complete E4 shared Work Editor before expanding presentation features | P1 |
| Task decomposition | Subtasks and checklists are first-class | Checklist contracts exist; full task UI and subtask lifecycle are incomplete | Add parentTaskId/subtask lifecycle and checklist round-trip in T3.10 | P1 |
| Files and relations | Attachments, related items, links, task mentions | Mentions/attachments exist in collaboration/editor modules; task relations are incomplete | Build scoped task attachments and related-record links through the shared editor | P1 |
| Collaboration | Activity, comments, followers, comment search/filter, mentions, thread AI | Channels/messages/mentions exist; task comments/activity/followers are not a complete loop | Make task comments a scoped collaboration adapter and emit Inbox attention events | P1 |
| Time | Start timer directly on task; time hub in global navigation | Time UI contains mock data; durable model is planned in A5.7 | Do not expose as enabled until TimeEntry persistence and lifecycle invariants ship | P1 |
| Reminders | Global Reminder creation and personal scheduled work | Notification reminder backend exists; product entry points are disconnected | Expose reminders from tasks/calendar after source-linked notification UX is complete | P2 |
| Bulk work | Bulk Task Creation is a named AI workflow | Agent proposals exist conceptually; durable runs are Wave 6 | Differentiate with scoped, reviewable, idempotent task proposals rather than copying bulk forms | P1 |
| AI in context | Brain is available globally, on tasks, in comments, and for content generation | Eve and MCP foundations are stronger but not consistently surfaced in work | Add task-aware Ask/Plan/Transform actions backed by ActionGate and durable AgentRun | P1 |
| Peripheral hubs | Dashboards, Whiteboards, Forms, Clips, Goals, Pulse | Some equivalents are absent or incomplete | Do not chase breadth before the agency operating loop and task trust gates are complete | P3 |

## UX principles worth adopting

### 1. Personal attention before database navigation

The user's first question is “what needs me now?”, not “which table contains my work?”. Qentrah `/ws` should prioritize overdue, today, blocked/waiting, assigned comments, delegated work, and recently changed client delivery.

### 2. Capture is global; defaults are contextual

Creation should always be reachable, but organization, Space, Project, status, assignee, and source Client should derive from the current context. The user should not repeatedly reconstruct scope.

### 3. Keep metadata editable where it is read

ClickUp makes status, priority, dates, and assignee actionable in List, Board, and task detail. Qentrah should use the same mutation seam everywhere and reserve the full editor for content requiring context.

### 4. A task is a durable work record

The task detail must combine identity, scope, description, metadata, decomposition, files, related records, comments, activity, and agent outputs. Opening it should preserve the surrounding view and URL.

### 5. Views are saved interpretations, not separate products

Grouping, filters, sort, fields, density, closed-state visibility, and scope must restore exactly. Table/List/Board should consume one TaskWorkspace state contract and mutation controller.

### 6. Progressive disclosure beats permanent chrome

Show title, state, owner, time pressure, and one primary action first. Put rare administration and advanced metadata behind menus or detail surfaces. This is especially important because Qentrah already spans delivery and CRM domains.

### 7. Collaboration must resolve back to work

A comment, mention, notification, or channel message must identify its source record and let the user act without losing context. Inbox should explain why an item needs attention and what completing the attention action means.

### 8. Customization requires guardrails

ClickUp's flexibility produces density and discoverability costs. Qentrah should use opinionated agency defaults, allow saved personal views, and keep administrative customization scoped to explicit settings.

### 9. AI should propose accountable work, not decorate every input

ClickUp exposes AI broadly. Qentrah should differentiate through scoped proposals, immutable approved intent, idempotent execution, progress, partial-failure recovery, and links to created outputs.

## Patterns Qentrah should not copy

- Do not introduce ClickUp's Folder/List layers; Organization -> Space -> Project is sufficient and maps better to permissions.
- Do not add Whiteboards, Clips, Forms, Goals, and Pulse before the agency operating loop is trustworthy.
- Do not show disabled or decorative controls merely to imply breadth.
- Do not duplicate global rail, full sidebar, domain sidebar, and page navigation without a clear ownership rule.
- Do not rely on unlabeled icon buttons for essential actions.
- Do not let customization create inconsistent task semantics across Spaces or Projects.
- Do not expose time or financial facts before they are persisted and auditable.

## Recommended execution packets

### Packet 1 — Personal command center

Current behavior: `/ws` behaves as an All Tasks entry point.

Structural improvement: implement W2.2 around Today, Overdue, Waiting/Blocked, Assigned to me, Delegated/Sent, assigned comments, and recent client-delivery changes.

Validation: direct load and refresh preserve state; every item links to its source; true-empty and filtered-empty are distinct.

### Packet 2 — Canonical TaskWorkspace state

Current behavior: canonical renderers exist, but view controls and persistence are incomplete.

Structural improvement: complete T3.1-T3.5 so scope, grouping, filters, sort, fields, density, closed visibility, and active view have one typed URL/persistence contract.

Validation: the same saved view reproduces exactly after refresh in Table/List/Board.

### Packet 3 — Complete task record

Current behavior: core metadata and editor pieces exist across multiple components.

Structural improvement: finish T3.8/T3.10 and E4: start/due dates, checklists, subtasks, attachments, related records, comments, activity, mentions, and access states through one detail controller.

Validation: create/open/edit/move/complete/comment/attach/reload works in workspace, Space, and Project scopes.

### Packet 4 — Persisted custom task workflows

Current behavior: task status is a fixed union; “New stage” cannot be implemented truthfully.

Structural improvement: add organization/Space/Project-scoped task workflow definitions and states, migration from the five defaults, role-aware management, and task state references.

Validation: create/rename/reorder/archive a state; move tasks safely; prevent removal with unresolved tasks; preserve historical state labels.

### Packet 5 — Attention collaboration loop

Current behavior: channels and mentions exist, but task comments and assigned-comment attention are incomplete.

Structural improvement: introduce scoped task comments, assignment/following, activity events, and Inbox attention adapters.

Validation: mention/assign/reply/read/resolve produces one durable notification and returns to the correct task context.

### Packet 6 — Agency differentiation

Current behavior: Client, Opportunity, Project, Calendar, AI, and permission foundations exist but are not one operating loop.

Structural improvement: execute Wave 5 and Wave 6 before peripheral feature expansion.

Validation: Client -> won Opportunity -> scoped staffed Project -> schedule/time/report -> approved agent work is measurable, idempotent, and auditable.

## Product position after parity

ClickUp optimizes for “everything work can be.” Qentrah should optimize for “how a small agency wins, delivers, communicates, and learns without losing scope or accountability.”

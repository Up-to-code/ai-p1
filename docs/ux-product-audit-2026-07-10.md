# Qentrah product and UX audit — 2026-07-10

Status: active working audit

This audit combines a live browser pass against the local workspace (`localhost:3000`) with the product context, roadmap, and permission decisions in this repository. It is intentionally written as a durable handoff for follow-up implementation packets.

Competitive reference: `docs/product/clickup-competitive-benchmark-2026-07-10.md` records the live ClickUp capability and UX-principles comparison.

## Live pass completed

- `/en/ws`: loads into a task table, but the first render is visually almost blank for roughly three seconds and the route is still an All Tasks table under a Home shell.
- `/en/ws/inbox`: resolves to the canonical `/en/inbox` surface and presents truthful Inbox states and channel entry points.
- `/en/ws/spaces`: resolves and presents the truthful empty state “No spaces yet” with a real “Create New Space” action.
- `/en/clients`: route renders the client workspace, but direct load can remain in “Loading workspace…” during the initial data transition.
- `/en/opportunities`: route renders a usable board/list shell with stage filtering and search controls.
- `/en/calendar`: route renders the redesigned week calendar with previous/next/today, period switching, and event creation controls.
- `/en/docs`: route renders the docs shell with folder/doc creation and search controls.
- `/en/team`: route renders active/pending member tabs, search, roles, dates, status, and per-member action menus.

## Findings

### P0 — trust or data-safety blockers

No destructive or cross-organization behavior was exercised in the live pass. Security regression coverage remains the tracked blocker in issue #14 and must be tested with owner/admin/member/viewer/outsider fixtures before release.

### P1 — workflow and information architecture

1. `/ws` is implemented through the older `domains/projects/components/views/task-table-view.tsx` renderer and passes an empty project id. This duplicates the canonical task renderer used by `/tasks`, makes the workspace route semantically ambiguous, and risks workspace-wide filtering behavior diverging from My Tasks and project task views.
2. The sidebar panel title is “Home”, while its primary workspace destination is labeled “All Tasks”. This makes `/ws` feel like a route alias instead of a personalized command center. The roadmap explicitly calls for W2.2 to make `/ws` personal and attention-oriented.
3. The initial `/ws` loading state has very little explanatory content: the main pane can look empty before rows arrive. Loading, true-empty, filtered-empty, forbidden, and error states should be visually distinct per the roadmap.
4. Multiple domain workspaces expose the same generic view vocabulary (Table, Board, Calendar, Timeline, Box) even where a view is unavailable or not yet meaningful. Unavailable views should be disabled or omitted with a clear reason rather than appearing as peer choices.

### P2 — usability and polish

1. The task surface is dense and exposes many controls before the user has a project or saved view context. A compact “what needs attention” summary would make the command center more useful than a flat record dump.
2. Empty space states are truthful, but should explain what a Space is, what it controls, and who can create one before asking the user to act.
3. Cross-domain route transitions should preserve a consistent page title, active navigation item, loading treatment, and error recovery affordance.
4. Team and task tables expose duplicated accessibility table projections in the browser tree. This may be an intentional responsive/virtualized table implementation, but it should be checked for duplicate screen-reader announcements and keyboard traversal.

## Priority implementation plan

1. Consolidate `/ws` on the canonical task workspace renderer and add a regression test preventing it from importing the legacy project task table.
2. Replace the `/ws` shell with a personalized command-center composition: attention summary, overdue/upcoming work, assigned tasks, and clear entry points to All Tasks, Inbox, Spaces, and Projects. Keep the current task workspace available as `/tasks`.
3. Standardize route loading/error/empty states and add recovery actions for every primary domain.
4. Audit view registries so unavailable capabilities are disabled or removed, with truthful copy.
5. Run the permission matrix and CRUD parity pass across create/open/edit/move/complete/delete for Tasks, Docs, Clients, Deals/Opportunities, Calendar, Spaces, Channels, and Team.
6. Add route-level browser tests for canonical redirects, direct loads, active navigation, refresh persistence, and same-origin links.

## Acceptance gates

- `/ws` is personal on first load and no longer a duplicate All Tasks renderer.
- No enabled control is decorative or silently inert.
- Loading, forbidden, error, filtered-empty, and true-empty states are distinguishable.
- Core task capture remains under ten seconds and a cancel action writes nothing.
- No cross-organization or out-of-scope records appear in the security matrix.

## Task view consolidation packet — 2026-07-10

- `/ws` and `/tasks` now share the canonical task view frame.
- Project detail table/list/board entry points now use the canonical task views instead of the duplicate project renderer; the old project task table/list/board wrappers were removed.
- Board cards and status columns use shadcn `Card`, `Badge`, and `Button` primitives with semantic theme tokens. Hard-coded legacy dark hex backgrounds were removed.
- Grouped List uses the shared shadcn `Table` primitives and displays sanitized task descriptions.
- Native drag/drop remains wired through the existing task mutation seam and is covered by source-level regression checks.
- Board cards now expose a shadcn/Base UI action menu for claim, assignment, status changes, and confirmed deletion without interfering with drag/drop.

Custom task stages are not being faked in the client: the current task backend stores a fixed status union (`todo`, `inProgress`, `waiting`, `done`, `canceled`). A real “New stage” feature needs a scoped workflow-state model and persistence packet before a button can safely be enabled.

# Qentrah Agent Execution Roadmap

## Objective

Build Qentrah into a trustworthy AI-native operating system for agencies: fast capture, scoped collaboration, reliable delivery, and durable agent execution. This document compresses the six product plans into small worker packets so future agents receive only the context they own.

## Worker Protocol

- Maximum six concurrent workers, with disjoint write ownership.
- No worker receives the full conversation. Send the task row, its direct dependencies, `AGENTS.md`, `CONTEXT.md`, relevant decisions, and the applicable skill.
- Convex is the source of truth for server-owned data. UI stores hold only UI state and drafts.
- Every enabled action must have a real effect. Loading, forbidden, error, filtered-empty, and true-empty are distinct states.
- Every scoped read and write derives the actor server-side and enforces Organization -> Space -> Project access.
- One task equals one future PR. Agents do not commit, push, or open PRs until parent review.
- Review after every wave: inspect diff, run focused tests, run workspace typecheck, and verify the wave acceptance gate before launching dependents.

## Model Router

| Class | Model | Effort | Use |
|---|---|---|---|
| L | GPT-5.6 Luna | low | Mechanical cleanup, route aliases, pure helpers, narrow invariants, source guards |
| M | GPT-5.6 Terra | medium | One domain Module, frontend/backend adapter, focused schema/query work |
| C | GPT-5.6 Sol | medium | Shared security Interfaces, migrations, idempotency, cross-domain orchestration |

Escalate effort only after a worker reports a concrete blocker or fails review twice. Do not use high/xhigh by default.

## Dependency Graph

```text
Wave 0 Foundations
  -> Wave 1 Trust Migration
       -> Wave 2 Workspace
       -> Wave 3 TaskWorkspace
       -> Wave 4 Work Editor
            -> Wave 5 Agency Loop
                 -> Wave 6 Agentic Execution
```

## Wave 0 - Foundations

| ID | Class | Depends | Ownership | Outcome |
|---|---|---|---|---|
| F0.1 | C | - | `convex/access`, `convex/spaces` | First deep access Interface with Space adapter and role/cross-org tests |
| F0.2 | M | - | `convex/theories`, Theory client hook | Server-derived identity and creator-only private Theory reads |
| F0.3 | L | - | Route catalog, workspace params, rail restoration | Typed canonical routes, param policy, and active-domain matching |
| F0.4 | L | - | Product capability manifest, nav, fake route pages | Time, Posts, synthetic Replies/Activity cannot appear enabled |
| F0.5 | M | - | Shared WorkOs/Yoopta files | Working compact mode and no persisted temporary media URLs |
| F0.6 | L | - | `clientTasks/write.ts` | Correct complete/reopen/recomplete timestamp invariant |

Wave gate: focused tests pass, workspace typecheck passes, no worker edits another worker's ownership, and disabled capabilities contain no actionable mock UI.

## Wave 1 - Trust Migration

| ID | Class | Depends | Ownership | Outcome |
|---|---|---|---|---|
| F1.1 | C | F0.1 | Project access policy and existing read/write functions | Record-aware Project access through owner, direct membership, linked Spaces, and visibility |
| F1.2 | M | F0.1,F0.6 | Task read/write access | Accessible workspace/Space/Project/My Task results; no client permission reuse |
| F1.3 | M | F0.1 | Doc read/write access | Effective Doc visibility cannot exceed parent Project access |
| F1.4 | C | F0.1 | Inbox Channel/message/thread writes | Linked-scope authorization and channel-message compound verification |
| F1.5 | M | F0.1 | Project dashboard Convex/persistence | Authenticated project-scoped dashboard source of truth |
| F1.6 | C | F0.1 | MCP connections/tool execution/handlers | Central connection ScopePolicy on every tool call |
| F1.7 | M | F1.1-F1.6 | Security regression tests only | Owner/admin/member/viewer/outsider matrix across all migrated resources |

Wave gate: zero cross-org or out-of-scope records in tests; all touched Convex functions have args/returns validators and bounded/indexed reads.

## Wave 2 - Workspace And Collaboration

| ID | Class | Depends | Ownership | Outcome |
|---|---|---|---|---|
| W2.1 | L | F0.3,F0.4 | Alias page files and redirect tests | Locale-safe canonical redirects; duplicate route renderers removed |
| W2.2 | M | F1.2 | `/ws` and workspace overview Module | Personal command center, not an All Tasks duplicate |
| W2.3 | M | F1.4 | `/channels`, channel list/detail | Channels own conversations; Inbox no longer browses channels |
| W2.4 | M | F0.1,F1.1 | Space sidebar projection | Only junction-linked accessible Projects appear under a Space |
| W2.5 | M | W2.4 | `/spaces/[slug]`, Space management | Rename/color/icon/link/member actions with real capabilities |
| W2.6 | L | F1.1 | `/projects/[projectId]` route | Every internal Project link resolves to a real detail page |
| W2.7 | L | F0.3 | Sidebar persistence | Width stored through scoped IndexedDB config, not ad hoc localStorage |
| W2.8 | L | W2.2-W2.7 | Sidebar content cleanup | No hardcoded channels, duplicate My Task links, or inert buttons |
| W2.9 | M | W2.1-W2.8 | Route and navigation E2E tests | One active item, valid same-origin links, correct direct-load chrome |

Wave gate: one canonical owner per route; `/ws` is personalized; Inbox is attention; Channels are collaboration; Spaces use `projectSpaces`.

## Wave 3 - Canonical TaskWorkspace

| ID | Class | Depends | Ownership | Outcome |
|---|---|---|---|---|
| T3.1 | M | F1.2,F0.3 | `domains/tasks/workspace` | Typed scope/state Interface and URL parser without caller cutover |
| T3.2 | M | T3.1 | Task workspace data hook | Honest loading/error/data/metadata states |
| T3.3 | C | T3.1,T3.2 | Task and Project table/list/board adapters | One renderer set; duplicate ~600-line implementations retired |
| T3.4 | M | T3.1 | `QentrahTable` | Selection and column-state Interfaces with stable public compatibility |
| T3.5 | M | T3.4 | Saved views and URL state | Width/order/visibility/filter/sort/group/density restore exactly |
| T3.6 | C | F1.2,T3.2 | Convex Task pagination | Cursor reads for workspace/My/Space/Project scopes |
| T3.7 | M | T3.1,T3.6 | Task quick/inline create | Cancel writes nothing; submit writes once and opens detail |
| T3.8 | M | T3.1 | Task detail controller/routes | One URL-addressable detail surface in every scope |
| T3.9 | C | T3.4,F1.2 | Task bulk actions | Permission-aware operations with partial-failure reporting |
| T3.10 | M | T3.2 | Task metadata/time hooks | Real tags/fields/checklists; unavailable time controls stay disabled |
| T3.11 | M | T3.3-T3.10 | Task parity E2E tests | Create/open/edit/move/complete across table/list/board and scopes |

Wave gate: one TaskWorkspace powers All Tasks, My Tasks, and Project tasks; capture is under ten seconds; saved views reproduce the visible state.

## Wave 4 - Shared Work Editor

| ID | Class | Depends | Ownership | Outcome |
|---|---|---|---|---|
| E4.1 | M | F0.5 | `domains/work-editor` Interfaces | Compatibility shell with Doc and Task profiles |
| E4.2 | M | E4.1 | Yoopta internal adapters | Engine, controls, formatting, mentions, and media separated internally |
| E4.3 | C | E4.1,E4.2 | Doc/Task editor adapters | Docs retain autosave; Tasks retain explicit save/drafts |
| E4.4 | C | F1.2,F1.3,E4.3 | Revision persistence | Stale writes conflict; pending autosave flushes; stale drafts prompt |
| E4.5 | M | F1.2,F1.3,E4.3 | Editor access adapter | Read-only and denied states consume Trust Foundation policy |
| E4.6 | M | E4.3 | Scoped media adapter | Durable Doc/Task assets, retries, no blob persistence |
| E4.7 | M | E4.3 | Metadata profiles/custom fields | Tags/templates/fields round-trip per domain |
| E4.8 | C | F1.4,E4.3 | Mention relations | Accessible @people/[[record]] targets and transactional notifications |
| E4.9 | L | E4.3-E4.8 | Editor cutover/deletion | Registry updated; obsolete wrappers/imports removed after parity |
| E4.10 | M | E4.4-E4.9 | Editor E2E tests | Autosave conflict, draft recovery, media, mentions, read-only behavior |

Wave gate: Docs and Tasks use one editor Interface with two real adapters; no silent overwrite, temporary media, or decorative-only mentions.

## Wave 5 - Agency Operating Loop

| ID | Class | Depends | Ownership | Outcome |
|---|---|---|---|---|
| A5.1 | L | - | Sales naming/docs/adapters | Declare SalesOpportunity canonical and Deal as display copy |
| A5.2 | C | A5.1,F1.1 | Deals-to-Opportunity migration | One writable sales source with preserved links and compatibility reads |
| A5.3 | M | A5.2 | Handoff schema/mutations | Won creates/reuses a pending delivery handoff |
| A5.4 | C | A5.3,F1.1 | ProjectProvisioning Module | Idempotent Project + primary Space + owner/team + source link |
| A5.5 | M | A5.4 | TeamAssignment Module/UI | Better Auth org members persisted as Project members with roles |
| A5.6 | M | T3.6,A5.4 | ScheduleProjection | Task due dates and events appear once and write to their source |
| A5.7 | C | A5.4 | TimeEntry schema/lifecycle | One active timer/user; manual/start/stop entries scoped to work |
| A5.8 | M | A5.7 | DeliveryEconomics | Spent/remaining/burn derive only from persisted entries |
| A5.9 | M | W2.2,A5.4,A5.5 | Resumable activation | First Space/Client/Project/team outcomes and visible invite retries |
| A5.10 | M | A5.2-A5.9 | Agency loop E2E | Client -> won work -> scoped staffed Project -> schedule/time/report |

Wave gate: one canonical sales pipeline; no orphan Projects; no simulated financial facts; median won-to-project time is measurable.

## Wave 6 - Durable Agentic Execution

Implementation note (2026-07-19): the owner-scoped Published Custom Agent
lifecycle and the Automation-specific durable Run/Step engine are implemented,
including immutable definition/Agent snapshots, encrypted provider Connections,
schedule/webhook/manual commissioning, idempotency, cancellation, recovery,
Google Sheets input, and WhatsApp output. This is a production slice of durable
execution, not completion of the broader G6.1-G6.9 IntentPlan, ActionGate, task
proposal, and inline-editor scope below.

| ID | Class | Depends | Ownership | Outcome |
|---|---|---|---|---|
| G6.1 | C | F1.6 | AgentRun schema/queries | Durable runs, steps, attempts, approvals, outputs, and errors |
| G6.2 | C | F1.6,G6.1 | Agent ScopePolicy adapter | Every plan and step is bound to accessible Organization/Space/Project |
| G6.3 | C | G6.1,G6.2 | IntentPlan and ActionGate | Typed immutable proposals and single-use approval tokens |
| G6.4 | C | T3.7,G6.3 | Idempotent task execution | Approved 3-5 task proposal survives retry without duplicates |
| G6.5 | M | F0.2,G6.1 | Theory lifecycle | Explicit measurable hypothesis promotion; ordinary answers create none |
| G6.6 | M | F1.6 | ToolContract | One typed source generates Eve and MCP catalogs |
| G6.7 | M | G6.1-G6.4 | Proposal/run UI | Convex-backed progress, cancel/retry, partial failure, output links |
| G6.8 | M | E4.10,G6.3 | Inline Brain transactions | Preview/accept/reject/undo editor actions through approved plan contract |
| G6.9 | C | G6.2-G6.8 | Agent security/E2E tests | Prompt injection, scope change, replay, cancellation, refresh, retry |

Wave gate: approved intent is immutable, execution is idempotent and auditable, progress survives refresh, and private Theories remain private.

## Program Metrics

- Unauthorized cross-scope records returned: `0`.
- Enabled production controls without a real effect: `0`.
- Median task capture time: `< 10 seconds`.
- Orphan Projects without primary Space/owner: `0`.
- Duplicate records from agent retries: `0`.
- Won-to-project conversion, activation-to-first-project, approval rate, partial-failure recovery, and delivery-to-read notification latency are instrumented before optimization.

# Architecture Deepening Baseline — 2026-07-13

This is the Wave 0 comparison point for the Qentrah Architecture Deepening
Program. Generated sources are counted in repository totals but excluded from
large handwritten Module prioritization.

## Repository state

- Existing user-owned modifications were present in `.vercelignore`, Better
  Auth/Convex files, the Workspace package manifest and lockfile, and the
  personal MCP screen. Wave 0 does not modify them.
- Workspace TypeScript files across Workspace, Convex, Eve, and MCP gateway:
  1,494 files and 148,792 lines including generated Convex output.
- Convex exported query/mutation/action declarations: 317.
- Eve tool files: 65.
- Workspace public files: 70.
- Source files containing `useEffect`: 106. This is an audit inventory, not a
  deletion target; browser integration and draft reconciliation remain valid.
- route pages/layouts explicitly marked `use client`: 7.
- handwritten source files over 400 lines: 53.

## Largest handwritten Modules

| Lines | Module |
|---:|---|
| 1,295 | Task board Adapter |
| 1,230 | Task table Adapter |
| 985 | shared Yoopta editor implementation |
| 898 | Inbox channel screen |
| 852 | Organization screen |
| 795 | Task list Adapter |
| 782 | Inbox message list |
| 747 | Convex domain schema composition |
| 700 | Client table view |
| 691 | Inbox message composer |
| 689 | MCP tool catalog |
| 681 | legacy/consolidated permission implementation |
| 672 | Inbox writes |

Line count identifies investigation order only. A refactor is accepted when it
improves leverage, locality, testability, security, or runtime behavior—not when
it merely creates smaller files.

## Baseline verification

| Check | Result |
|---|---|
| `npm --workspace @qentrah/workspace run typecheck` | Passed with zero errors |
| Access regression matrix | Passed |
| MCP ScopePolicy tests | Passed |
| MCP connection permission tests | Passed |
| Focused security total | 28 tests passed across 3 files |

The initial `@qentrah/domain-contracts` full-suite run exposed a stale aggregate
test importing removed `./errors`, `./profiles`, `./oauth`, and `./workOs`
Modules. Issue #27 replaced that obsolete test surface with current Client,
Task, Deal, Project, and Space contract checks. The package now passes 14 tests
across two files.

The production build, full Vitest suite, Playwright suite, client bundle report,
and asset reachability smoke test remain packet gates because they are slower or
require runtime services. Their first result must be attributed to the packet
that runs them, not retroactively to Wave 0.

## Known architectural pressure

1. Better Auth migration work is active in the dirty tree; do not delete
   compatibility code until token forwarding and actor parity are verified.
2. Domain contracts and Convex validators have duplicated shapes and known
   Client priority drift.
3. Route classification, localization, navigation, and proxy rules repeat facts.
4. Task board/table/list repeat behavior across 3,320 lines.
5. MCP metadata, schemas, permissions, registration, and handlers do not share
   one executable manifest.
6. Eve and MCP repeat domain tool contracts; the generic Eve update helper does
   not enforce domain-owned writable fields.
7. Public assets use implicit string paths and require a reachability audit
   before deletion.

## Issue ownership

- #10: MCP feature expansion and remaining sync work.
- #11: reliability/performance umbrella and newly discovered gaps.
- #12: platform-readiness artifacts and scorecard.
- #15: Workspace command center.
- #16: canonical TaskWorkspace.
- #17: shared Work Editor.
- #18: canonical SalesOpportunity and agency loop.
- #19: durable agentic execution.
- #24: Better Auth MCP OAuth enrollment.

New issues are required only for architecture packets not safely owned by these
issues: identity/access consolidation, executable domain contracts, route and
locale policy, MCP execution manifest/scope, Eve actor/domain adapters, and
asset/dead-code cleanup.

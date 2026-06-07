# Dependency Map

This map gives agents the execution order. Use [tasks.md](./tasks.md) for the
full checklist and each task file for exact acceptance gates.

## Phase 0 - Baseline

Must complete first:

- T00-001
- T00-002
- T00-003
- T00-004

Reason:
The worktree is dirty and the old real-estate model is partially deleted. Every
later task depends on knowing current routes, terms, and test failures.

## Phase 1 - Product Language And Record Interfaces

Complete after baseline:

- T01-001
- T01-002 through T01-010
- T10-001

Reason:
The Work OS taxonomy and glossary are the Interface every downstream Module uses.
Do not start UI, MCP, AI, or connector implementation before these Interfaces
are stable.

## Phase 2 - Backend Source Of Truth

Complete after Phase 1:

- T02-001
- T02-002
- T02-003
- T02-004
- T02-005
- T02-006

Reason:
The schema, contracts, indexes, validation, and fixtures must stop encoding the
old vertical before UI and tool work can be trusted.

## Phase 3 - Workspace Shell

Complete after T01-001 and before broad module rollout:

- T03-001
- T03-002
- T03-003
- T03-004
- T03-005

Reason:
The shell gives every record Module a consistent layout Interface. This prevents
each screen from rebuilding table, board, detail, empty, loading, and mobile
behavior independently.

## Phase 4 - Core Record Modules

Complete after Phases 1, 2, and T03-003:

- T04-001
- T04-002
- T04-003
- T04-004
- T04-005
- T04-006
- T04-007
- T04-008

Reason:
Clients, opportunities, projects, tasks, calendar events, assets, record cards,
and linked records are the operating core. These must be real workflows, not
placeholder screens.

## Phase 5 - Flexible Layer

Complete after record Modules exist:

- T05-001 through T05-006
- T06-001 through T06-006

Reason:
Custom fields and automations depend on stable record Interfaces. They must not
be used to hide unfinished core records.

## Phase 6 - AI, MCP, And Connectors

Complete in this order:

- AI boundary and context: T07-001, T07-003
- MCP taxonomy and registry: T08-001, T08-002
- AI planning and confirmation: T07-004 through T07-007
- MCP record tools: T08-003 through T08-009
- MCP permission gate: T08-010
- Connectors: T09-001 through T09-006
- AI evals: T07-008

Reason:
AI needs stable context and a clear product boundary. MCP needs a stable tool
registry before AI action planning and connector action surfaces can call tools
safely.

## Phase 7 - Cleanup

Complete after core Modules and tool surfaces:

- T10-002
- T10-003
- T10-004
- T10-005
- T11-001
- T11-002
- T11-003
- T11-004

Reason:
Docs, copy, public routes, robots, metadata, and links should reflect the actual
converted product, not aspirational language.

## Phase 8 - Final Verification

Complete last:

- T12-001
- T12-002
- T12-003
- T12-004
- T12-005
- T12-006

Reason:
Final verification must prove the whole conversion, not only one package or one
screen. Treat partial test success as evidence for that task only.

## Parallel work rule

Tasks can run in parallel only when they do not share the same Interface or dirty
files. Safe examples:

- T10-004 marketing copy can run while T04 record UI work continues.
- T11 public route cleanup can run after route map is complete and before final
  docs cleanup.
- T09 connector docs can be explored while MCP tools are being implemented, but
  connector action implementation waits for T08-010.

Unsafe examples:

- Do not implement AI action planning before MCP taxonomy exists.
- Do not implement custom field filters before query/index planning exists.
- Do not implement record forms before the record model and validation schema
  are stable.

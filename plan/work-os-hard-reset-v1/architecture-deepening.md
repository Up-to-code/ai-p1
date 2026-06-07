# Architecture Deepening Guide

This guide turns the hard reset into architecture work, not only renaming work.
Use it with the task files when choosing Modules, Interfaces, Seams, and
Adapters.

## 1. Work OS Record Module

Files:
- `packages/domain-contracts/src`
- `apps/workspace/convex/schema.ts`
- `apps/workspace/src/server/domains/*`
- `apps/workspace/src/domains/*`

Problem:
The current product model is split across many shallow Modules: UI forms,
validation schemas, Convex tables, MCP tool inputs, and agent prompts each know
their own version of property, unit, client task, project inventory, and asset
meaning. Understanding one record requires bouncing across many call sites.

Solution:
Create a deep Work OS Record Module around the core taxonomy. Its Interface is
the record type, core fields, linked-record behavior, validation shape, list
query shape, and allowed actions. Its Implementation can vary by UI, Convex,
MCP, AI, and connectors, but callers should not need to rediscover record rules.

Benefits:
- Locality: record naming, fields, statuses, and links change in one place.
- Leverage: UI, MCP, AI, and connectors can reuse the same record contract.
- Test surface: the Interface becomes contract tests plus schema validation.

Related tasks:
- T01-001
- T02-001
- T02-002
- T04-001 through T04-008

## 2. Record Link Module

Files:
- `apps/workspace/convex/schema.ts`
- record detail screens
- AI context loading
- MCP tools

Problem:
The old model creates special links such as client-to-unit and project-to-unit.
That makes each relationship a bespoke implementation and forces UI, AI, MCP,
and connectors to know too many pair-specific rules.

Solution:
Create a deep Record Link Module with one small Interface: source record, target
record, link type, label, created metadata, and deletion behavior. Every detail
view, AI context packet, MCP link tool, and connector external mapping should use
that Interface.

Benefits:
- Locality: relationship rules are concentrated.
- Leverage: new record relationships do not require new tables or UI sections.
- Test surface: link creation, deletion, permissions, and display can be tested
  through one Module.

Related tasks:
- T01-009
- T04-008
- T07-003
- T08-003 through T08-009
- T09-004

## 3. Custom Field Module

Files:
- `packages/domain-contracts/src`
- `apps/workspace/convex/schema.ts`
- record forms and tables

Problem:
Industry flexibility can easily leak into core fields. If every industry request
adds a new first-class schema field, the Work OS becomes another vertical app.

Solution:
Create a deep Custom Field Module with definition, value, rendering, filtering,
and validation Interfaces. Workspace templates configure custom fields; record
Modules consume them without knowing the industry.

Benefits:
- Locality: custom field typing and validation stay concentrated.
- Leverage: clients, opportunities, projects, tasks, events, and assets all gain
  flexible inputs through one Interface.
- Test surface: type channels, required fields, option validation, and filtering
  are tested once and reused.

Related tasks:
- T05-001 through T05-006
- T01-010
- T06-002

## 4. Automation Execution Module

Files:
- automation contracts
- Convex write functions
- audit/logging code
- permissions code

Problem:
Automation can become shallow if each trigger directly calls scattered record
write code. That makes failures, retries, permissions, and audit behavior hard
to reason about.

Solution:
Create a deep Automation Execution Module. Its Interface accepts a rule, trigger
payload, actor/system context, and returns a run result. Its Implementation owns
condition evaluation, action dispatch, permission checks, validation, and logs.

Benefits:
- Locality: automation side effects and failures live in one place.
- Leverage: builder UI, MCP tools, and future connector triggers can execute the
  same rules.
- Test surface: the execution Interface can test success, failure, permission,
  and duplicate prevention.

Related tasks:
- T06-001 through T06-006
- T08-009
- T09-005

## 5. Agent Action Planning Module

Files:
- `apps/workspace/src/server/domains/agents`
- MCP tool registry
- confirmation and risk policy code

Problem:
The current agent surface mixes prompt language, context loading, tool choice,
confirmation, and risk policy. If the reset only changes words, the old domain
shape can remain hidden in tool inputs and tests.

Solution:
Create a deep Agent Action Planning Module. Its Interface should accept user
intent and context, then return an inspectable action plan: target record,
proposed change, required tool, risk level, and confirmation requirement.

Benefits:
- Locality: AI write behavior is explainable and testable before execution.
- Leverage: prompts, MCP tools, and confirmation UI use the same action plan.
- Test surface: ambiguous intent, safe reads, risky writes, and cancellations are
  tested at the planning Interface.

Related tasks:
- T07-001 through T07-008
- T08-001
- T08-010

## 6. MCP Tool Registry Module

Files:
- `apps/workspace/src/server/protocols/mcp/tools`
- `apps/workspace/convex/mcp`
- agent tool adapter code

Problem:
MCP tools can drift from product records if each tool owns its own naming,
schema, permission, and output summary. That is how old client-task and property
language stays alive after UI cleanup.

Solution:
Create a deep MCP Tool Registry Module. Its Interface is tool id, record type,
action, input schema, output summary, scope, permission, and risk category.

Benefits:
- Locality: tool naming and permissions are maintained in one registry.
- Leverage: AI, partner calls, and connector actions can discover the same tools.
- Test surface: registry tests prove expected tools exist and old tools are gone.

Related tasks:
- T08-001 through T08-010
- T07-005
- T09-005

## 7. Connector Adapter Module

Files:
- Workspace partner resource gateway
- Partners app catalog APIs
- Demo Partner App resource calls
- `packages/partner-workspace-sync`

Problem:
Connectors touch app catalog ownership, OAuth grants, Work OS records, external
ids, sync state, and audit logs. Without a clear Seam, integration logic leaks
across Workspace, Partners, and Demo Partner App.

Solution:
Use an explicit Connector Adapter Seam. Partners owns app identity and catalog
state. Workspace owns organization grants, key projections, resource access, and
Work OS records. Each connector Adapter maps external records/actions into the
Work OS Record and Record Link Modules.

Benefits:
- Locality: connector-specific mapping lives in the Adapter.
- Leverage: authorization and record access stay reusable across connectors.
- Test surface: each Adapter can be tested against the same connector contract.

Related tasks:
- T09-001 through T09-006
- T08-010
- T12-003

## 8. Workspace Module Layout

Files:
- Workspace sidebar/topbar
- module screens
- record forms and detail views

Problem:
The UI currently has module-specific screens that encode old record assumptions.
If each screen owns layout, state, and view switching, the Work OS will feel
inconsistent and future records will duplicate behavior.

Solution:
Create a deep Workspace Module Layout with a small Interface: title, actions,
filters, view modes, result state, and detail surface. Record Modules provide
record-specific content behind that Interface.

Benefits:
- Locality: table/board/detail/empty/loading/error behavior is maintained once.
- Leverage: every Work OS record gets consistent shell behavior.
- Test surface: layout behavior can be browser-tested independently from record
  field details.

Related tasks:
- T03-001 through T03-005
- T04-001 through T04-008

## Deletion test

Before adding a Module, ask: if this Module were deleted, would complexity vanish
or reappear across many callers?

- If complexity only vanishes, the Module is shallow.
- If complexity reappears in UI, schema, AI, MCP, connectors, and tests, the
  Module is earning its Interface.

## Guardrail

Do not add a Seam unless there are at least two real Adapters or a near-term
task creates the second Adapter. A single speculative Adapter is usually a
hypothetical Seam and should stay local.

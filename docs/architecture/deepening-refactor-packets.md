# Deepening Refactor Packets

This document records the safe refactor passes for the architecture review.
Each pass preserves current product behavior and keeps a small, independently
verifiable implementation packet.

## Pass 1: MCP tool contract

- **Current behavior:** tool identity and safety metadata are repeated in the
  server catalog and registries, while each catalog entry also carries its own
  input validator.
- **Structural improvement:** make the registry the source of identity and
  safety metadata; retain input validators as the only catalog-specific data.
- **Validation check:** catalog tests prove every exposed tool has registry
  metadata and adapter filtering remains unchanged.

## Pass 2: Task mutation locality

- **Current behavior:** some Task callers use the Task Mutation Module while
  others call task requests directly, bypassing context defaults and optimistic
  rollback.
- **Structural improvement:** move Task writes behind the existing Task
  Mutation Module and keep pure payload transformation beside the Task domain.
- **Validation check:** Task mutation and pipeline tests cover create, update,
  move, delete, optimistic overlay, and rollback behavior.

## Pass 3: Canonical TaskWorkspace

- **Current behavior:** two Task workspace implementations remain and choose
  filtering, selection, and optimistic rendering independently.
- **Structural improvement:** route callers through the canonical TaskWorkspace
  and retire only confirmed-unused legacy paths after parity checks.
- **Validation check:** current route, board/table/list, detail, and Project
  Task flows retain navigation and mutation behavior.

## Pass 4: SalesOpportunity cutover preparation

- **Current behavior:** Deal and Opportunity are separately writable despite
  SalesOpportunity being canonical and Deal being display copy.
- **Structural improvement:** isolate legacy Opportunity compatibility reads
  from the canonical Deal write path, without destructive persistence changes.
- **Validation check:** legacy routes remain readable and all new writable
  product paths continue to resolve through Deals.

## Pass 5: Workspace identity and server execution

- **Current behavior:** Better Auth identity and request execution expose
  compatibility Modules alongside the focused Modules.
- **Structural improvement:** remove only pass-through compatibility Modules
  after all callers move to the focused seams; do not alter session or token
  behavior in this refactor packet.
- **Validation check:** authenticated, unauthenticated, no-Organization, and
  denied states retain their existing results.

## Deferred implementation changes

The SalesOpportunity persistence migration and the removal of request-local
authentication plumbing are separate migrations. They require migration and
security regression packets, so this refactor does not change persisted data,
session transport, or authorization policy.

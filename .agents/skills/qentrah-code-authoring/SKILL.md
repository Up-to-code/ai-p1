---
name: qentrah-code-authoring
description: Use before adding or changing any Qentrah function, Module, component, hook, type, validator, helper, route, Convex callable, Hono endpoint, MCP/Eve command, or public export. Enforces reuse discovery, domain ownership, modular placement, documentation maps, authorization, reactive data rules, and verification.
---

# Qentrah Code Authoring

Use this skill before designing or editing Qentrah code. Its first job is to
prevent a second implementation of behavior the repository already owns.

## Mandatory reuse gate — first action

Do not edit code until all applicable discovery steps are complete:

1. Read `CONTEXT.md`, `docs/architecture/qentrah-module-map.md`, and the relevant
   accepted files under `docs/decisions/`.
2. Read a matching `docs/lifecycles/<slug>/` when the change affects a connected
   business or technical flow.
3. Search `component-registry.json` by purpose and behavior when rendered UI is
   involved. Registry presence is a lead, not proof; verify its path, export,
   callers, and current behavior.
4. Search `docs/architecture/qentrah-codebase-interface-map.md`, package/domain
   barrels, and source using domain terms, likely symbol names, UI copy, input
   shapes, validator fields, routes, query/mutation names, and tool names.
5. Inspect the implementation, callers, tests, and side effects of the closest
   existing Module.
6. Classify the change as exactly one of:
   - `reuse`: the existing Interface already supplies the behavior.
   - `extend`: the existing owner should accept a compatible typed option,
     callback, slot, or Adapter.
   - `extract-shared`: at least two real consumers need the same invariant or
     behavior and the deletion test proves the seam has depth.
   - `create-local`: one domain owns the behavior and sharing would be
     speculative.

Before editing, report:

```text
QENTRAH_AUTHORING_PREFLIGHT: concept=<domain concept> searched=<paths and terms> decision=<reuse|extend|extract-shared|create-local> owner=<owning Module/path>
```

## Required rules

Read [CODE-AUTHORING-RULES.md](CODE-AUTHORING-RULES.md) completely before code
edits. Those rules define placement, dependency direction, modularization,
types, validation, OOP, authorization, React/Next.js/Convex behavior, shared UI,
localization, documentation, and completion checks.

## Placement decision

Choose ownership before choosing a folder:

| Behavior | Owner |
|---|---|
| One-domain behavior | Owning folder under `apps/workspace/src/domains/<domain>` or `apps/workspace/convex/<domain>` |
| Cross-domain Workspace rendered UI | `apps/workspace/src/components/shared` and `component-registry.json` |
| App-independent rendered UI | `packages/ui` or the existing owning UI package, then register real consumers |
| Cross-runtime contracts, types, and validators | `packages/domain-contracts` |
| Convex-only validation, lifecycle, access, or presentation | Owning `apps/workspace/convex/<domain>` folder |
| Pure authentication/authorization policy shared by adapters | `packages/auth` or the established policy package |
| Runtime integration | Beside its Next.js, Hono, Convex, MCP, Eve, mobile, or gateway Adapter |

Do not describe a React component as “frontend and backend shared.” Share its
contract, pure policy, validation, or lifecycle behavior; keep rendered and
server runtime Adapters separate.

## Implementation workflow

1. State current behavior, the structural change, and the parity check.
2. Define the smallest stable public Interface. Keep implementation details
   private and preserve existing public signatures unless change is required.
3. Follow the repository dependency direction:

```text
contracts -> lifecycle/invariants -> access -> runtime Adapters
          -> hooks/commands -> server page + smallest client island
```

4. Separate a reusable concept into focused files only when doing so improves
   locality. Types, validators, access policy, queries, writes, lifecycle,
   presentation, and helpers must not be mixed into a long page or orchestrator.
5. Preserve every side effect when splitting an existing Module. List the state,
   mutations, confirmations, audits, relation changes, and downstream calls the
   original operation touched.
6. Write or update tests at the public Interface. Do not test private extraction
   solely to justify more files.

## Map and documentation updates

- New or sharpened domain term: update `CONTEXT.md`.
- New or deepened public Module: update
  `docs/architecture/qentrah-module-map.md` and, when its invariants or Adapters
  are non-obvious, create documentation from
  `docs/architecture/module-documentation-template.md`.
- Connected lifecycle behavior: use `lifecycle-guard` and update its lifecycle
  folder.
- Accepted architecture change or conflict: update or add a decision document.
- New rendered shared UI: add or update its truthful entry in
  `component-registry.json` in the same change.
- Any public export, route, Convex callable, package command, MCP/Eve tool, or
  shared registry change: run `npm run docs:codebase-map`.

The generated map is an inventory, not a second implementation. Executable
registries and source remain authoritative.

## Validation gate

Run the checks proportional to the change:

```bash
npm run docs:codebase-map:check
npm --workspace @qentrah/workspace run typecheck
npm --workspace @qentrah/workspace run test -- <focused-test-files>
npm --workspace @qentrah/workspace run check:convex-runtime
npm --workspace @qentrah/workspace run codegen:convex
git diff --check
```

Also verify:

- No duplicate implementation, type, validator, access check, or query remains.
- Every server-owned read has one source of truth.
- Every sensitive read/write derives the actor and scope server-side and fails
  closed.
- Every new shared UI entry has a real path, export, typed Interface, and named
  consumer.
- Loading, empty, error, localization, direction, accessibility, and theme
  behavior are covered where relevant.

## Skill composition

This skill runs first. Then apply:

- `lifecycle-guard` for connected functions, routes, schemas, integrations, or
  flows.
- `permission-system` for Organization, Space, Project, MCP, or record access.
- `qentrah-theme` for rendered UI.

Do not copy those skills into a new implementation; follow their current files.

## Final report

Report the reuse decision, owning Module and public Interface, documentation/map
updates, verification results, and any remaining risk.

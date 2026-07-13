# Qentrah Code Authoring Rules

These are the normative rules for adding or changing code in Qentrah. They
apply to Workspace, Convex, Hono, MCP gateway, Eve, mobile, and shared packages.

## 1. Domain language and dependency direction

- Use names from `CONTEXT.md`. Add a missing domain term before creating a new
  deep Module around it.
- Treat accepted documents in `docs/decisions/` as constraints. Do not
  re-litigate them silently in code.
- Use `docs/architecture/qentrah-module-map.md` to identify ownership and the
  intended seam.
- Dependencies flow from contracts to lifecycle/invariants, access, runtime
  Adapters, hooks/commands, and finally rendered route Adapters. Contracts must
  not import React, Convex contexts, Hono, MCP, or Eve.

## 2. Reuse hierarchy

| Decision | Use when | Required action |
|---|---|---|
| Reuse | Existing behavior and invariants match | Import the existing public Interface without copying implementation |
| Extend | Existing owner is correct but one compatible variation is missing | Add a typed option, callback, slot, strategy, or Adapter and preserve defaults |
| Extract shared | Two or more named consumers need the same behavior | Move the invariant to the nearest shared owner; update all callers and tests together |
| Create local | One domain owns the behavior | Keep it domain-local until a second real consumer proves a seam |

Prefer composition around a stable primitive over a large collection of boolean
props. “Might be reusable” is not enough. Apply the deletion test: if deleting
the Module merely deletes complexity, it is a pass-through; if complexity
reappears across callers, the Module is earning its depth.

## 3. Module anatomy and file ownership

- Group by domain, not by global technical type. Domain-local `components/`,
  `hooks/`, `validation/`, `access/`, and `helpers/` belong under their owner.
- Expose one small public barrel when a domain has multiple internal files.
- Separate reusable concepts such as `*.types.ts`, `validators.ts`, `read.ts`,
  `write.ts`, `lifecycle.ts`, `access.ts`, `presentation.ts`, and focused helper
  files. Do not split a file merely to satisfy a folder template.
- Never use `utils.ts`, `helpers.ts`, `types.ts`, or `shared.ts` as an unrelated
  dumping ground. A file must have one named concept.
- Pages compose. Rendered Modules present. Hooks coordinate client behavior.
  Lifecycle Modules preserve domain invariants. Access Modules authorize.
  Adapters translate runtime input/output.
- Avoid barrel cycles. Internal implementation should import its direct owner,
  not route back through a public barrel.

## 4. Functions and object-oriented design

- Prefer pure functions for stateless rules and transformations.
- Use a class only when the domain has stable identity, state, invariants, or an
  initialized dependency reused across multiple operations or real Adapters.
- A constructor validates required dependencies. Public methods are narrow and
  preserve invariants. Do not create a mutable global singleton.
- Do not create base classes, repositories, factories, or interfaces for a
  single hypothetical implementation. One Adapter is a hypothetical seam; two
  Adapters make it real.
- Every function must have a concrete caller and responsibility. Delete unused
  or speculative functions.

## 5. Types and validation

- Accept `unknown` at trust boundaries and validate before use. Do not use
  `any`, unsafe casts, or unvalidated object spreads to bypass contracts.
- Define runtime schemas at the owning trust boundary and infer TypeScript types
  from them when practical. Do not maintain an interface and validator with the
  same shape by hand.
- Cross-runtime domain input/output belongs in `packages/domain-contracts`.
  Persistence-only validators stay with their Convex domain. Form-only schemas
  stay with the UI domain unless another Adapter consumes them.
- Validate external input, stored legacy data, environment/configuration, and
  runtime messages. Do not repeatedly validate already trusted internal values.
- Errors crossing an Interface are structured, stable, and testable.

## 6. Authorization and data ownership

- Derive the actor from the authenticated server request. Never trust a
  client-supplied user, Organization, Space, Project, or permission as proof.
- Fail closed. Enforce record-aware Organization -> Space -> Project access for
  reads as well as writes.
- Keep reusable authorization logic in the focused access owner. UI capability
  state improves UX but never authorizes an operation.
- Runtime Adapters call the canonical lifecycle implementation; MCP, Eve, Hono,
  and Convex must not duplicate domain invariants.
- Convex is the source of truth for server-owned reactive reads. Use
  `useQuery`/`usePaginatedQuery` through the owning domain Interface.
- Credential operations, provider calls, webhooks, and externally coordinated
  writes go through the established backend write gateway.
- Keep Zustand/local state for UI-only state, drafts, selection, and display
  preferences—not a second cache of server records.

## 7. React, Next.js, and Convex

- Route pages are Server Components by default. Add the smallest client island
  required for interaction, browser APIs, or reactive subscriptions.
- A page must not own business rules, complex data shaping, or mutation
  orchestration.
- Do not use `useEffect` to copy Convex query data into local state, manually
  refetch a reactive query, or derive render-only state. Derive during render or
  deepen the owning hook.
- Use commands/mutations/actions for writes and let subscribed reads reconcile
  the result.
- Data hooks expose data, loading, and a meaningful error state. Intentionally
  skip queries until required typed arguments exist.
- Bookmarkable views are real routes with `<Link>` navigation, not search-param
  switches that bundle multiple pages into one client Module.

## 8. Shared and customizable UI

- Search `component-registry.json` and actual imports before creating rendered
  UI.
- A shared rendered Module is customizable through typed props, slots,
  callbacks, variants, and stable composition—not duplicated domain forks.
- Keep generic UI stateless where practical. It must not fetch domain data,
  perform domain mutations, or decide authorization.
- Domain wrappers may translate records and commands into a generic UI
  Interface.
- Register rendered shared UI only. Helpers, types, validators, and lifecycle
  Modules belong in the generated interface map, not the component registry.
- Record real consumers in `usedIn`; a planned consumer is not proof of sharing.

## 9. Localization, accessibility, and theme

- Do not hardcode user-facing copy. Use the localization library and locale
  registry for fallback, direction, metadata, and future language support.
- Use logical layout properties and direction helpers instead of locale-specific
  JSX branches where possible.
- Render explicit loading, empty, error, denied, and not-found states.
- Preserve keyboard access, focus behavior, labels, semantic elements, and ARIA
  where native semantics are insufficient.
- Use semantic Qentrah theme tokens and paired foreground/background utilities.
  Apply the `qentrah-theme` skill for rendered UI changes.

## 10. Source documentation and maps

- Add TSDoc to exported callables whose purpose, invariants, errors,
  authorization, ordering, or source of truth are not obvious from their types.
- Document non-obvious private invariant helpers. Do not comment trivial
  callbacks or restate syntax.
- Update `CONTEXT.md` for domain language and
  `docs/architecture/qentrah-module-map.md` for ownership/deep public Interfaces.
- Use `docs/architecture/module-documentation-template.md` only for Modules with
  non-obvious invariants, meaningful error modes, or multiple real Adapters.
- Run `npm run docs:codebase-map` after public exports, routes, Convex functions,
  package commands, MCP/Eve tools, or shared-registry changes.

## 11. Prohibited patterns

- Duplicate types, validators, authorization checks, query definitions, domain
  transitions, mapping functions, or rendered structures.
- Pass-through Modules that only rename another Interface.
- Speculative shared folders, base classes, providers, factories, or OOP
  wrappers.
- Client-only authorization or post-read client filtering of sensitive data.
- Fetch-on-effect or effect-synchronized copies of Convex server data.
- Huge pages or client roots combining reads, writes, transformation, and UI.
- Magic colors, raw user-facing strings, hidden errors, silent catches, and
  scattered `console.*` calls.
- Runtime framework imports inside shared domain contracts.

## 12. Definition of done

- Reuse discovery and ownership decision are recorded.
- Public Interface is smaller than the implementation complexity it hides.
- Types, validation, lifecycle, access, presentation, and runtime concerns have
  one owner each.
- Existing behavior and cross-domain side effects are preserved or explicitly
  changed.
- Authorization is enforced server-side and fails closed.
- Shared UI is registered with real consumers; non-UI exports appear in the
  generated map.
- Relevant domain, module, decision, and lifecycle documentation is current.
- Focused tests, typecheck, runtime/codegen checks, map freshness, and
  `git diff --check` pass.

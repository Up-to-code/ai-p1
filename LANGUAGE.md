# Qentrah Architecture Language

Use this vocabulary in architecture reviews and RFCs.

- **Module**: anything with an Interface and Implementation, including a function, package, Convex function slice, server-domain slice, workflow, or UI workflow.
- **Interface**: everything callers must know to use a Module: types, invariants, ordering, config, errors, auth requirements, and operational behavior.
- **Implementation**: the code hidden behind the Interface.
- **Depth**: leverage at the Interface. A deep Module gives callers a small Interface hiding a larger Implementation.
- **Seam**: a place where behavior can change without editing callers.
- **Adapter**: concrete code satisfying an Interface at a Seam.
- **Leverage**: what callers gain from a deep Module.
- **Locality**: what maintainers gain when behavior, bugs, and knowledge are concentrated.

Qentrah-specific reviews should combine this language with `CONTEXT.md`, `docs/adr/`, and `docs/lifecycles/`.

The project-local skill source is `.agents/skills/improve-codebase-architecture/`.

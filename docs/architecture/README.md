# Architecture Documentation

This area owns repo-level architecture, runtime ownership, data boundaries, and
cross-app flow maps.

## Files

- [System architecture](./system-architecture.md): system boundaries, auth
  flows, data ownership, Convex usage, and integration shape.
- [Apps and packages](./apps-and-packages.md): deployable apps, shared
  packages, route areas, and ownership.
- [Enterprise data scale](./enterprise-data-scale.md): data ownership,
  isolation, retention, auditability, and integration rules for enterprise
  scale.
- [All-in-one repo flow chart](./all-in-one-repo-flow-chart.md): single
  consolidated Mermaid chart.
- [Repo flow chart](./repo-flow-chart.md): deeper Mermaid charts for app
  ownership, package layers, and cross-app flows.
- [Improve codebase architecture RFC](./improve-codebase-architecture-rfc.md):
  recorded deepening opportunities and implementation notes.

## Maintenance

- Record app ownership and data ownership here before spreading rules through
  app-level docs.
- Link to [decisions](../decisions/README.md) when architecture is constrained
  by an accepted decision.
- Keep runtime diagrams generated-free and exclude build/vendor folders.

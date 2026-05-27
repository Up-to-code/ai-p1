# Qentrah Documentation

This directory is the repo-level documentation index. It is organized for a
multi-app product, many contributing teams, and enterprise data ownership.

## Start Here

- [Root README](../README.md): project overview, quick start, app map, and
  validation commands.
- [Setup and configuration](./operations/setup-and-configuration.md): local
  development, deployment, environment, tokens, and troubleshooting.
- [System architecture](./architecture/system-architecture.md): app ownership,
  auth flows, data ownership, Convex usage, and integration shape.
- [Apps and packages](./architecture/apps-and-packages.md): deployable apps,
  shared packages, route areas, and placement rules.
- [Feature lifecycle](./engineering/feature-lifecycle.md): how to plan,
  implement, validate, document, release, and deprecate features.
- [Agent guide](./engineering/agent-guide.md): safe navigation and edit
  guidance for AI agents and human maintainers.

## Documentation Areas

| Area | Purpose |
| --- | --- |
| [Product](./product/README.md) | Product framing, design direction, feature source of truth, and knowledge base. |
| [Architecture](./architecture/README.md) | Runtime ownership, repo maps, data scale, shared package layers, and cross-app flows. |
| [Operations](./operations/README.md) | Setup, environment variables, deployment, and production operating notes. |
| [Engineering](./engineering/README.md) | Feature lifecycle, documentation standards, team ownership, and agent guidance. |
| [Decisions](./decisions/README.md) | Accepted architecture decisions without numeric filename prefixes. |
| [Partner Platform](./partner-platform/README.md) | Partner platform flow and implementation guidance. |
| [Lifecycles](./lifecycles/) | Dependency maps for connected workflows. |

## App And Package Docs

- [Workspace](../apps/workspace/README.md): main product, OAuth provider,
  resource APIs, Convex, and app routes.
- [Workspace internal docs](../apps/workspace/docs/README.md): detailed
  Workspace architecture, auth, compliance, SDK, synchronization, security, and
  visibility docs.
- [Partners](../apps/partners/README.md): developer portal, app registration,
  docs, sandbox, review state, and platform APIs.
- [Partner docs app](../apps/partners/content/docs/index.mdx): MDX source for
  the public developer documentation.
- [Admin Review](../apps/admin/README.md): internal review console over
  Partners service APIs.
- [Demo Partner App](../apps/demo-partner-app/README.md): deployable OAuth
  reference implementation.
- [Marketing](../apps/marketing/README.md): public marketing site.

## Documentation Maintenance

- Keep root docs navigational; place detailed material in the owning area.
- Use lowercase kebab-case for topical Markdown filenames.
- Keep `README.md`, `AGENTS.md`, and `CLAUDE.md` as conventional entry points.
- Put deep Workspace domain details under `apps/workspace/docs`.
- Put partner-facing docs under `apps/partners/content/docs`.
- Do not commit real secrets, production tokens, or copied credential values.
- Exclude generated/build folders such as `.next`, `.source`, `node_modules`,
  and Convex `_generated` from manual file maps.

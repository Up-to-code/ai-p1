# Anan Documentation

This directory is the repo-level documentation index. It links the root setup
guide, app-specific READMEs, architecture notes, feature lifecycle guidance, and
partner platform docs.

## Start Here

- [Root README](../README.md): project overview, quick start, app map, and
  validation commands.
- [Setup and configuration](../SETUP_AND_CONFIGURATION.md): complete
  environment, token, local development, deployment, and troubleshooting guide.
- [Architecture](./ARCHITECTURE.md): system boundaries, auth flows, data
  ownership, Convex usage, and integration shape.
- [Apps and packages](./APPS.md): catalog of apps, packages, routes, and
  ownership.
- [Environment variables](./ENVIRONMENT.md): canonical env reference and source
  links for external credentials.
- [Feature lifecycle](./FEATURE_LIFECYCLE.md): how to add, ship, operate, and
  deprecate features.
- [Agent guide](./AGENT_GUIDE.md): practical repo navigation and edit guidance
  for AI agents and human maintainers.

## App Documentation

- [Workspace](../apps/workspace/README.md): main product, OAuth provider,
  resource APIs, Convex, and app routes.
- [Partners](../apps/partners/README.md): developer portal, app registration,
  docs, sandbox, and review callbacks.
- [Admin Review](../apps/admin/README.md): internal review console over
  Workspace service APIs.
- [Demo Partner App](../apps/demo-partner-app/README.md): deployable OAuth
  reference implementation.
- [Marketing](../apps/marketing/README.md): public marketing site.

## Partner Platform

- [Partner Platform Flow](./partner-platform/README.md): internal flow, app
  responsibilities, service configuration, OAuth, catalog, and acceptance
  checklist.
- [Partner Implementation Guide](./partner-platform/partner-implementation-guide.md):
  partner-facing setup with TypeScript, JavaScript, Next.js, and Node.js
  examples.
- [Partner docs app](../apps/partners/content/docs/index.mdx): MDX source for
  the public developer documentation.
- [AI agent implementation prompt](../apps/partners/content/docs/ai-agent-implementation.mdx):
  one-click prompt for building a partner integration.

## Deployment And Operations

- [Monorepo Deployment](./monorepo-deployment.md): root workspace commands,
  Vercel root directories, domains, and app boundaries.
- [Workspace internal docs](../apps/workspace/docs/README.md): detailed
  Workspace architecture, auth, compliance, SDK, synchronization, security, and
  visibility docs.

## Documentation Maintenance

- Keep repo-level docs focused on orientation, ownership, setup, and cross-app
  flows.
- Put deep Workspace domain details under `apps/workspace/docs`.
- Put partner-facing docs under `apps/partners/content/docs`.
- Do not commit real secrets, production tokens, or copied credential values.
- Exclude generated/build folders such as `.next`, `.source`, `node_modules`,
  and Convex `_generated` from manual file maps.

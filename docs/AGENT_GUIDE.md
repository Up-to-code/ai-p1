# AI Agent And Developer Guide

This guide helps AI agents and human developers work safely in the Qentrah
monorepo.

## First Pass

Start by reading:

1. [Root README](../README.md)
2. [Setup and configuration](../SETUP_AND_CONFIGURATION.md)
3. [Architecture](./ARCHITECTURE.md)
4. The README for the app being changed

Then inspect the relevant source files before editing. Prefer `rg` and
`rg --files` for discovery.

## Repo Safety Rules

- Do not commit real secrets or token values.
- Do not add new environment variable names when an existing one fits.
- Keep OAuth tokens, refresh tokens, service tokens, and client secrets
  server-side.
- Do not import another app's generated Convex APIs.
- Do not edit generated folders by hand: `.next`, `.source`, `node_modules`,
  and Convex `_generated`.
- Keep docs and implementation naming aligned with Workspace terminology.
- Preserve unrelated user changes in a dirty worktree.

## Where To Edit

| Task | Likely location |
| --- | --- |
| Workspace product UI | `apps/workspace/src/app/[locale]/(app)` |
| Workspace OAuth provider | `apps/workspace/src/app/oauth` |
| Workspace APIs | `apps/workspace/src/app/api` and `apps/workspace/src/server` |
| Workspace Convex backend | `apps/workspace/convex` |
| Partner portal UI | `apps/partners/app/(portal)` |
| Partner docs | `apps/partners/content/docs` |
| Partner docs components | `apps/partners/components/docs` |
| Partners backend | `apps/partners/convex` and `apps/partners/server` |
| Admin review UI | `apps/admin/app` |
| Admin Workspace API client | `apps/admin/lib/workspace.ts` |
| Demo OAuth flow | `apps/demo-partner-app/app/api/auth/anan` |
| Demo resource API calls | `apps/demo-partner-app/app/api/anan` and `apps/demo-partner-app/lib/workspace-api.ts` |
| Marketing pages | `apps/marketing/app` |
| Shared schemas | `packages/domain-contracts` |
| Shared UI | `packages/ui` |

## Edit Pattern

1. Identify the owning app or package.
2. Read the local README and nearest existing implementation.
3. Make the smallest coherent change.
4. Update docs when setup, env, route, API, or integration behavior changes.
5. Run targeted checks.
6. Broaden validation if shared contracts or app boundaries changed.

## Validation Matrix

| Change | Check |
| --- | --- |
| Workspace TypeScript | `npm --workspace @anan/workspace run typecheck` |
| Workspace behavior | `npm --workspace @anan/workspace test` |
| Workspace browser flow | `npm --workspace @anan/workspace run test:e2e` |
| Partners TypeScript | `npm --workspace @anan/partners run typecheck` |
| Partners behavior | `npm --workspace @anan/partners test` |
| Partner MDX/docs components | `npm --workspace @anan/partners run build` |
| Admin Review | `npm --workspace @anan/admin-review run typecheck` and `npm --workspace @anan/admin-review test` |
| Demo Partner App | `npm --workspace @anan/demo-partner-app run typecheck` and `npm --workspace @anan/demo-partner-app test` |
| Marketing | `npm --workspace @anan/marketing run typecheck` |

## Documentation Expectations

When changing behavior, update the closest documentation:

- App README for app-specific setup or routes.
- `docs/ENVIRONMENT.md` for env changes.
- `docs/ARCHITECTURE.md` for cross-app flow changes.
- `apps/partners/content/docs` for public partner-facing docs.
- `apps/workspace/docs` for detailed Workspace domain docs.

Keep repo-level docs concise and navigational. Deep generated or domain-specific
documentation belongs near the owning app.

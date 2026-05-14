# Feature Lifecycle

This guide describes how features should move through the Qentrah repo from idea to
maintenance. It is meant for both human developers and AI agents.

## 1. Locate The Owner

Before editing, decide which runtime owns the feature.

| Feature area | Owner |
| --- | --- |
| Organization workspace, product UI, OAuth provider, partner APIs | Workspace |
| Developer app registration, docs, sandbox, portal app lifecycle | Partners |
| App review queue and decision UI | Admin Review |
| External partner OAuth reference flow | Demo Partner App |
| Public website content | Marketing |
| Cross-app contracts, shared UI, reusable logic | `packages/*` |

If two apps need the same schema or helper, place it in a shared package instead
of importing across app boundaries.

## 2. Capture The Contract

For every feature, identify:

- user or system actor
- owning app
- route, API, or component entrypoint
- data owner
- env values required
- server-only secrets
- success and failure states
- tests that prove the behavior
- docs that need updating

For partner integrations, explicitly document OAuth scopes, redirect URIs,
server-side token exchange, and token storage expectations.

## 3. Implement In The Smallest Owning Surface

Keep the first implementation inside the owning app unless reuse is already
real. Move contracts into packages only when another app actually imports them.

Use existing local patterns:

- Workspace server domains under `apps/workspace/src/server`.
- Workspace deep docs under `apps/workspace/docs`.
- Partners docs under `apps/partners/content/docs`.
- Partners server repositories under `apps/partners/server`.
- Admin Workspace API access through `apps/admin/lib/workspace.ts`.
- Demo integration logic under `apps/demo-partner-app/lib`.

## 4. Validate

Choose the narrowest useful validation first:

```bash
npm --workspace @anan/workspace run typecheck
npm --workspace @anan/workspace test
npm --workspace @anan/partners run typecheck
npm --workspace @anan/partners test
npm --workspace @anan/admin-review run typecheck
npm --workspace @anan/demo-partner-app test
npm --workspace @anan/marketing run typecheck
```

Broaden to root workspace checks when shared packages, auth contracts, routing,
or env behavior changes:

```bash
npm run typecheck --workspaces --if-present
npm run test --workspaces --if-present
npm run build --workspaces --if-present
```

Run `npm --workspace @anan/partners run build` when changing partner MDX docs or
docs components.

## 5. Document

Update docs in the same change when behavior, env, or integration contracts
change.

| Change | Documentation target |
| --- | --- |
| New app-level behavior | App README |
| New repo setup or token | `SETUP_AND_CONFIGURATION.md` and `docs/ENVIRONMENT.md` |
| New cross-app flow | `docs/ARCHITECTURE.md` |
| New partner-facing integration feature | `apps/partners/content/docs` |
| New Workspace domain behavior | `apps/workspace/docs` |
| New shared package contract | Package README and relevant repo docs |

## 6. Release And Operate

Before release:

- confirm required env values exist in the right Vercel or Convex project
- confirm no token value was added to Git
- run app-specific checks
- verify routes that changed locally
- update partner docs if public integration behavior changed

After release:

- watch logs for auth, callback, token exchange, and API failures
- confirm review callbacks and OAuth redirects resolve to deployed origins
- record follow-up work in the owning app or docs

## 7. Deprecate Carefully

Deprecation work should state:

- replacement behavior
- migration path
- app or package owner
- removal date or condition
- tests and docs to remove later

For public partner behavior, avoid abrupt contract removal. Keep compatibility
or document a migration period in the partner docs.

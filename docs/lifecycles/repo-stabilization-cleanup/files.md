# Files

## Intentional Feature Work

- Partner source-of-truth split across `apps/partners`, `apps/admin`, `apps/workspace`, `packages/partner-auth-core`, and `packages/partner-workspace-sync`.
- Data security backfill and encryption work under `apps/workspace/convex/security`.
- API runtime service work under `packages/platform-core` and `apps/workspace/src/server/effect`.

## Accidental Or Mechanical Dirt

- `.infisical.json`: local secret-manager CLI config; must remain untracked.
- `apps/admin/next-env.d.ts`, `apps/partners/next-env.d.ts`: generated Next files.
- `package-lock.json`: should reflect only cleaned package manifests.

## Dependency Manifest Drift

- `apps/admin/package.json` and `apps/admin/tsconfig.json`: remove unused `@qentrah/partner-workspace-sync` if no source import exists.
- `packages/platform-core/package.json`: keep `effect` only because `effect-api` imports it.
- `packages/convex-adapters/package.json`: keep export/build shape consistent with how workspaces consume it.

## Dead Compatibility

- Workspace-owned partner catalog/review functions and old review callback paths should stay removed unless tests prove a transition endpoint is still required.
- Migration-only legacy fields stay isolated in migration files/tests.

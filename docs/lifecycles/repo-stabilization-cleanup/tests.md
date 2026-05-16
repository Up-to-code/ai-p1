# Tests

## Commands For This Cleanup

- `npm --workspace @qentrah/platform-core test` - passed 2026-05-16
- `npm --workspace @qentrah/partner-auth-core test` - passed 2026-05-16
- `npm --workspace @qentrah/partner-workspace-sync test` - passed 2026-05-16
- `npm --workspace @qentrah/convex-adapters test` - passed 2026-05-16
- `npm --workspace @qentrah/workspace test -- src/server/domains/partnerApps convex/security src/server/effect` - passed 2026-05-16
- `npm --workspace @qentrah/partners test` - passed 2026-05-16
- `npm --workspace @qentrah/admin-review test` - passed 2026-05-16
- `npm --workspace @qentrah/workspace run typecheck` - passed 2026-05-16
- `npm --workspace @qentrah/partners run typecheck` - passed 2026-05-16
- `npm --workspace @qentrah/admin-review run typecheck` - passed 2026-05-16
- `npm run typecheck --workspaces --if-present` - passed 2026-05-16
- `git diff --check` - passed 2026-05-16
- `npm --workspace @qentrah/convex-adapters test` - passed 2026-05-16 Vercel build fix
- `npm --workspace @qentrah/convex-adapters run typecheck` - passed 2026-05-16 Vercel build fix
- `npm --workspace @qentrah/workspace run typecheck` - passed 2026-05-16 Vercel build fix
- `npm --workspace @qentrah/workspace run build` - passed 2026-05-16 Vercel build fix
- `cd apps/workspace && npx convex deploy --yes` - passed 2026-05-16, deployed to `https://stoic-monitor-13.convex.cloud`

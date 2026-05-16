# Changes

## 2026-05-16 Cleanup Pass

- Created master lifecycle map for the dirty-tree stabilization pass.
- Classified active cleanup areas: local config, generated churn, package dependency drift, Effect runtime depth, Partners auth rate-limit duplication, and source-of-truth compatibility cleanup.
- Added `.infisical.json` to `.gitignore` so local secret-manager config stays untracked.
- Restored generated `next-env.d.ts` churn in Admin and Partners to the stable generated type path.
- Removed unused Admin `@qentrah/partner-workspace-sync` dependency and path alias.
- Removed the unused Admin Workspace review bridge and corresponding Workspace transition review/list routes.
- Removed now-unused Workspace admin origin validation helpers that only protected deleted transition routes.
- Restored `@qentrah/convex-adapters` package exports to built `dist` artifacts while keeping its typecheck script.
- Regenerated `package-lock.json` after manifest cleanup.
- Re-ran focused tests, app typechecks, full workspace typecheck sweep, and `git diff --check`.
- Fixed the Vercel production build failure by adding the missing Workspace source alias for `@qentrah/platform-core/convex-api`.
- Deployed Workspace Convex functions to the production deployment `stoic-monitor-13`.

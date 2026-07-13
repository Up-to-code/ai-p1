# Changes

## 2026-07-07 — Initial migration implementation

- Created lifecycle docs
- Wave 0: Schema + package setup
- Wave 1: Better Auth server
- Wave 2: Convex auth integration
- Wave 3: Auth client + hooks
- Wave 4: Organization management
- Wave 5: Middleware replacement
- Wave 6: MCP authorized mode
- Wave 7: Eve agent auth
- Wave 8: Cleanup

## 2026-07-13 — Server identity Interface consolidation

- Made `src/server/auth/auth-request.ts` the only public server authentication and authenticated Convex bridge.
- Moved framework-only behavior behind `nextjs-auth-adapter.ts`.
- Removed the `auth-context.ts`, `convex-auth.ts`, and `auth-request-store.ts` pass-through Interfaces.
- Migrated invitation links to request-aware Convex token forwarding.
- Added request isolation and normalized authentication failure tests.

## 2026-07-13 — Platform Administration runtime Adapter

- Kept the normalized allowlist policy in `packages/auth/src/platform-admin.ts`.
- Made the Convex Adapter import the pure source directly instead of depending
  on the package's potentially stale `dist/index.js` during hot development.
- Added a source guard and Convex codegen verification requirement so the
  fail-closed media visibility check cannot regress silently.

## 2026-07-13 — Better Auth JWKS algorithm migration

- Aligned OAuth-provider and Convex JWT signing on RS256.
- Kept automatic incompatible-key recovery enabled during the migration.
- Added an internal operator action to rotate a legacy key that can fail in the
  session JWT hook before automatic Convex token recovery runs.
- Sanitized the operator action result so key records and private material are
  never written to maintenance command output.
- Added source-level regression coverage and documented token invalidation risk.
- Moved localized root routing into the proxy policy so Turbopack does not
  measure a Server Component whose only operation is throwing a redirect.

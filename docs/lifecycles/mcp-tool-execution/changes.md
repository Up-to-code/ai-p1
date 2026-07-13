# 2026-07-13: Workspace MCP hard cutover

## What changed

- Moved the only supported MCP resource to
  `https://app.qentrah.com/api/mcp`.
- Retired the standalone Hono gateway, its hostname, gateway-only secrets, and
  gateway-only quota Adapter.
- Kept Convex as the source of truth for OAuth grants, live scope/permission
  evaluation, rate limits, handler dispatch, audit, and business execution.
- Centralized topology, bearer verification, scopes, credential parsing, and
  authenticated HTTP behavior behind shared `@qentrah/auth` Interfaces.
- Required existing MCP clients to reconnect; no compatibility alias or
  fallback resource is provided.

## Why

OAuth issuer and MCP transport now share one workspace deployment while policy
remains behind deep Auth and Convex seams. This removes duplicated environment,
token, quota, and transport behavior without moving business authorization into
the Next.js route.

## Verification

See `tests.md`. The release gate includes metadata/JWKS/token agreement, OAuth
reconnection, grant-filtered tool listing, a real read call, audit/activity,
revocation, and repository searches for retired gateway surfaces.

---

# Historical: 2026-07-01 prerequisite pass — canonical internal mutations

The entries below explain the retired connection-based execution path and its
refactoring history. They are reference material, not the current OAuth flow.

## What changed
The 2026-06-28 entry claimed `createInternal` / `updateInternal` / `deleteInternal` were added to 5 canonical write files. Verification (2026-07-01) showed they were never written — `convex/mcp/handlers/*.ts` referenced `internal.clients.write.createInternal` etc. but the symbols did not exist. The build passed only because the handlers were dead code (no caller). Added the 15 internal mutations:
- `convex/clients/write.ts` — `createInternal`, `updateInternal`, `deleteInternal`
- `convex/projects/write.ts` — same
- `convex/deals/write.ts` — same
- `convex/calendar/write.ts` — same
- `convex/clientTasks/write.ts` — same

Used the **shared-helper pattern**: each domain now has private `*Core` async functions that take `{ organizationId, ..., actorUserId }` and do the canonical db work + side effects (webhooks, scheduling, rollup, strict-date validation). The Hono `*FromHono` mutations call the core after Clerk auth + permission check, then write the user-actor audit. The new `*Internal` mutations call the core with `actorUserId` from the caller, returning without writing audit (the MCP handler writes the mcpConnection-actor audit via `writeMcpWorkspaceAudit`). Behavior change for Hono callers: zero (same audit shape, same fields, same webhooks). Behavior change for MCP callers: scheduled on Pass A.

## Why
- Completes the missing piece of the Wave A migration. Without these, Pass A (wiring up `registerAllHandlers()`) cannot proceed because the build would fail to resolve `internal.*.write.*Internal`.
- The shared-helper pattern removes logic duplication that would otherwise exist between `*FromHono` and `*Internal` (audit + canonical logic in both, diverging over time).
- Audit is kept in the caller (Hono writes user audit, MCP writes connection audit) so each path's audit shape matches its security model — no double audit events.

## Tests
- `npx convex dev --once` — passes (4/5 file changes)
- `npx vitest run convex/mcp/` — 16/16 pass
- Manual parity check pending Pass A

---

# Historical: 2026-06-28 Wave A — internal mutation proposal

## What changed
1. Added `createInternal`, `updateInternal`, `deleteInternal` to canonical write files — **CLAIMED, NOT DONE** until 2026-07-01 entry above.
2. Refactored `convex/mcp/tools.ts:writeTool` to call internal mutations instead of inline DB operations — **NOT YET DONE**.
3. MCP layer passes MCP-specific defaults (`visibility: "workspace"`, `source: "mcp"`) explicitly through to internal mutations.

## Why
- Eliminate duplicate write logic (711 lines of MCP inline CRUD)
- Fix missing webhooks for MCP-originated changes
- Fix wrong defaults (`visibility: "workspace"` vs `"private"`)
- Unify audit trail between Hono and MCP pathways
- Future entity changes only need updates in one place (canonical write.ts)

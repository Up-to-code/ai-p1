# Files

- `packages/domain-contracts/src/tasks.ts` — create, patch, checklist, and inferred types.
- `convex/clientTasks/validators.ts` — Convex validator adapter.
- `convex/clientTasks/lifecycle.ts` — persistence invariants and effects.
- `convex/clientTasks/presentation.ts` — stable public Task representation.
- `convex/clientTasks/assignments.ts` — canonical assignee identity and query relation synchronization.
- `convex/clientTasks/bulk.ts` — permission-aware bulk lifecycle orchestration and partial outcomes.
- `convex/clientTasks/read.ts`, `write.ts` — query/access/transport adapters.
- `convex/migrations/backfillTaskAssignments.ts` — idempotent assignment relation backfill.
- `convex/access/task.ts` — record-aware authorization.
- `convex/mcp/handlers/tasks.ts` — scoped MCP adapter.
- `agent/subagents/tasks` — Eve adapter.
- `src/server/domains/clientTasks` — Hono write adapter.

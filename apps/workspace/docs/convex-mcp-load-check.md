# Convex MCP Load Check

Use this checklist before major Convex data-layer or Hono read changes.

## Required MCP Checks

1. Run `status` for the Workspace project and use the dev cloud deployment unless production debugging was explicitly requested.
2. Run `insights` for the selected deployment.
3. Run `functionSpec` when changing function arguments, return shapes, or public/internal visibility.
4. Run `tables` when adding filters, sort orders, search behavior, or pagination.

## Release Blockers

Treat these insights as blockers until the query or mutation is fixed:

- `documentsReadLimit`
- `bytesReadLimit`
- `documentsReadThreshold`
- `bytesReadThreshold`
- `occFailedPermanently`

`occRetried` is a warning. Investigate shared hot documents, broad mutation scope, or repeated writes to aggregate records before shipping.

## Query Rules

- Use `.paginate(...)` for growing organization lists.
- Use `.take(...)` only for bounded widgets, small option lists, or deliberately capped search.
- Do not use `.collect()` in hot read paths.
- Do not fan out media/task/event reads across bulk list pages. Keep rich related data on detail views, dashboards, or small bounded cards.
- Keep MCP list tools limited to 50 items and return `{ items, isDone, continueCursor }` when list data can grow.

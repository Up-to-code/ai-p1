# Compound Indexes & Performance Guidelines

## Index Strategy

Every index follows the pattern `by_workspace_[dimension1]_[dimension2]` starting with `workspaceId` for tenant isolation.

### Core Query Patterns

| Query Pattern | Index Used | Rationale |
|---|---|---|
| `listProjects(workspaceId)` | `by_workspace` | Most basic — scan all active projects in workspace |
| `listProjectsBySpace(workspaceId, spaceId)` | `by_workspace_space` | Filter within a space |
| `listTasksByProject(workspaceId, projectId)` | `by_workspace_project` | All tasks in a project (massive) |
| `listTasksBySpace(workspaceId, projectId, spaceId)` | `by_workspace_project_space` | Compound — narrows to space within project |
| `listMilestonesByProject(workspaceId, projectId)` | `by_workspace_project` | Same as tasks |
| `listCalendarEventsByStart(workspaceId, startAt)` | `by_workspace_start` | Date-range queries |
| `listByStatus(workspaceId, status)` | `by_workspace_status` | Filtered lists |
| `listByOwner(workspaceId, ownerUserId)` | `by_workspace_owner` | "My items" queries |
| `searchByUpdated(workspaceId)` | `by_workspace_updated desc` | Recent items / search |

### Compound Indexes for Common Joins

```typescript
// Projects + Tasks: "Show me all tasks in a space within a project"
"by_workspace_project_space": ["workspaceId", "projectId", "spaceId"]

// Calendar + Date: "Show all events in a workspace for a date range"
"by_workspace_start": ["workspaceId", "startAt"]

// Projects + Deleted: "Show me active (non-deleted) projects sorted by update"
"by_workspace_deleted_updated": ["workspaceId", "deletedAt", "updatedAt"]

// Tasks + Milestone: "Show tasks for a specific milestone"
"by_workspace_milestone": ["workspaceId", "milestoneId"]

// Members + Role: "Find all managers in a project"
"by_project_role": ["projectId", "role"]
```

### Anti-Patterns to Avoid

1. **`filter` after `withIndex`**: Convex applies filters in-memory. Always push as much into the index query as possible.

   ```typescript
   // BAD: Scans all workspace tasks, filters in memory
   ctx.db.query("tasks")
     .withIndex("by_workspace", q => q.eq("workspaceId", id))
     .filter(q => q.eq(q.field("status"), "done"))
     .collect();

   // GOOD: Index does the filtering
   ctx.db.query("tasks")
     .withIndex("by_workspace_status", q =>
       q.eq("workspaceId", id).eq("status", "done"))
     .collect();
   ```

2. **`collect()` without limit**: Always use `take(N)` or pagination. Never `collect()` on tables that can grow unbounded.

3. **Missing `workspaceId` in index**: Every business query must filter by `workspaceId` first. This prevents cross-tenant data leaks.

4. **`order("desc")` without matching index**: The index must support the sort field. Use `by_workspace_updated` or similar pre-sorted indexes.

## Pre-Computed Aggregates

For dashboards and stats that would otherwise scan thousands of rows:

```typescript
// convex/dashboard/aggregates.ts
import { mutation, query } from "../_generated/server";

/**
 * Pre-computed workspace-level counts.
 * Updated by scheduled function every 5 minutes, or after CUD mutations via action.
 */
export const refreshWorkspaceCounts = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const [projects, tasks, clients, milestones] = await Promise.all([
      ctx.db.query("projects")
        .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
        .filter(q => q.eq(q.field("deletedAt"), undefined))
        .collect(),
      ctx.db.query("tasks")
        .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
        .filter(q => q.eq(q.field("deletedAt"), undefined))
        .collect(),
      ctx.db.query("clients")
        .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
        .filter(q => q.eq(q.field("deletedAt"), undefined))
        .collect(),
      ctx.db.query("milestones")
        .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
        .filter(q => q.eq(q.field("deletedAt"), undefined))
        .collect(),
    ]);

    const counts = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === "active").length,
      totalTasks: tasks.length,
      overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < Date.now() && t.status !== "done").length,
      totalClients: clients.length,
      completedMilestones: milestones.filter(m => m.status === "completed").length,
      updatedAt: Date.now(),
    };

    // Upsert into a single-document counts table (or workspace metadata)
    // Could store in a `workspaceCounts` table or on the workspace doc itself
    return counts;
  },
});
```

## Caching Strategy

| Data | Strategy | TTL |
|---|---|---|
| Workspace members | Per-request `AuthContext` cache | Request lifetime |
| Space/Project membership lists | TanStack Query `staleTime: 30_000` | 30s |
| Project lists | TanStack Query + Convex subscription | Real-time |
| Dashboard aggregates | Pre-computed, refreshed every 5 min | 5 min |
| User capabilities | TanStack Query `staleTime: 60_000` | 60s |
| PII data | Never cache; always fetch fresh | N/A |

## Performance Budget

| Endpoint | P95 Target | Max Scan |
|---|---|---|
| `listProjects` | < 200ms | 500 rows |
| `listTasksByProject` | < 300ms | 2000 rows |
| `getMilestonesByProject` | < 200ms | 200 rows |
| `getEffectivePermissions` | < 100ms | 3 index queries |
| Dashboard aggregates | < 500ms | 10000 rows (pre-computed falls back) |

# Backfill Scripts

All scripts are Convex mutations designed to be run via the dashboard or scheduled as actions.

## 1. Seed Workspaces from Organizations

```typescript
// convex/migrations/seed_workspaces.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const seedFromOrganizations = mutation({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db.query("organizations").collect();
    let created = 0;

    for (const org of orgs) {
      // Check if workspace already exists for this org
      const existing = await ctx.db
        .query("workspaces")
        .withIndex("by_clerk_org", (q) => q.eq("clerkOrganizationId", org.organizationId))
        .first();

      if (existing) continue;

      await ctx.db.insert("workspaces", {
        name: org.name,
        slug: org.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        clerkOrganizationId: org.organizationId,
        logo: org.logo,
        createdByUserId: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      created++;
    }

    return { created, total: orgs.length };
  },
});
```

## 2. Migrate projectSpaces → spaces

```typescript
// convex/migrations/promote_spaces.ts
import { mutation } from "../_generated/server";

export const promoteProjectSpaces = mutation({
  args: {},
  handler: async (ctx) => {
    const oldSpaces = await ctx.db.query("projectSpaces").collect();
    let migrated = 0;

    for (const ps of oldSpaces) {
      if (ps.deletedAt) continue;

      // Find the workspace for the project's organization
      const project = await ctx.db.get(ps.projectId);
      if (!project) continue;

      const workspace = await ctx.db
        .query("workspaces")
        .withIndex("by_clerk_org", (q) => q.eq("clerkOrganizationId", project.organizationId))
        .first();
      if (!workspace) continue;

      // Check if space already exists (idempotent)
      const slugExists = await ctx.db
        .query("spaces")
        .withIndex("by_workspace_slug", (q) =>
          q.eq("workspaceId", workspace._id).eq("slug", ps.slug),
        )
        .first();
      if (slugExists) continue;

      // Create new space
      const newSpaceId = await ctx.db.insert("spaces", {
        workspaceId: workspace._id,
        name: ps.name,
        slug: ps.slug,
        icon: ps.icon,
        color: ps.color,
        visibility: ps.visibility === "all_members" ? "open" : "private",
        defaultAssigneeIds: ps.defaultAssigneeIds,
        createdByUserId: ps.createdByUserId,
        createdAt: ps.createdAt,
        updatedAt: ps.updatedAt,
      });

      // Link project to space
      await ctx.db.patch(ps.projectId, { spaceId: newSpaceId });

      // Archive old space record
      await ctx.db.patch(ps._id, { deletedAt: Date.now() });

      // Archive in migration archives
      await ctx.db.insert("migrationArchives", {
        organizationId: project.organizationId,
        migrationKey: "promote_spaces",
        sourceTable: "projectSpaces",
        sourceId: ps._id,
        payload: { newSpaceId, projectId: ps.projectId },
        archivedByUserId: "system",
        archivedAt: Date.now(),
      });

      migrated++;
    }

    return { migrated };
  },
});
```

## 3. Backfill workspaceId on Business Tables

```typescript
// convex/migrations/backfill_workspace_id.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

const TABLES = ["projects", "tasks", "clients", "deals", "opportunities", "calendarEvents", "docs", "mediaAssets"] as const;

export const backfillWorkspaceId = mutation({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? 100;
    const results: Record<string, { processed: number; patched: number }> = {};

    for (const tableName of TABLES) {
      const rows = await ctx.db.query(tableName).take(batchSize);
      let patched = 0;

      for (const row of rows as any[]) {
        if (row.workspaceId) continue; // already populated

        const workspace = await ctx.db
          .query("workspaces")
          .withIndex("by_clerk_org", (q) => q.eq("clerkOrganizationId", row.organizationId))
          .first();
        if (workspace) {
          await ctx.db.patch(row._id, { workspaceId: workspace._id });
          patched++;
        }
      }

      results[tableName] = { processed: rows.length, patched };
    }

    return results;
  },
});
```

## 4. Dual-Write Validation

```typescript
// convex/migrations/validate_dual_write.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const validateWorkspaceIdConsistency = mutation({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, { total: number; missing: number; mismatched: number }> = {};

    for (const tableName of TABLES) {
      const rows = await ctx.db.query(tableName).collect();
      let missing = 0;
      let mismatched = 0;

      for (const row of rows as any[]) {
        if (!row.workspaceId) {
          missing++;
          continue;
        }
        if (!row.organizationId) continue;

        const workspace = await ctx.db.get(row.workspaceId);
        if (workspace && workspace.clerkOrganizationId !== row.organizationId) {
          mismatched++;
        }
      }

      results[tableName] = { total: rows.length, missing, mismatched };
    }

    return results;
  },
});
```

## Rollback Procedure

1. **If dual-write shows mismatches**: Stop all writes, restore from `migrationArchives`, fix mapping logic, retry.
2. **If permissions break**: Set `FF_ENFORCE_PERMISSIONS = "0"` (reverts to no-op).
3. **If space promotion has issues**: Run the inverse migration from `migrationArchives` to restore `projectSpaces` and unlink `spaceId`.

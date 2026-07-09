import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { resolveProjectAccess, type ProjectAccess } from "./access/project";

const defaultDashboardConfig = {
  widgetConfig: "[]",
  layout: "[]",
} as const;

const dashboardConfigValidator = v.object({
  widgetConfig: v.string(),
  layout: v.string(),
  notes: v.optional(v.string()),
  updatedAt: v.number(),
});

const dashboardPatchValidator = v.object({
  widgetConfig: v.optional(v.string()),
  layout: v.optional(v.string()),
  notes: v.optional(v.union(v.string(), v.null())),
});

type DashboardConfig = {
  widgetConfig: string;
  layout: string;
  notes?: string;
  updatedAt: number;
};

type DashboardPatch = {
  widgetConfig?: string;
  layout?: string;
  notes?: string | null;
};

function isActiveProjectInOrganization(
  project: Doc<"projects"> | null,
  organizationId: string,
): project is Doc<"projects"> {
  return Boolean(
    project &&
      project.organizationId === organizationId &&
      !project.deletedAt &&
      project.recordState !== "deleted",
  );
}

function presentDashboard(config: Doc<"projectDashboards">): DashboardConfig {
  return {
    widgetConfig: config.widgetConfig,
    layout: config.layout,
    notes: config.notes,
    updatedAt: config.updatedAt,
  };
}

export function applyDashboardPatch(
  existing: DashboardConfig | null,
  patch: DashboardPatch,
): Omit<DashboardConfig, "updatedAt"> {
  return {
    widgetConfig: patch.widgetConfig ?? existing?.widgetConfig ?? defaultDashboardConfig.widgetConfig,
    layout: patch.layout ?? existing?.layout ?? defaultDashboardConfig.layout,
    ...(patch.notes === undefined
      ? existing?.notes === undefined
        ? {}
        : { notes: existing.notes }
      : patch.notes === null
        ? {}
        : { notes: patch.notes }),
  };
}

export async function readAuthorizedDashboard(
  ctx: Pick<QueryCtx, "db">,
  args: { organizationId: string; projectId: Id<"projects"> },
  access: Pick<ProjectAccess, "assertCanRead">,
): Promise<DashboardConfig | null> {
  const project = await ctx.db.get(args.projectId);
  if (!isActiveProjectInOrganization(project, args.organizationId)) return null;

  access.assertCanRead(project);
  const dashboard = await ctx.db
    .query("projectDashboards")
    .withIndex("by_organization_project", (q) =>
      q.eq("organizationId", args.organizationId).eq("projectId", args.projectId),
    )
    .unique();

  return dashboard ? presentDashboard(dashboard) : null;
}

export async function requireUpdatableDashboardProject(
  ctx: Pick<MutationCtx, "db">,
  args: { organizationId: string; projectId: Id<"projects"> },
  access: Pick<ProjectAccess, "assertCanUpdate">,
): Promise<Doc<"projects">> {
  const project = await ctx.db.get(args.projectId);
  if (!isActiveProjectInOrganization(project, args.organizationId)) {
    throw new ConvexError({
      code: "PROJECT_DASHBOARD_PROJECT_NOT_FOUND",
      message: "The project does not belong to this organization.",
    });
  }

  access.assertCanUpdate(project);
  return project;
}

export const get = query({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
  },
  returns: v.union(dashboardConfigValidator, v.null()),
  handler: async (ctx, args) => {
    const access = await resolveProjectAccess(ctx, args.organizationId);
    return readAuthorizedDashboard(ctx, args, access);
  },
});

export const upsert = mutation({
  args: {
    organizationId: v.string(),
    projectId: v.id("projects"),
    patch: dashboardPatchValidator,
  },
  returns: dashboardConfigValidator,
  handler: async (ctx, args) => {
    if (
      args.patch.widgetConfig === undefined &&
      args.patch.layout === undefined &&
      args.patch.notes === undefined
    ) {
      throw new ConvexError({
        code: "PROJECT_DASHBOARD_PATCH_REQUIRED",
        message: "At least one dashboard field must be updated.",
      });
    }

    const access = await resolveProjectAccess(ctx, args.organizationId);
    await requireUpdatableDashboardProject(ctx, args, access);
    const existing = await ctx.db
      .query("projectDashboards")
      .withIndex("by_organization_project", (q) =>
        q.eq("organizationId", args.organizationId).eq("projectId", args.projectId),
      )
      .unique();
    const current = existing ? presentDashboard(existing) : null;
    const next = applyDashboardPatch(current, args.patch);

    if (
      existing &&
      existing.widgetConfig === next.widgetConfig &&
      existing.layout === next.layout &&
      existing.notes === next.notes
    ) {
      return presentDashboard(existing);
    }

    const updatedAt = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...next, updatedAt });
    } else {
      await ctx.db.insert("projectDashboards", {
        organizationId: args.organizationId,
        projectId: args.projectId,
        ...next,
        updatedAt,
      });
    }

    return { ...next, updatedAt };
  },
});

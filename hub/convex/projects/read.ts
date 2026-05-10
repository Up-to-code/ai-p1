import { v } from "convex/values";
import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { listResourceMedia, selectCoverUrl } from "../media/data";
import { projectValidator } from "./validators";

async function presentProject(ctx: QueryCtx, project: Doc<"projects">) {
  const media = await listResourceMedia(ctx, project.organizationId, "project", project._id);
  return {
    ...project,
    id: project._id,
    coverImageUrl: selectCoverUrl(media),
  };
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const active = projects
      .filter((project) => !project.deletedAt)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return Promise.all(active.map((project) => presentProject(ctx, project)));
  },
});

export const get = query({
  args: { organizationId: v.string(), projectId: v.id("projects") },
  returns: v.union(projectValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== args.organizationId || project.deletedAt) {
      return null;
    }

    return presentProject(ctx, project);
  },
});

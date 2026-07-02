import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeWorkspaceRows } from "../workspace/readSurface";
import { projectSpaceValidator } from "./validators";

const MAX_LIST_SPACES = 100;
const MAX_ORG_SPACES = 500;

export const listByOrganization = query({
  args: { organizationId: v.string() },
  returns: v.array(projectSpaceValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_ORG_SPACES);

    return activeWorkspaceRows(projectSpaces);
  },
});

export const list = query({
  args: { organizationId: v.string(), projectId: v.id("projects") },
  returns: v.array(projectSpaceValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_project_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("projectId", args.projectId),
      )
      .take(MAX_LIST_SPACES);

    return activeWorkspaceRows(projectSpaces);
  },
});

export const get = query({
  args: { organizationId: v.string(), projectSpaceId: v.id("projectSpaces") },
  returns: v.union(projectSpaceValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projectSpace = await ctx.db.get(args.projectSpaceId);
    if (
      !projectSpace ||
      projectSpace.organizationId !== args.organizationId ||
      projectSpace.deletedAt
    ) {
      return null;
    }
    return projectSpace;
  },
});

export const listBySpace = query({
  args: { organizationId: v.string(), spaceId: v.id("spaces") },
  returns: v.array(projectSpaceValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "project", "read");
    const projectSpaces = await ctx.db
      .query("projectSpaces")
      .withIndex("by_space_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("spaceId", args.spaceId),
      )
      .take(MAX_LIST_SPACES);

    return activeWorkspaceRows(projectSpaces);
  },
});

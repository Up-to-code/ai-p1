import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { requireWorkspaceAccess } from "../../auth/permissions";
import { presentBaseRecord } from "../../shared/present";
import { projectMemberInputValidator, projectMemberValidator } from "./validators";

export const addMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    input: projectMemberInputValidator,
  },
  returns: projectMemberValidator,
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "project", "update");
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity!.subject;

    // Check for existing active membership
    const existing = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.input.userId),
      )
      .first();

    if (existing && !existing.deletedAt) {
      throw new Error("User is already a member of this project.");
    }

    // If previously removed, reactivate
    if (existing && existing.deletedAt) {
      await ctx.db.patch(existing._id, {
        role: args.input.role,
        addedByUserId: userId,
        addedAt: Date.now(),
        deletedAt: undefined,
      });
      const updated = await ctx.db.get(existing._id);
      return presentBaseRecord(updated!) as any;
    }

    const now = Date.now();
    const id = await ctx.db.insert("projectMembers", {
      workspaceId: args.workspaceId,
      projectId: args.projectId,
      userId: args.input.userId,
      role: args.input.role,
      addedAt: now,
      addedByUserId: userId,
    });

    const member = await ctx.db.get(id);
    if (!member) throw new Error("Could not add project member.");
    return presentBaseRecord(member) as any;
  },
});

export const removeMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    userId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const effective = await requireWorkspaceAccess(ctx, args.workspaceId, "project", "update");
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity!.subject;

    const existing = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", args.projectId).eq("userId", args.userId),
      )
      .first();

    if (!existing || existing.deletedAt) {
      throw new Error("Member not found in this project.");
    }

    await ctx.db.patch(existing._id, { deletedAt: Date.now() });
    return { removed: true };
  },
});

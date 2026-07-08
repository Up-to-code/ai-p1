import { v } from "convex/values";
import { components } from "../../_generated/api";
import { action } from "../../_generated/server";

export const addMemberFromInviteLink = action({
  args: {
    organizationId: v.string(),
    userId: v.string(),
    role: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "member",
      where: [
        { field: "organizationId", value: args.organizationId },
        { field: "userId", value: args.userId },
      ],
    });

    if (existing) return null;

    await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "member",
        data: {
          organizationId: args.organizationId,
          userId: args.userId,
          role: args.role,
          createdAt: Date.now(),
        },
      },
    });

    return null;
  },
});

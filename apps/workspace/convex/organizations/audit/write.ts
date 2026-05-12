import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { authComponent } from "../../auth";
import { assertOrganizationPermission } from "../profile/access";
import { recordOrganizationAuditEventInputValidator } from "./validators";

export const recordFromHono = mutation({
  args: {
    organizationId: v.string(),
    input: recordOrganizationAuditEventInputValidator,
  },
  returns: v.object({ recorded: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    await assertOrganizationPermission(ctx, args.organizationId, "read");

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: args.input.action,
      target: args.input.target,
      summary: args.input.summary,
      createdAt: Date.now(),
    });

    return { recorded: true };
  },
});

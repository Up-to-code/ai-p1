import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { automationNodeValidator } from "./validators";
import { executeAutomationAction } from "./commandAdapter";

export const executeLocalAction = internalMutation({
  args: {
    automationId: v.id("automations"),
    action: automationNodeValidator,
    payload: v.record(v.string(), v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const automation = await ctx.db.get(args.automationId);
    if (!automation) throw new Error("Automation definition not found.");
    if (args.action.kind !== "action") {
      throw new Error("Automation action not found.");
    }
    return await executeAutomationAction(
      ctx,
      automation,
      args.action,
      args.payload,
    );
  },
});

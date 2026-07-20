import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { notificationCategorySchema, recurrenceFrequencySchema } from "@qentrah/domain-contracts";

export default defineTool({
  description: "Update a scheduled notification.",
  inputSchema: z.object({
    scheduleId: z.string().min(1),
    title: z.string().trim().min(1).optional(),
    body: z.string().trim().min(1).optional(),
    category: notificationCategorySchema.optional(),
    scheduledAt: z.number().optional(),
    timezone: z.string().optional(),
    recurrence: z.object({
      frequency: recurrenceFrequencySchema,
      interval: z.number().int().min(1).max(30),
      untilAt: z.number().optional(),
    }).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const { scheduleId, ...input } = args;
    return fetchAuthMutation(ctx, api.notifications.write.updateSchedule, {
      organizationId,
      scheduleId: args.scheduleId as never,
      input: input as never,
    });
  },
});

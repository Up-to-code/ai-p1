import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

export default defineTool({
  description: "Schedule a notification.",
  inputSchema: z.object({
    title: z.string().trim().min(1),
    body: z.string().trim().min(1),
    category: z.enum(["calendar", "task", "manual", "organization"]).default("manual"),
    scheduledAt: z.number(),
    timezone: z.string().optional(),
    recurrence: z.object({
      frequency: z.enum(["daily", "weekly", "monthly"]),
      interval: z.number().int().min(1).max(30),
      untilAt: z.number().optional(),
    }).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthMutation(ctx, api.notifications.write.createSchedule, {
      organizationId,
      input: args as never,
    });
  },
});

import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";

export default defineTool({
  description: "Cancel a scheduled notification.",
  inputSchema: z.object({
    scheduleId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthMutation(ctx, api.notifications.write.cancelSchedule, {
      organizationId,
      scheduleId: args.scheduleId as never,
    });
  },
});

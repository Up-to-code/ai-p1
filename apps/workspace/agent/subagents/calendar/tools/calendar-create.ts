import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

export default defineTool({
  description: "Create a new calendar event.",
  inputSchema: z.object({
    title: z.string().min(1),
    ownerUserId: z.string().optional(),
    clientId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
    taskId: z.string().min(1).optional(),
    startAt: z.number(),
    endAt: z.number(),
    type: z.enum(["meeting", "deadline", "reminder", "milestone", "focusBlock"]),
    status: z.enum(["confirmed", "pending", "draft"]),
    location: z.string().optional(),
    meetingUrl: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return fetchAuthMutation(ctx, api.calendar.write.createFromHono, {
      organizationId,
      input: args as never,
    });
  },
});

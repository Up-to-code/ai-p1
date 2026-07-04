import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";

export default defineTool({
  description: "List today's calendar events.",
  inputSchema: z.object({
    limit: z.number().int().min(1).max(50).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startAt = start.getTime();
    const events = await fetchAuthQuery(ctx, api.calendar.read.listRange, {
      organizationId,
      startAt,
      endAt: startAt + 24 * 60 * 60 * 1000,
    });
    const maxItems = Math.max(1, Math.min(args.limit ?? 25, 50));
    return Array.isArray(events) ? events.slice(0, maxItems) : events;
  },
});

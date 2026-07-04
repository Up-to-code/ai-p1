import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";

export default defineTool({
  description: "List calendar events for a given month.",
  inputSchema: z.object({
    year: z.number(),
    month: z.number().min(1).max(12),
    limit: z.number().int().min(1).max(50).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    const start = new Date(args.year, args.month - 1, 1);
    const end = new Date(args.year, args.month, 1);
    const events = await fetchAuthQuery(ctx, api.calendar.read.listRange, {
      organizationId,
      startAt: start.getTime(),
      endAt: end.getTime(),
    });
    const maxItems = Math.max(1, Math.min(args.limit ?? 25, 50));
    return Array.isArray(events) ? events.slice(0, maxItems) : events;
  },
});

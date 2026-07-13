import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";

export default defineTool({
  description: "List calendar events within a date range.",
  inputSchema: z.object({
    startAt: z.number(),
    endAt: z.number(),
    limit: z.number().int().min(1).max(50).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    const events = await fetchAuthQuery(ctx, api.calendar.read.listRange, {
      organizationId,
      startAt: args.startAt,
      endAt: args.endAt,
    });
    const maxItems = Math.max(1, Math.min(args.limit ?? 25, 50));
    return Array.isArray(events) ? events.slice(0, maxItems) : events;
  },
});

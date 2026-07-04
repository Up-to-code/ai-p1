import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";

export default defineTool({
  description: "List media attachments for a specific resource.",
  inputSchema: z.object({
    resourceType: z.enum(["project", "client", "calendarEvent", "task"]),
    resourceId: z.string().min(1),
    limit: z.number().int().min(1).max(50).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    const items = await fetchAuthQuery(ctx, api.media.read.listForResource, {
      organizationId,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
    });
    const maxItems = Math.max(1, Math.min(args.limit ?? 25, 50));
    return Array.isArray(items) ? items.slice(0, maxItems) : items;
  },
});

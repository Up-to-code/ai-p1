import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";

export default defineTool({
  description: "List tasks, optionally filtered by assignee.",
  inputSchema: z.object({
    assigneeUserId: z.string().min(1).optional(),
    limit: z.number().int().min(1).max(50).optional(),
    search: z.string().trim().max(160).optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    const allTasks = await fetchAuthQuery(ctx, api.clientTasks.read.list, {
      organizationId,
      assigneeUserId: args.assigneeUserId,
    }) as unknown[];
    const search = typeof args.search === "string" ? args.search.trim().toLowerCase() : "";
    let tasks = allTasks;
    if (search) {
      tasks = allTasks.filter(
        (t) => [((t as Record<string, unknown>).title as string), ((t as Record<string, unknown>).notes as string)].some((v) => v?.toLowerCase().includes(search)),
      );
    }
    const maxItems = Math.max(1, Math.min(args.limit ?? 25, 50));
    return tasks.slice(0, maxItems);
  },
});

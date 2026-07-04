import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../../../lib/convex";
import { requireOrgId } from "../../../lib/org-context";
import { stripDatabaseFields } from "../../../lib/update-entity";

export default defineTool({
  description: "Mark a task as completed.",
  inputSchema: z.object({
    taskId: z.string().min(1),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    const existing = await fetchAuthQuery(ctx, api.clientTasks.read.get, {
      organizationId,
      taskId: args.taskId as never,
    });
    if (!existing) throw new Error("Task was not found.");
    const merged = {
      ...stripDatabaseFields(existing as Record<string, unknown>),
      status: "done",
    };
    return fetchAuthMutation(ctx, api.clientTasks.write.updateFromHono, {
      organizationId,
      taskId: args.taskId as never,
      input: merged as never,
    });
  },
});

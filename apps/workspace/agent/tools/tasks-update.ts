import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery, fetchAuthMutation } from "../lib/convex";
import { requireOrgId } from "../lib/org-context";
import { updateEntity } from "../lib/update-entity";

export default defineTool({
  description: "Update an existing task.",
  inputSchema: z.object({
    taskId: z.string().min(1),
    title: z.string().min(1).optional(),
    status: z.enum(["todo", "inProgress", "waiting", "done", "canceled"]).optional(),
    visibility: z.enum(["private", "team", "workspace"]).optional(),
    priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
    assigneeUserId: z.string().optional(),
    clientId: z.string().min(1).optional(),
    projectId: z.string().min(1).optional(),
    dueDate: z.string().optional(),
    description: z.string().optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const organizationId = requireOrgId(ctx);
    return updateEntity({
      organizationId,
      id: args.taskId,
      idKey: "taskId",
      label: "Task",
      fetchExisting: () => fetchAuthQuery(ctx, api.clientTasks.read.get, { organizationId, taskId: args.taskId as never }),
      updateFn: (orgId, id, data) =>
        fetchAuthMutation(ctx, api.clientTasks.write.updateFromHono, {
          organizationId: orgId,
          taskId: id as never,
          input: data as never,
        }),
      input: args,
      schema: z.object({}).passthrough(),
    });
  },
});

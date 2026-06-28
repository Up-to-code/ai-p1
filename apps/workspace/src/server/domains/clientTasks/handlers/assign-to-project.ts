import type { Context } from "hono";
import { z } from "zod";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { assignTasksToProject } from "../services/assign-tasks-to-project";

const assignBodySchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1),
  projectId: z.string().min(1),
});

export async function handleAssignTasksToProject(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    const body = await c.req.json();
    const parsed = assignBodySchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request body.", details: parsed.error.flatten() }, 400);
    }

    const result = await assignTasksToProject(org.organizationId, parsed.data.taskIds, parsed.data.projectId);
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Failed to assign tasks to project.");
  }
}

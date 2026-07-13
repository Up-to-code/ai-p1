import type { Context } from "hono";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/auth-request";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";

const bulkTaskBodySchema = z.object({
  action: z.enum(["complete", "delete"]),
  taskIds: z.array(z.string().min(1)).min(1).max(100),
});

export async function handleBulkTasks(c: Context) {
  const organization = requireOrganizationId(c);
  if (!organization.ok) return organization.response;
  const parsed = await validateJsonBody(c, bulkTaskBodySchema, "Invalid bulk Task payload.");
  if (!parsed.ok) return parsed.response;
  try {
    const result = await fetchAuthMutation(api.clientTasks.write.bulkFromHono, {
      organizationId: organization.organizationId,
      ...parsed.data,
    });
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Bulk Task action failed.");
  }
}

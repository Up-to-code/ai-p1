import type { Context } from "hono";
import { createCrudHandlers } from "@/server/utils/handler-factory";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { followUpPayloadSchema } from "../validation/follow-up.schema";
import { createFollowUp, deleteFollowUp, updateFollowUp, markFollowUpComplete } from "../services/follow-ups";

export const { handleCreate: handleCreateFollowUp, handleUpdate: handleUpdateFollowUp, handleDelete: handleDeleteFollowUp } = createCrudHandlers({
  resourceName: "followUp",
  createSchema: followUpPayloadSchema,
  updateSchema: followUpPayloadSchema,
  resourceIdParam: "followUpId",
  service: { create: createFollowUp, update: updateFollowUp, delete: deleteFollowUp },
});

export async function handleMarkFollowUpComplete(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const followUpId = c.req.param("followUpId");
  if (!followUpId) return c.json({ error: "Follow-up id is required." }, 400);

  try {
    return c.json({ followUp: await markFollowUpComplete(org.organizationId, followUpId) });
  } catch (error) {
    return actionErrorJson(c, error, "Follow-up action failed.");
  }
}

import type { Context } from "hono";
import { createDomainRouter } from "@/server/utils/create-domain-router";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { fetchAuthMutation } from "@/server/auth/auth-request";
import { followUpPayloadSchema } from "../validation/follow-up.schema";
import { api } from "@convex/_generated/api";

export const { handleCreate: handleCreateFollowUp, handleUpdate: handleUpdateFollowUp, handleDelete: handleDeleteFollowUp } = createDomainRouter({
  resourceName: "followUp",
  createSchema: followUpPayloadSchema,
  updateSchema: followUpPayloadSchema,
  resourceIdParam: "followUpId",
  convex: {
    create: api.clientFollowUps.write.createFromHono,
    update: api.clientFollowUps.write.updateFromHono,
    delete: api.clientFollowUps.write.deleteFromHono,
  },
});

export async function handleMarkFollowUpComplete(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const followUpId = c.req.param("followUpId");
  if (!followUpId) return c.json({ error: "Follow-up id is required." }, 400);

  try {
    return c.json({ followUp: await fetchAuthMutation(api.clientFollowUps.write.markComplete, {
      organizationId: org.organizationId,
      followUpId: followUpId as never,
    }) });
  } catch (error) {
    return actionErrorJson(c, error, "Follow-up action failed.");
  }
}

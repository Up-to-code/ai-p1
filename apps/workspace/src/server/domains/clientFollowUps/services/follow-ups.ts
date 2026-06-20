import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/clerk-convex";
import { createCrudService } from "@/server/utils/service-factory";
import type { FollowUpPayload } from "../validation/follow-up.schema";

const crud = createCrudService<FollowUpPayload>({
  api: {
    create: api.clientFollowUps.write.createFromHono,
    update: api.clientFollowUps.write.updateFromHono,
    delete: api.clientFollowUps.write.deleteFromHono,
  },
  idParamName: "followUpId",
});

export const createFollowUp = crud.create;
export const updateFollowUp = crud.update;
export const deleteFollowUp = crud.remove;

export async function markFollowUpComplete(organizationId: string, followUpId: string) {
  return fetchAuthMutation(api.clientFollowUps.write.markComplete, {
    organizationId,
    followUpId: followUpId as never,
  });
}

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { createCrudService } from "@/server/utils/service-factory";
import type { ProjectPayload } from "../validation/project.schema";

/**
 * WHY:   Project domain business logic should be encapsulated in services, not scattered across Convex functions.
 * WHAT:  Project service provides CRUD operations with domain-specific logic.
 * HOW:  Delegates to Convex functions for persistence, but can be extended with domain rules.
 */

function toConvexInput(input: ProjectPayload) {
  const { clientId, opportunityId, ...rest } = input;
  return {
    ...rest,
    ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    ...(opportunityId ? { opportunityId: opportunityId as Id<"opportunities"> } : {}),
  };
}

const crud = createCrudService<ProjectPayload>({
  api: {
    create: api.projects.write.createFromHono,
    update: api.projects.write.updateFromHono,
    delete: api.projects.write.deleteFromHono,
  },
  idParamName: "projectId",
  toConvexInput,
});

export const createProject = crud.create;
export const updateProject = crud.update;
export const deleteProject = crud.remove;

/**
 * Domain-specific business rules for projects.
 * These can be extended as the domain grows more complex.
 */
export const projectBusinessRules = {
  /**
   * Validates if a project can transition to a given status.
   */
  canTransitionToStatus(currentStatus: string, targetStatus: string): boolean {
    const statusOrder = ["planned", "active", "paused", "completed", "archived"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const targetIndex = statusOrder.indexOf(targetStatus);
    // Allow transitions to/from paused, otherwise forward only
    if (targetStatus === "paused" || currentStatus === "paused") return true;
    return targetIndex >= currentIndex;
  },

  /**
   * Determines default health based on status.
   */
  getDefaultHealth(status: string): "onTrack" | "atRisk" | "blocked" {
    if (status === "paused") return "atRisk";
    if (status === "completed") return "onTrack";
    return "onTrack";
  },

  /**
   * Validates if a project can be linked to a client.
   */
  canLinkToClient(clientId: string | undefined): boolean {
    return clientId !== undefined && clientId.length > 0;
  },
} as const;

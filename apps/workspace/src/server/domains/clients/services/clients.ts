import { api } from "@convex/_generated/api";
import { createCrudService } from "@/server/utils/service-factory";
import type { ClientPayload } from "../validation/client.schema";

/**
 * WHY:   Client domain business logic should be encapsulated in services, not scattered across Convex functions.
 * WHAT:  Client service provides CRUD operations with domain-specific logic.
 * HOW:  Delegates to Convex functions for persistence, but could be extended with domain rules.
 */

const crud = createCrudService<ClientPayload>({
  api: {
    create: api.clients.write.createFromHono,
    update: api.clients.write.updateFromHono,
    delete: api.clients.write.deleteFromHono,
  },
  idParamName: "clientId",
});

export const createClient = crud.create;
export const updateClient = crud.update;
export const deleteClient = crud.remove;

/**
 * Domain-specific business rules for clients.
 * These can be extended as the domain grows more complex.
 */
export const clientBusinessRules = {
  /**
   * Validates if a client can transition to a given pipeline stage.
   */
  canTransitionToStage(currentStage: string, targetStage: string): boolean {
    const stageOrder = ["new", "qualified", "review", "negotiation", "closed"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const targetIndex = stageOrder.indexOf(targetStage);
    return targetIndex >= currentIndex;
  },

  /**
   * Determines default visibility based on client type.
   */
  getDefaultVisibility(type: "person" | "organization"): "private" | "team" | "workspace" {
    return type === "organization" ? "team" : "private";
  },
} as const;

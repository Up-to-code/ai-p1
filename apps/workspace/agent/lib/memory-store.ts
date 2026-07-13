import { api } from "@convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { WorkspaceActor } from "./workspace-actor";

export interface Memory {
  key: string;
  value: string;
  updatedAt: number;
}

export const memoryStore = {
  async list(scope: WorkspaceActor, options: { limit: number }): Promise<Memory[]> {
    return fetchQuery(
      api.memory.list,
      { organizationId: scope.organizationId, userId: scope.userId },
      ...(scope.convexToken ? [{ token: scope.convexToken }] : []),
    ) as Promise<Memory[]>;
  },

  async put(scope: WorkspaceActor, memory: { key: string; value: string }): Promise<Memory> {
    return fetchMutation(
      api.memory.put,
      { organizationId: scope.organizationId, userId: scope.userId, ...memory },
      ...(scope.convexToken ? [{ token: scope.convexToken }] : []),
    ) as Promise<Memory>;
  },

  async delete(scope: WorkspaceActor, key: string): Promise<boolean> {
    const result = await fetchMutation(
      api.memory.deleteMemory,
      { organizationId: scope.organizationId, userId: scope.userId, key },
      ...(scope.convexToken ? [{ token: scope.convexToken }] : []),
    ) as { deleted: boolean };
    return result.deleted;
  },
};

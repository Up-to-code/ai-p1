import { api } from "@convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { TenantCaller } from "./tenant";

export interface Memory {
  key: string;
  value: string;
  updatedAt: number;
}

export const memoryStore = {
  async list(scope: TenantCaller, options: { limit: number }): Promise<Memory[]> {
    return fetchQuery(
      api.memory.list,
      { organizationId: scope.orgId, userId: scope.userId },
      ...(scope.convexToken ? [{ token: scope.convexToken }] : []),
    ) as Promise<Memory[]>;
  },

  async put(scope: TenantCaller, memory: { key: string; value: string }): Promise<Memory> {
    return fetchMutation(
      api.memory.put,
      { organizationId: scope.orgId, userId: scope.userId, ...memory },
      ...(scope.convexToken ? [{ token: scope.convexToken }] : []),
    ) as Promise<Memory>;
  },

  async delete(scope: TenantCaller, key: string): Promise<boolean> {
    const result = await fetchMutation(
      api.memory.deleteMemory,
      { organizationId: scope.orgId, userId: scope.userId, key },
      ...(scope.convexToken ? [{ token: scope.convexToken }] : []),
    ) as { deleted: boolean };
    return result.deleted;
  },
};

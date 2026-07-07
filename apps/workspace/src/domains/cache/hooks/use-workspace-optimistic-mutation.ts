import { useCallback } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

export function useWorkspaceOptimisticMutation() {
  const queryClient = useQueryClient();

  const patchLists = useCallback(
    async <TItem extends { id: string }>(
      queryKey: QueryKey,
      itemId: string,
      patch: Partial<TItem>,
    ) => {
      const previousEntries = queryClient.getQueriesData<TItem[]>({ queryKey });

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueriesData<TItem[]>({ queryKey }, (current) => {
        if (!current) return current;
        return current.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item,
        );
      });

      return {
        rollback: () => {
          previousEntries.forEach(([key, data]) => {
            if (data !== undefined) queryClient.setQueryData(key, data);
          });
        },
      };
    },
    [queryClient],
  );

  return { patchLists };
}

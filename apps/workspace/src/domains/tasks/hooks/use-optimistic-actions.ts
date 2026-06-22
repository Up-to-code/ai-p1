"use client";

import { useCallback, useRef, useState } from "react";

type PendingAction<T> = {
  id: string;
  apply: (item: T) => T;
  isAffected: (item: T) => boolean;
};

let actionCounter = 0;
function nextActionId() {
  return `opt_${++actionCounter}_${Date.now()}`;
}

export function useOptimisticActions<T extends { id: string }>() {
  const pendingRef = useRef<PendingAction<T>[]>([]);
  const [, forceRender] = useState(0);

  const push = useCallback((action: PendingAction<T>) => {
    pendingRef.current = [...pendingRef.current, action];
    forceRender((n) => n + 1);
  }, []);

  const remove = useCallback((actionId: string) => {
    pendingRef.current = pendingRef.current.filter((a) => a.id !== actionId);
    forceRender((n) => n + 1);
  }, []);

  const applyToList = useCallback((items: T[]): T[] => {
    let result = items;
    for (const action of pendingRef.current) {
      result = result.map((item) =>
        action.isAffected(item) ? action.apply(item) : item,
      );
    }
    return result;
  }, []);

  const applyToItem = useCallback((item: T | null | undefined): T | null | undefined => {
    if (!item) return item;
    let result = item;
    for (const action of pendingRef.current) {
      if (action.isAffected(result)) {
        result = action.apply(result);
      }
    }
    return result;
  }, []);

  const mutate = useCallback(
    async <TResult>(
      action: PendingAction<T>,
      fn: () => Promise<TResult>,
    ): Promise<TResult> => {
      push(action);
      try {
        const result = await fn();
        return result;
      } catch (error) {
        remove(action.id);
        throw error;
      } finally {
        remove(action.id);
      }
    },
    [push, remove],
  );

  return { applyToList, applyToItem, mutate, push, remove };
}

export function taskOptimisticMove<T extends { id: string; status: string; pipelineOrder?: number }>(
  taskId: string,
  newStatus: string,
  newPipelineOrder: number,
): PendingAction<T> {
  return {
    id: nextActionId(),
    apply: (item) =>
      item.id === taskId
        ? { ...item, status: newStatus, pipelineOrder: newPipelineOrder, updatedAt: Date.now() }
        : item,
    isAffected: (item) => item.id === taskId,
  };
}

export function taskOptimisticUpdate<T extends { id: string }>(
  taskId: string,
  patch: Partial<T>,
): PendingAction<T> {
  return {
    id: nextActionId(),
    apply: (item) => (item.id === taskId ? { ...item, ...patch, updatedAt: Date.now() } : item),
    isAffected: (item) => item.id === taskId,
  };
}

export function taskOptimisticRemove<T extends { id: string }>(
  taskId: string,
): PendingAction<T> {
  return {
    id: nextActionId(),
    apply: () => ({ ...({ id: "", title: "", status: "canceled" } as any) as T, _deleted: true } as T),
    isAffected: (item) => item.id === taskId,
  };
}

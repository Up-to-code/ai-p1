"use client";

import { useCallback, useRef, useState } from "react";
import type { TaskRecord } from "../tasks.types";

type PendingAction = {
  id: string;
  taskId: string;
  apply: (item: TaskRecord) => TaskRecord;
  isAffected: (item: TaskRecord) => boolean;
  matchesRealtime: (item: TaskRecord) => boolean;
};

let actionCounter = 0;
function nextActionId() {
  return `opt_${++actionCounter}_${Date.now()}`;
}

export function useOptimisticTaskActions() {
  const [pending, setPending] = useState<PendingAction[]>([]);
  const [version, setVersion] = useState(0);

  const push = useCallback((action: PendingAction) => {
    setPending((prev) => [...prev, action]);
    setVersion((v) => v + 1);
  }, []);

  const remove = useCallback((actionId: string) => {
    setPending((prev) => prev.filter((a) => a.id !== actionId));
    setVersion((v) => v + 1);
  }, []);

  const reconcile = useCallback((items: TaskRecord[]) => {
    setPending((prev) => {
      if (prev.length === 0) return prev;
      const remaining = prev.filter((action) => {
        const realtimeItem = items.find((i) => i.id === action.taskId);
        if (!realtimeItem) return true;
        return !action.matchesRealtime(realtimeItem);
      });
      if (remaining.length === prev.length) return prev;
      setVersion((v) => v + 1);
      return remaining;
    });
  }, []);

  const applyToList = useCallback((items: TaskRecord[]): TaskRecord[] => {
    if (pending.length === 0) return items;
    let result = items;
    for (const action of pending) {
      let hasChange = false;
      const next = result.map((item) => {
        const newItem = action.isAffected(item) ? action.apply(item) : item;
        if (newItem !== item) hasChange = true;
        return newItem;
      });
      if (!hasChange) continue;
      result = next;
    }
    return result;
  }, [pending]);

  const applyToItem = useCallback((item: TaskRecord | null | undefined) => {
    if (!item || pending.length === 0) return item;
    let result = item;
    for (const action of pending) {
      if (action.isAffected(result)) {
        result = action.apply(result);
      }
    }
    return result;
  }, [pending]);

  return { applyToList, applyToItem, push, remove, reconcile, version };
}

export function taskOptimisticMove(
  taskId: string,
  newStatus: string,
  newPipelineOrder: number,
): PendingAction {
  return {
    id: nextActionId(),
    taskId,
    apply: (item) =>
      item.id === taskId
        ? { ...item, status: newStatus as TaskRecord["status"], pipelineOrder: newPipelineOrder, updatedAt: Date.now() }
        : item,
    isAffected: (item) => item.id === taskId,
    matchesRealtime: (item) =>
      item.id === taskId && item.status === newStatus && item.pipelineOrder === newPipelineOrder,
  };
}

export function taskOptimisticUpdate(
  taskId: string,
  patch: Partial<TaskRecord>,
): PendingAction {
  return {
    id: nextActionId(),
    taskId,
    apply: (item) => (item.id === taskId ? { ...item, ...patch, updatedAt: Date.now() } : item),
    isAffected: (item) => item.id === taskId,
    matchesRealtime: (item) => {
      for (const [key, value] of Object.entries(patch)) {
        if (key === "updatedAt") continue;
        if ((item as any)[key] !== value) return false;
      }
      return true;
    },
  };
}

export function taskOptimisticRemove(
  taskId: string,
): PendingAction {
  return {
    id: nextActionId(),
    taskId,
    apply: (item) => (item.id === taskId ? { ...item, _deleted: true } : item),
    isAffected: (item) => item.id === taskId,
    matchesRealtime: () => false,
  };
}

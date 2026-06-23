"use client";

import { useCallback, useState } from "react";
import type { DocRecord } from "../docs.types";

type PendingAction = {
  id: string;
  docId: string;
  apply: (item: DocRecord) => DocRecord;
  isAffected: (item: DocRecord) => boolean;
  matchesRealtime: (item: DocRecord) => boolean;
};

let actionCounter = 0;
function nextActionId() {
  return `opt_doc_${++actionCounter}_${Date.now()}`;
}

export function useOptimisticDocActions() {
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

  const reconcile = useCallback((items: DocRecord[]) => {
    setPending((prev) => {
      if (prev.length === 0) return prev;
      const remaining = prev.filter((action) => {
        const realtimeItem = items.find((i) => i.id === action.docId);
        if (!realtimeItem) return true;
        return !action.matchesRealtime(realtimeItem);
      });
      if (remaining.length === prev.length) return prev;
      setVersion((v) => v + 1);
      return remaining;
    });
  }, []);

  const applyToList = useCallback(
    (items: DocRecord[]): DocRecord[] => {
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
    },
    [pending],
  );

  const applyToItem = useCallback(
    (item: DocRecord | null | undefined) => {
      if (!item || pending.length === 0) return item;
      let result = item;
      for (const action of pending) {
        if (action.isAffected(result)) {
          result = action.apply(result);
        }
      }
      return result;
    },
    [pending],
  );

  return { applyToList, applyToItem, push, remove, reconcile, version };
}

export function docOptimisticUpdate(
  docId: string,
  patch: Partial<DocRecord>,
): PendingAction {
  return {
    id: nextActionId(),
    docId,
    apply: (item) => (item.id === docId ? { ...item, ...patch, updatedAt: Date.now() } : item),
    isAffected: (item) => item.id === docId,
    matchesRealtime: (item) => {
      for (const [key, value] of Object.entries(patch)) {
        if (key === "updatedAt") continue;
        if ((item as any)[key] !== value) return false;
      }
      return true;
    },
  };
}

export function docOptimisticRemove(docId: string): PendingAction {
  return {
    id: nextActionId(),
    docId,
    apply: (item) => (item.id === docId ? { ...item, deletedAt: Date.now() } : item),
    isAffected: (item) => item.id === docId,
    matchesRealtime: () => false,
  };
}

export function docOptimisticMove(docId: string, folderId: string | undefined): PendingAction {
  return {
    id: nextActionId(),
    docId,
    apply: (item) =>
      item.id === docId ? { ...item, folderId, updatedAt: Date.now() } : item,
    isAffected: (item) => item.id === docId,
    matchesRealtime: (item) => item.id === docId && item.folderId === folderId,
  };
}

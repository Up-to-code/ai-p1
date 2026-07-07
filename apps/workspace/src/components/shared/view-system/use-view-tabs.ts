"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getItem, setItem } from "@/domains/storage/adapters/indexeddb-adapter";
import type { ViewItem, ViewType } from "./types";

interface UseViewTabsOptions {
  scope: string;
  defaultTabs: ViewItem[];
}

interface UseViewTabsResult {
  tabs: ViewItem[];
  activeTabId: string;
  mountedTabIds: ReadonlySet<string>;
  setActiveTab: (id: string) => void;
  addTab: (type: ViewType, label?: string) => void;
  removeTab: (id: string) => void;
  reorderTabs: (tabs: ViewItem[]) => void;
  renameTab: (id: string, label: string) => void;
  isLoaded: boolean;
}

const STORAGE_PREFIX = "views:tabs:";
const ACTIVE_PREFIX = "views:active:";

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readActiveFromLocalStorage(scope: string): string | null {
  try {
    return localStorage.getItem(`${ACTIVE_PREFIX}${scope}`);
  } catch {
    return null;
  }
}

function writeActiveToLocalStorage(scope: string, id: string): void {
  try {
    localStorage.setItem(`${ACTIVE_PREFIX}${scope}`, id);
  } catch {
    /* quota */
  }
}

export function useViewTabs({ scope, defaultTabs }: UseViewTabsOptions): UseViewTabsResult {
  const storageKey = `${STORAGE_PREFIX}${scope}`;

  const initialActive = readActiveFromLocalStorage(scope);
  const [tabs, setTabsState] = useState<ViewItem[]>(defaultTabs);
  const [activeTabId, setActiveTabIdState] = useState<string>(
    initialActive ?? defaultTabs[0]?.id ?? "",
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [mountedTabIds, setMountedTabIds] = useState<Set<string>>(
    () => new Set(defaultTabs.map((t) => t.id)),
  );

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const activeTabIdRef = useRef(activeTabId);
  activeTabIdRef.current = activeTabId;
  const persistTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    getItem("layouts", storageKey).then((entry) => {
      const raw = entry?.value as Record<string, unknown> | undefined;
      const storedTabs = raw?.tabs as ViewItem[] | undefined;
      const storedActiveId = raw?.activeTabId as string | undefined;
      if (storedTabs && storedTabs.length > 0) {
        setTabsState(storedTabs);
        setMountedTabIds((prev) => {
          const next = new Set(prev);
          for (const t of storedTabs) next.add(t.id);
          return next;
        });
        const active = storedActiveId ?? storedTabs[0].id ?? "";
        setActiveTabIdState(active);
        writeActiveToLocalStorage(scope, active);
      }
      setIsLoaded(true);
    });
  }, [storageKey, scope]);

  useEffect(() => {
    return () => {
      clearTimeout(persistTimerRef.current);
      setItem("layouts", storageKey, {
        tabs: tabsRef.current,
        activeTabId: activeTabIdRef.current,
      } as Record<string, unknown>);
    };
  }, [storageKey]);

  const persistDebounced = useCallback(
    (nextTabs: ViewItem[], nextActiveId: string) => {
      clearTimeout(persistTimerRef.current);
      persistTimerRef.current = setTimeout(async () => {
        await setItem("layouts", storageKey, {
          tabs: nextTabs,
          activeTabId: nextActiveId,
        } as Record<string, unknown>);
      }, 300);
    },
    [storageKey],
  );

  const ensureTabMounted = useCallback((id: string) => {
    setMountedTabIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const setActiveTab = useCallback(
    (id: string) => {
      setActiveTabIdState(id);
      writeActiveToLocalStorage(scope, id);
      ensureTabMounted(id);
      persistDebounced(tabsRef.current, id);
    },
    [scope, ensureTabMounted, persistDebounced],
  );

  const addTab = useCallback(
    (type: ViewType, label?: string) => {
      const id = generateId();
      const newTab: ViewItem = { id, type, label };
      setTabsState((current) => {
        const updated = [...current, newTab];
        persistDebounced(updated, id);
        return updated;
      });
      setActiveTabIdState(id);
      setMountedTabIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      writeActiveToLocalStorage(scope, id);
    },
    [scope, persistDebounced],
  );

  const removeTab = useCallback(
    (id: string) => {
      setTabsState((current) => {
        if (current.length <= 1) return current;
        const updated = current.filter((t) => t.id !== id);
        const isRemovingActive = id === activeTabIdRef.current;
        let newActive = activeTabIdRef.current;
        if (isRemovingActive) {
          const idx = current.findIndex((t) => t.id === id);
          newActive =
            updated[Math.min(idx, updated.length - 1)]?.id ?? updated[0]?.id ?? "";
          setActiveTabIdState(newActive);
          writeActiveToLocalStorage(scope, newActive);
        }
        persistDebounced(updated, newActive);
        return updated;
      });
    },
    [scope, persistDebounced],
  );

  const reorderTabs = useCallback(
    (reordered: ViewItem[]) => {
      setTabsState(reordered);
      persistDebounced(reordered, activeTabIdRef.current);
    },
    [persistDebounced],
  );

  const renameTab = useCallback(
    (id: string, label: string) => {
      setTabsState((current) => {
        const updated = current.map((t) => (t.id === id ? { ...t, label } : t));
        persistDebounced(updated, activeTabIdRef.current);
        return updated;
      });
    },
    [persistDebounced],
  );

  return {
    tabs,
    activeTabId,
    mountedTabIds,
    setActiveTab,
    addTab,
    removeTab,
    reorderTabs,
    renameTab,
    isLoaded,
  };
}

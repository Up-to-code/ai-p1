"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { getItem, setItem } from "@/domains/storage";

interface DashboardConfig {
  widgetConfig: string;
  layout: string;
  notes?: string;
}

interface UseDashboardPersistenceReturn {
  config: DashboardConfig | null;
  isLoaded: boolean;
  saveWidgetConfig: (config: string) => void;
  saveLayout: (layout: string) => void;
  saveNotes: (notes: string) => void;
  save: (partial: Partial<DashboardConfig>) => void;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  syncStatus: "idle" | "syncing" | "synced" | "error";
}

const DEBOUNCE_MS = 5000;

export function useDashboardPersistence(
  projectId: string,
  organizationId: string | undefined,
  syncToServer?: (config: DashboardConfig) => Promise<void>,
): UseDashboardPersistenceReturn {
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<DashboardConfig | null>(null);

  // Load from IndexedDB on mount
  useEffect(() => {
    getItem("layouts", `project-dashboard-${projectId}`).then((entry) => {
      if (entry) {
        try {
          setConfig(entry.value as unknown as DashboardConfig);
        } catch {
          setConfig({ widgetConfig: "[]", layout: "[]" });
        }
      } else {
        setConfig({ widgetConfig: "[]", layout: "[]" });
      }
      setIsLoaded(true);
    });
  }, [projectId]);

  // Debounced sync to server
  const triggerSync = useCallback(
    (data: DashboardConfig) => {
      if (!syncToServer || !organizationId) return;

      if (timerRef.current) clearTimeout(timerRef.current);

      pendingRef.current = data;
      setSyncStatus("idle");

      timerRef.current = setTimeout(async () => {
        const toSync = pendingRef.current;
        if (!toSync) return;

        setSyncStatus("syncing");
        try {
          await syncToServer(toSync);
          setLastSyncedAt(Date.now());
          setSyncStatus("synced");
        } catch {
          setSyncStatus("error");
        }
      }, DEBOUNCE_MS);
    },
    [organizationId, syncToServer],
  );

  const save = useCallback(
    (partial: Partial<DashboardConfig>) => {
      setConfig((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...partial };
        // Write to IndexedDB immediately
        setItem("layouts", `project-dashboard-${projectId}`, next as unknown as Record<string, unknown>);
        // Debounce server sync
        triggerSync(next);
        return next;
      });
    },
    [projectId, triggerSync],
  );

  const saveWidgetConfig = useCallback(
    (widgetConfig: string) => save({ widgetConfig }),
    [save],
  );

  const saveLayout = useCallback(
    (layout: string) => save({ layout }),
    [save],
  );

  const saveNotes = useCallback(
    (notes: string) => save({ notes }),
    [save],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    config,
    isLoaded,
    saveWidgetConfig,
    saveLayout,
    saveNotes,
    save,
    lastSyncedAt,
    isSyncing: syncStatus === "syncing",
    syncStatus,
  };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { logger } from "@/lib/logger";

export interface DashboardConfig {
  widgetConfig: string;
  layout: string;
  notes?: string;
  updatedAt?: number;
}

type DashboardPatch = {
  widgetConfig?: string;
  layout?: string;
  notes?: string;
};

interface UseDashboardPersistenceReturn {
  config: DashboardConfig | null;
  isLoaded: boolean;
  saveWidgetConfig: (config: string) => void;
  saveLayout: (layout: string) => void;
  saveNotes: (notes: string) => void;
  save: (partial: DashboardPatch) => void;
  lastSyncedAt: number | null;
  isSyncing: boolean;
  syncStatus: "idle" | "syncing" | "synced" | "error";
}

const DEBOUNCE_MS = 500;

export function mergeDashboardPatches(
  current: DashboardPatch,
  next: DashboardPatch,
): DashboardPatch {
  return { ...current, ...next };
}

export function useDashboardPersistence(
  projectId: string,
  organizationId: string | undefined,
): UseDashboardPersistenceReturn {
  const dashboard = useQuery(
    api.projectDashboards.get,
    organizationId && projectId
      ? { organizationId, projectId: projectId as Id<"projects"> }
      : "skip",
  );
  const upsert = useMutation(api.projectDashboards.upsert);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "synced" | "error"
  >("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<DashboardPatch>({});

  const flush = useCallback(async () => {
    const patch = pendingRef.current;
    pendingRef.current = {};
    if (!organizationId || !projectId || Object.keys(patch).length === 0) return;

    setSyncStatus("syncing");
    try {
      await upsert({
        organizationId,
        projectId: projectId as Id<"projects">,
        patch,
      });
      setLastSyncedAt(Date.now());
      setSyncStatus("synced");
    } catch (error) {
      logger.error("project_dashboard.save_failed", {
        organizationId,
        projectId,
        error,
      });
      setSyncStatus("error");
    }
  }, [organizationId, projectId, upsert]);

  const save = useCallback(
    (partial: DashboardPatch) => {
      if (!organizationId || !projectId) return;

      pendingRef.current = mergeDashboardPatches(pendingRef.current, partial);
      if (timerRef.current) clearTimeout(timerRef.current);
      setSyncStatus("idle");
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void flush();
      }, DEBOUNCE_MS);
    },
    [flush, organizationId, projectId],
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return {
    config: dashboard ?? null,
    isLoaded: dashboard !== undefined,
    saveWidgetConfig: (widgetConfig) => save({ widgetConfig }),
    saveLayout: (layout) => save({ layout }),
    saveNotes: (notes) => save({ notes }),
    save,
    lastSyncedAt,
    isSyncing: syncStatus === "syncing",
    syncStatus,
  };
}

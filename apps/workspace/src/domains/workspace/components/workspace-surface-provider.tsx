"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useIndexedDbConfig } from "@/domains/storage";
import { logger } from "@/lib/logger";
import {
  defaultWorkspaceSurface,
  isWorkspaceSurface,
  type WorkspaceSurface,
} from "../workspace-surface";

type WorkspaceSurfaceContextValue = {
  surface: WorkspaceSurface;
  selectSurface: (surface: WorkspaceSurface) => void;
  resetSurface: () => void;
  isRestored: boolean;
};

const WorkspaceSurfaceContext =
  createContext<WorkspaceSurfaceContextValue | null>(null);

export function WorkspaceSurfaceProvider({
  organizationId,
  userId,
  children,
}: {
  organizationId: string;
  userId: string;
  children: ReactNode;
}) {
  const storageKey = `workspace-surface:${organizationId}:${userId}`;
  const handleStorageError = useCallback(
    (error: unknown, operation: "read" | "write" | "reset") => {
      logger.error("workspace.surface_storage_failed", {
        organizationId,
        operation,
        error,
      });
    },
    [organizationId],
  );
  const stored = useIndexedDbConfig<WorkspaceSurface>(
    "layouts",
    storageKey,
    defaultWorkspaceSurface,
    { onError: handleStorageError },
  );
  const surface = isWorkspaceSurface(stored.value)
    ? stored.value
    : defaultWorkspaceSurface;

  const selectSurface = useCallback(
    (next: WorkspaceSurface) => {
      void stored.setValue(next);
    },
    [stored],
  );
  const resetSurface = useCallback(() => {
    void stored.reset();
  }, [stored]);
  const value = useMemo(
    () => ({
      surface,
      selectSurface,
      resetSurface,
      isRestored: stored.isLoaded,
    }),
    [resetSurface, selectSurface, stored.isLoaded, surface],
  );

  return (
    <WorkspaceSurfaceContext.Provider value={value}>
      {children}
    </WorkspaceSurfaceContext.Provider>
  );
}

export function useWorkspaceSurface() {
  const context = useContext(WorkspaceSurfaceContext);
  if (!context) {
    throw new Error(
      "useWorkspaceSurface must be used inside WorkspaceSurfaceProvider",
    );
  }
  return context;
}

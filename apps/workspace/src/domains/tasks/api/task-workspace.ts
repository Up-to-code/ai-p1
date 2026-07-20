"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useTrackedViewMutation, type SavedViewConfig } from "@/domains/views";
import type {
  TaskViewType,
  TaskWorkspaceSurfaceProjection,
} from "../workspace/task-workspace";

export function useTaskWorkspaceSurface(organizationId?: string) {
  const { isAuthenticated } = useConvexAuth();
  const ensureDefaults = useMutation(
    api.taskWorkspace.write.ensureTaskWorkspaceDefaults,
  );
  const backfillStarted = useRef<string | null>(null);
  const data = useQuery(
    api.taskWorkspace.read.getSurfaceProjection,
    organizationId && isAuthenticated ? { organizationId } : "skip",
  ) as TaskWorkspaceSurfaceProjection | null | undefined;
  useEffect(() => {
    if (
      !organizationId ||
      !isAuthenticated ||
      data !== null ||
      backfillStarted.current === organizationId
    ) {
      return;
    }
    backfillStarted.current = organizationId;
    void ensureDefaults({ organizationId });
  }, [data, ensureDefaults, isAuthenticated, organizationId]);
  return {
    data,
    isLoading:
      Boolean(organizationId) &&
      (!isAuthenticated || data === undefined || data === null),
    isMissing: data === null,
  };
}

export function useCreateTaskViewTab() {
  const command = useMutation(api.taskWorkspace.write.createAndAttachView);
  return useTrackedViewMutation(
    (input: {
      organizationId: string;
      surfaceId: Id<"surfaces">;
      viewType: TaskViewType;
      name: string;
      config: SavedViewConfig;
    }) => command({ input }),
  );
}

export function useRenameTaskViewTab() {
  const command = useMutation(api.taskWorkspace.write.renameViewTab);
  return useTrackedViewMutation(
    (input: { organizationId: string; tabId: Id<"surfaceTabs">; name: string }) =>
      command(input),
  );
}

export function useDuplicateTaskViewTab() {
  const command = useMutation(api.taskWorkspace.write.duplicateViewTab);
  return useTrackedViewMutation(
    (input: { organizationId: string; tabId: Id<"surfaceTabs"> }) => command(input),
  );
}

export function useDetachTaskViewTab() {
  const command = useMutation(api.taskWorkspace.write.detachViewTab);
  return useTrackedViewMutation(
    (input: { organizationId: string; tabId: Id<"surfaceTabs"> }) => command(input),
  );
}

export function useReorderTaskViewTabs() {
  const command = useMutation(api.taskWorkspace.write.reorderViewTabs);
  return useTrackedViewMutation(
    (input: {
      organizationId: string;
      surfaceId: Id<"surfaces">;
      orderedTabIds: Id<"surfaceTabs">[];
    }) => command(input),
  );
}

export function useUpdateTaskViewConfig() {
  const command = useMutation(api.taskWorkspace.write.updateViewConfig);
  return useTrackedViewMutation(
    (input: {
      organizationId: string;
      viewId: Id<"savedViews">;
      config: SavedViewConfig;
    }) => command(input),
  );
}

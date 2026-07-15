"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useTrackedViewMutation, type SavedViewConfig } from "@/domains/views";
import type {
  ProjectViewType,
  ProjectWorkspaceSurfaceProjection,
} from "../workspace/project-workspace";

export function useProjectWorkspaceSurface(organizationId?: string) {
  const { isAuthenticated } = useConvexAuth();
  const ensureDefaults = useMutation(
    api.projectWorkspace.write.ensureProjectWorkspaceDefaults,
  );
  const backfillStarted = useRef<string | null>(null);
  const data = useQuery(
    api.projectWorkspace.read.getSurfaceProjection,
    organizationId && isAuthenticated ? { organizationId } : "skip",
  ) as ProjectWorkspaceSurfaceProjection | null | undefined;
  useEffect(() => {
    if (
      !organizationId ||
      !isAuthenticated ||
      data !== null ||
      backfillStarted.current === organizationId
    ) {
      return;
    }
    // One-time compatibility seam for Organizations created before the
    // dedicated Project Workspace surface. The command is transactional and
    // idempotent; the reactive query supplies the authoritative result.
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

export function useCreateProjectViewTab() {
  const command = useMutation(api.projectWorkspace.write.createAndAttachView);
  return useTrackedViewMutation(
    (input: {
      organizationId: string;
      surfaceId: Id<"surfaces">;
      viewType: ProjectViewType;
      name: string;
      config: SavedViewConfig;
    }) => command({ input }),
  );
}

export function useRenameProjectViewTab() {
  const command = useMutation(api.projectWorkspace.write.renameViewTab);
  return useTrackedViewMutation(
    (input: { organizationId: string; tabId: Id<"surfaceTabs">; name: string }) =>
      command(input),
  );
}

export function useDuplicateProjectViewTab() {
  const command = useMutation(api.projectWorkspace.write.duplicateViewTab);
  return useTrackedViewMutation(
    (input: { organizationId: string; tabId: Id<"surfaceTabs"> }) => command(input),
  );
}

export function useDetachProjectViewTab() {
  const command = useMutation(api.projectWorkspace.write.detachViewTab);
  return useTrackedViewMutation(
    (input: { organizationId: string; tabId: Id<"surfaceTabs"> }) => command(input),
  );
}

export function useReorderProjectViewTabs() {
  const command = useMutation(api.projectWorkspace.write.reorderViewTabs);
  return useTrackedViewMutation(
    (input: {
      organizationId: string;
      surfaceId: Id<"surfaces">;
      orderedTabIds: Id<"surfaceTabs">[];
    }) => command(input),
  );
}

export function useUpdateProjectViewConfig() {
  const command = useMutation(api.projectWorkspace.write.updateViewConfig);
  return useTrackedViewMutation(
    (input: {
      organizationId: string;
      viewId: Id<"savedViews">;
      config: SavedViewConfig;
    }) => command(input),
  );
}

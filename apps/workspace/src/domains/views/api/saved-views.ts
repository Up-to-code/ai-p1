"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export type SavedViewResourceType =
  | "client"
  | "deal"
  | "doc"
  | "media"
  | "opportunity"
  | "project"
  | "task"
  | "calendarEvent"
  | "space";

export type SavedViewType =
  | "table"
  | "board"
  | "list"
  | "calendar"
  | "timeline"
  | "dashboard"
  | "fileManager";

export type SavedViewFilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | null;

export type SavedViewDashboardWidget = {
  id: string;
  widgetType: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ProjectSavedViewSettings = {
  visibleFields?: string[];
  calendarScale?: "week" | "month";
  calendarColorBy?: "space" | "status" | "health";
  timelineScale?: "day" | "week" | "month" | "quarter";
  showUnscheduled?: boolean;
  dashboardWidgets?: SavedViewDashboardWidget[];
};

export interface SavedViewConfig {
  groupBy?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  density?: "compact" | "normal";
  showFields?: boolean;
  filters?: Array<{
    id?: string;
    field: string;
    operator: string;
    value?: SavedViewFilterValue;
  }>;
  columns?: Array<{
    id: string;
    label?: string;
    width?: number;
    visible?: boolean;
    sortable?: boolean;
    filterable?: boolean;
  }>;
  columnWidths?: Record<string, number>;
  columnVisibility?: Record<string, boolean>;
  columnOrder?: string[];
  project?: ProjectSavedViewSettings;
}

export type SavedViewScope = "project" | "space" | "workspace" | "global";

export interface SavedViewRecord {
  _id: Id<"savedViews">;
  _creationTime: number;
  userId: string;
  name: string;
  description?: string;
  resourceType: SavedViewResourceType;
  viewType: SavedViewType;
  scope: SavedViewScope;
  scopeKey?: string;
  organizationId?: string;
  projectId?: string;
  spaceId?: string;
  config: SavedViewConfig;
  isDefault?: boolean;
  sharingMode: "personal" | "shared" | "protected";
  revision: number;
  canConfigure: boolean;
  canShare: boolean;
  canDelete: boolean;
  canSetDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ListSavedViewsArgs {
  resourceType?: SavedViewResourceType;
  viewType?: SavedViewType;
  organizationId?: string;
  projectId?: string;
  spaceId?: string;
}

export function useSavedViewsQuery(args: ListSavedViewsArgs) {
  const data = useQuery(api.savedViews.read.list, args) as
    | SavedViewRecord[]
    | undefined;
  return { data, isLoading: data === undefined };
}

export function useDefaultSavedViewQuery(args: {
  resourceType: SavedViewResourceType;
  viewType: SavedViewType;
  organizationId?: string;
  projectId?: string;
  spaceId?: string;
}) {
  const data = useQuery(api.savedViews.read.getDefault, args) as
    | SavedViewRecord
    | null
    | undefined;
  return { data, isLoading: data === undefined };
}

export function useTrackedViewMutation<TInput, TResult>(
  execute: (input: TInput) => Promise<TResult>,
) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = useCallback(
    async (input: TInput) => {
      setIsPending(true);
      try {
        return await execute(input);
      } finally {
        setIsPending(false);
      }
    },
    [execute],
  );
  const mutate = useCallback(
    (input: TInput) => {
      void mutateAsync(input).catch(() => undefined);
    },
    [mutateAsync],
  );
  return { mutate, mutateAsync, isPending };
}

export interface CreateSavedViewInput {
  name: string;
  description?: string;
  resourceType: SavedViewResourceType;
  viewType: SavedViewType;
  scope: SavedViewScope;
  scopeKey?: string;
  organizationId?: string;
  projectId?: string;
  spaceId?: string;
  config: SavedViewConfig;
  isDefault?: boolean;
  sharingMode?: SavedViewRecord["sharingMode"];
}

export function useCreateSavedViewMutation() {
  const mutation = useMutation(api.savedViews.write.create);
  return useTrackedViewMutation(async (input: CreateSavedViewInput) =>
    mutation({ input }) as Promise<SavedViewRecord>,
  );
}

export interface UpdateSavedViewInput {
  viewId: Id<"savedViews">;
  name?: string;
  description?: string;
  config?: SavedViewConfig;
  isDefault?: boolean;
}

export interface SavedViewGrant {
  principalType: "user" | "team";
  principalId: string;
  access: "read" | "configure";
}

export function useSavedViewGrantsQuery(viewId?: Id<"savedViews">) {
  const data = useQuery(
    api.savedViews.read.listGrants,
    viewId ? { viewId } : "skip",
  );
  return {
    data: data as SavedViewGrant[] | undefined,
    isLoading: Boolean(viewId) && data === undefined,
  };
}

export function useUpdateSavedViewMutation() {
  const mutation = useMutation(api.savedViews.write.update);
  return useTrackedViewMutation(async (input: UpdateSavedViewInput) =>
    mutation({ input }) as Promise<SavedViewRecord>,
  );
}

export function useDeleteSavedViewMutation() {
  const mutation = useMutation(api.savedViews.write.remove);
  return useTrackedViewMutation((viewId: Id<"savedViews">) =>
    mutation({ viewId }),
  );
}

export function useSetDefaultSavedViewMutation() {
  const mutation = useMutation(api.savedViews.write.setDefault);
  return useTrackedViewMutation((viewId: Id<"savedViews">) =>
    mutation({ viewId }),
  );
}

export function useShareSavedViewMutation() {
  const mutation = useMutation(api.savedViews.write.share);
  return useTrackedViewMutation(
    (input: {
      viewId: Id<"savedViews">;
      sharingMode: "shared" | "protected";
      grants: SavedViewGrant[];
    }) => mutation(input) as Promise<SavedViewRecord>,
  );
}

export function useMakeSavedViewPersonalMutation() {
  const mutation = useMutation(api.savedViews.write.makePersonal);
  return useTrackedViewMutation((viewId: Id<"savedViews">) =>
    mutation({ viewId }) as Promise<SavedViewRecord>,
  );
}

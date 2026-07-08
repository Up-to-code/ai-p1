"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useConvex } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

export type SavedViewResourceType =
  | "client"
  | "deal"
  | "doc"
  | "media"
  | "opportunity"
  | "project"
  | "task"
  | "calendarEvent"
  | "space"

export type SavedViewType =
  | "table"
  | "board"
  | "list"
  | "calendar"
  | "timeline"
  | "dashboard"
  | "fileManager"

export type SavedViewFilterValue = string | number | boolean | string[] | number[] | boolean[] | null

export interface SavedViewConfig {
  groupBy?: string
  sortBy?: string
  sortDirection?: "asc" | "desc"
  taskTableVersion?: number
  search?: string
  density?: "compact" | "normal"
  showFields?: boolean
  filters?: Array<{ id?: string; field: string; operator: string; value?: SavedViewFilterValue }>
  columnWidths?: Record<string, number>
  columnVisibility?: Record<string, boolean>
  columnOrder?: string[]
}

export type SavedViewScope = "project" | "space" | "workspace" | "global"

export interface SavedViewRecord {
  _id: Id<"savedViews">
  _creationTime: number
  userId: string
  name: string
  description?: string
  resourceType: SavedViewResourceType
  viewType: SavedViewType
  scope: SavedViewScope
  scopeKey?: string
  organizationId?: string
  projectId?: string
  spaceId?: string
  config: SavedViewConfig
  isDefault?: boolean
  createdAt: number
  updatedAt: number
}

export interface ListSavedViewsArgs {
  resourceType?: SavedViewResourceType
  viewType?: SavedViewType
  organizationId?: string
  projectId?: string
  spaceId?: string
}

function listKey(args: ListSavedViewsArgs) {
  return [
    "saved-table-views",
    args.resourceType ?? null,
    args.viewType ?? null,
    args.organizationId ?? null,
    args.projectId ?? null,
    args.spaceId ?? null,
  ] as const
}

export function useSavedViewsQuery(args: ListSavedViewsArgs) {
  const convex = useConvex()
  return useQuery({
    queryKey: listKey(args),
    queryFn: async (): Promise<SavedViewRecord[]> => {
      return (await convex.query(api.savedViews.read.list, {
        resourceType: args.resourceType,
        viewType: args.viewType,
        organizationId: args.organizationId,
        projectId: args.projectId,
        spaceId: args.spaceId,
      })) as SavedViewRecord[]
    },
    enabled: Boolean(args.resourceType && args.viewType),
  })
}

export function useDefaultSavedViewQuery(args: {
  resourceType: SavedViewResourceType
  viewType: SavedViewType
  organizationId?: string
  projectId?: string
  spaceId?: string
}) {
  const convex = useConvex()
  return useQuery({
    queryKey: ["saved-table-views-default", args],
    queryFn: async (): Promise<SavedViewRecord | null> => {
      return (await convex.query(api.savedViews.read.getDefault, args)) as SavedViewRecord | null
    },
    enabled: Boolean(args.resourceType && args.viewType),
  })
}

export interface CreateSavedViewInput {
  name: string
  description?: string
  resourceType: SavedViewResourceType
  viewType: SavedViewType
  scope: SavedViewScope
  scopeKey?: string
  organizationId?: string
  projectId?: string
  spaceId?: string
  config: SavedViewConfig
  isDefault?: boolean
}

export function useCreateSavedViewMutation() {
  const convex = useConvex()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateSavedViewInput): Promise<SavedViewRecord> => {
      return (await convex.mutation(api.savedViews.write.create, { input })) as SavedViewRecord
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["saved-table-views"] })
    },
  })
}

export interface UpdateSavedViewInput {
  viewId: Id<"savedViews">
  name?: string
  description?: string
  config?: SavedViewConfig
  isDefault?: boolean
}

export function useUpdateSavedViewMutation() {
  const convex = useConvex()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateSavedViewInput): Promise<SavedViewRecord> => {
      return (await convex.mutation(api.savedViews.write.update, { input })) as SavedViewRecord
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["saved-table-views"] })
    },
  })
}

export function useDeleteSavedViewMutation() {
  const convex = useConvex()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (viewId: Id<"savedViews">) => {
      await convex.mutation(api.savedViews.write.remove, { viewId })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["saved-table-views"] })
    },
  })
}

export function useSetDefaultSavedViewMutation() {
  const convex = useConvex()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (viewId: Id<"savedViews">) => {
      await convex.mutation(api.savedViews.write.setDefault, { viewId })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["saved-table-views"] })
    },
  })
}

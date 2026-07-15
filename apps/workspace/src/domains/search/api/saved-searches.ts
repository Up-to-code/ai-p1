"use client"

import { useMutation, useQuery } from "convex/react"
import type { SearchFilterConfiguration, SearchResourceType } from "@qentrah/domain-contracts"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

export type SavedSearch = Readonly<{
  _id: Id<"searchSavedQueries">
  name: string
  query: SearchFilterConfiguration
  revision: number
  createdAt: number
  updatedAt: number
}>

export type RecentSearch = Readonly<{
  _id: Id<"searchRecentQueries">
  query: SearchFilterConfiguration
  useCount: number
  updatedAt: number
}>

export function useSavedSearches(organizationId?: string) {
  return useQuery(api.search.savedQueries.listSaved, organizationId ? { organizationId } : "skip")
}

export function useRecentSearches(organizationId?: string) {
  return useQuery(api.search.savedQueries.listRecent, organizationId ? { organizationId } : "skip")
}

export function useSavedSearchCommands() {
  const save = useMutation(api.search.savedQueries.save)
  const remove = useMutation(api.search.savedQueries.remove)
  const recordRecent = useMutation(api.search.savedQueries.recordRecent)
  const recordResultOpened = useMutation(api.search.savedQueries.recordResultOpened)
  return {
    save: (input: { organizationId: string; name: string; query: SearchFilterConfiguration }) => save(input),
    remove: (savedQueryId: Id<"searchSavedQueries">) => remove({ savedQueryId }),
    recordRecent: (input: { organizationId: string; query: SearchFilterConfiguration; resultCount: number }) => recordRecent(input),
    recordResultOpened: (input: { organizationId: string; queryLength: number; resourceType: SearchResourceType; filterCount: number }) => recordResultOpened(input),
  }
}

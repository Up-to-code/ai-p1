"use client";

import { useMemo } from "react";
import {
  useDebouncedValue,
  useHttpIndexedPagedQuery,
  useHttpPagedQuery,
  useHttpQuery,
  useHttpQueryResult,
} from "@/components/shared/use-http-query";
import type { WorkspaceResourceFilters } from "./types";
import { organizationReadPath } from "./routing";

function useDebouncedResourceFilters<T extends WorkspaceResourceFilters>(filters: T | undefined) {
  const search = typeof filters?.search === "string" ? filters.search.trim() : undefined;
  const debouncedSearch = useDebouncedValue(search, 250);
  return useMemo(() => ({ ...filters, search: debouncedSearch }) as unknown as T, [debouncedSearch, filters]);
}

export function useWorkspacePagedResource<T>(
  queryKey: readonly unknown[],
  organizationId: string | undefined,
  readPath: string,
  filters: WorkspaceResourceFilters | undefined,
  pageSize: number,
) {
  const params = useDebouncedResourceFilters(filters);
  return useHttpPagedQuery<T>(
    queryKey,
    organizationId ? organizationReadPath(organizationId, readPath) : undefined,
    params,
    pageSize,
  );
}

export function useWorkspaceIndexedResource<T, TStats>(
  queryKey: readonly unknown[],
  organizationId: string | undefined,
  indexPath: string,
  listPath: string,
  filters: WorkspaceResourceFilters | undefined,
  pageSize: number,
) {
  const params = useDebouncedResourceFilters(filters);
  return useHttpIndexedPagedQuery<T, TStats>(
    queryKey,
    organizationId ? organizationReadPath(organizationId, indexPath) : undefined,
    organizationId ? organizationReadPath(organizationId, listPath) : undefined,
    params,
    pageSize,
  );
}

export function useWorkspaceResource<T>(
  queryKey: readonly unknown[],
  organizationId: string | undefined,
  readPath: string,
  params?: WorkspaceResourceFilters,
) {
  return useHttpQuery<T>(
    queryKey,
    organizationId ? organizationReadPath(organizationId, readPath) : undefined,
    params,
  );
}

export function useWorkspaceResourceResult<T>(
  queryKey: readonly unknown[],
  organizationId: string | undefined,
  readPath: string,
  params?: WorkspaceResourceFilters,
) {
  return useHttpQueryResult<T>(
    queryKey,
    organizationId ? organizationReadPath(organizationId, readPath) : undefined,
    params,
  );
}

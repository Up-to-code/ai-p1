"use client";

import { useMemo } from "react";
import {
  useDebouncedValue,
  useHttpIndexedPagedQuery,
  useHttpPagedQuery,
  useHttpQuery,
  useHttpQueryResult,
  type IndexedInfinitePage,
} from "@/components/shared/use-http-query";

type WorkspaceResourceFilters = Record<string, string | number | boolean | null | undefined>;

function organizationResourcePath(organizationId: string, path: string) {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `/api/v1/organizations/${organizationId}${suffix}`;
}

function organizationReadPath(organizationId: string, path: string) {
  return organizationResourcePath(organizationId, `/read/${path.replace(/^\/+/u, "")}`);
}

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

async function workspaceJsonOrThrow(response: Response, fallbackMessage: string) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? fallbackMessage);
  }
  return payload;
}

export async function workspaceMutation<T>(
  organizationId: string,
  path: string,
  options: { method: "POST" | "PATCH" | "DELETE"; body?: unknown; fallbackMessage: string },
) {
  const response = await fetch(organizationResourcePath(organizationId, path), {
    method: options.method,
    headers: options.body === undefined ? undefined : { "content-type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  return workspaceJsonOrThrow(response, options.fallbackMessage) as Promise<T>;
}

export type { IndexedInfinitePage };

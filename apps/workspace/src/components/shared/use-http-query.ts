"use client";

import { useQuery, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { fetchJson, normalizeErrorMessage, isHttpTimeoutError } from "./fetch-json";
import { makeUrl, debugFor, placeholderForSameOrganization } from "./make-url";
import {
  normalizePagedResponse, normalizeIndexedPagedResponse,
  useHttpPerformanceMarks, usePagedStatus, useLoadMore,
  type PagedResponse, type IndexedPagedResponse, type IndexedInfinitePage,
  type PagedStatus, type HttpQueryStatus,
} from "./http-pagination";
import { useOptionalAccountContext } from "@/domains/auth";

export type { PagedResponse, IndexedPagedResponse, IndexedInfinitePage, PagedStatus, HttpQueryStatus };
export { HttpTimeoutError, HttpRequestError, fetchJson, normalizeErrorMessage, isHttpTimeoutError } from "./fetch-json";
export { useDebouncedValue } from "./use-debounced-value";
export { makeUrl, debugFor, placeholderForSameOrganization } from "./make-url";
export { emptyPagedResponse, normalizePagedResponse, normalizeIndexedPagedResponse } from "./http-pagination";

type HttpData<T> = T extends (...args: never[]) => unknown ? never : T;

type WorkspaceContextSnapshot = {
  organizationId?: string | null;
  workspaceStatus?: string;
  isConvexAuthPending?: boolean;
  isConvexAuthenticated?: boolean;
};

function readWorkspaceContext(): WorkspaceContextSnapshot | undefined {
  const ctx = useOptionalAccountContext();
  if (!ctx) return undefined;
  const ws = ctx.workspace;
  return {
    organizationId: ws.organizationId ?? null,
    workspaceStatus: ws.status,
    isConvexAuthPending: ws.isConvexAuthPending,
    isConvexAuthenticated: ws.isConvexAuthenticated,
  };
}

export function useHttpQueryResult<T>(
  key: readonly unknown[],
  path: string | undefined,
  params?: Record<string, string | number | boolean | undefined | null>,
) {
  const url = path ? makeUrl(path, params) : "";
  const queryKey = [...key, url];

  const query = useQuery<HttpData<T>, Error, HttpData<T>, readonly unknown[]>({
    queryKey,
    queryFn: ({ signal }) => fetchJson<HttpData<T>>(url, { signal }),
    enabled: Boolean(path),
    placeholderData: placeholderForSameOrganization<HttpData<T>>(url) as never,
    retry: 1,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
  useHttpPerformanceMarks(path, url, query.isFetching, Boolean(query.data) || query.isError);

  const queryStatus: HttpQueryStatus = !path
    ? "idle"
    : query.isError
      ? "error"
      : query.isLoading
        ? "loading"
        : "success";

  return {
    data: path ? query.data : undefined,
    queryStatus,
    errorMessage: query.isError ? normalizeErrorMessage(query.error) : undefined,
    isFetching: query.isFetching,
    refetch: query.refetch,
    timedOut: query.isError && isHttpTimeoutError(query.error),
    debug: debugFor(queryKey, url),
  };
}

export function useHttpQuery<T>(
  key: readonly unknown[],
  path: string | undefined,
  params?: Record<string, string | number | boolean | undefined | null>,
) {
  const result = useHttpQueryResult<T>(key, path, params);
  if (result.queryStatus === "error") return null;
  return result.data;
}

export function useHttpPagedQuery<T>(
  key: readonly unknown[],
  path: string | undefined,
  params: Record<string, string | number | boolean | undefined | null> | undefined,
  pageSize: number,
) {
  const url = path ? makeUrl(path, { ...params, limit: pageSize }) : "";
  const queryKey = [...key, url];
  const query = useInfiniteQuery<
    PagedResponse<T>,
    Error,
    InfiniteData<PagedResponse<T>, string | null>,
    readonly unknown[],
    string | null
  >({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      fetchJson<PagedResponse<T>>(
        makeUrl(path!, {
          ...params,
          limit: pageSize,
          cursor: pageParam,
        }),
        { signal },
      ),
    enabled: Boolean(path),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const page = normalizePagedResponse(lastPage);
      return page.isDone ? undefined : page.continueCursor;
    },
    placeholderData: placeholderForSameOrganization<InfiniteData<PagedResponse<T>, string | null>>(url),
    retry: 1,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
  useHttpPerformanceMarks(path, url, query.isFetching, Boolean(query.data) || query.isError);

  const results = path ? query.data?.pages.flatMap((page) => normalizePagedResponse(page).page) ?? [] : [];
  const lastPage = path ? normalizePagedResponse(query.data?.pages.at(-1)) : undefined;
  const queryStatus: HttpQueryStatus = !path
    ? "idle"
    : query.isError
      ? "error"
      : query.isLoading
        ? "loading"
        : "success";
  const status = usePagedStatus(query.isLoading, query.isFetchingNextPage, lastPage?.isDone);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useLoadMore(hasNextPage, isFetchingNextPage, fetchNextPage);

  return {
    results,
    status,
    queryStatus,
    errorMessage: query.isError ? normalizeErrorMessage(query.error) : undefined,
    isFetching: query.isFetching,
    refetch: query.refetch,
    timedOut: query.isError && isHttpTimeoutError(query.error),
    debug: debugFor(queryKey, url),
    loadMore,
  };
}

export function useHttpIndexedPagedQuery<T, TStats>(
  key: readonly unknown[],
  indexPath: string | undefined,
  pagePath: string | undefined,
  params: Record<string, string | number | boolean | undefined | null> | undefined,
  pageSize: number,
) {
  const url = indexPath ? makeUrl(indexPath, { ...params, limit: pageSize }) : "";
  const queryKey = [...key, url];
  const query = useInfiniteQuery<
    IndexedInfinitePage<T, TStats>,
    Error,
    InfiniteData<IndexedInfinitePage<T, TStats>, string | null>,
    readonly unknown[],
    string | null
  >({
    queryKey,
    queryFn: async ({ pageParam, signal }) => {
      if (pageParam === null) {
        const indexed = await fetchJson<IndexedPagedResponse<T, TStats>>(url, { signal });
        return normalizeIndexedPagedResponse(indexed);
      }
      const list = await fetchJson<PagedResponse<T>>(
        makeUrl(pagePath!, {
          ...params,
          limit: pageSize,
          cursor: pageParam,
        }),
        { signal },
      );
      return { list: normalizePagedResponse(list) } satisfies IndexedInfinitePage<T, TStats>;
    },
    enabled: Boolean(indexPath && pagePath),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      const page = normalizePagedResponse(lastPage?.list);
      return page.isDone ? undefined : page.continueCursor;
    },
    placeholderData: placeholderForSameOrganization<InfiniteData<IndexedInfinitePage<T, TStats>, string | null>>(url),
    retry: 1,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
  useHttpPerformanceMarks(indexPath, url, query.isFetching, Boolean(query.data) || query.isError);

  const isEnabled = Boolean(indexPath && pagePath);
  const results = isEnabled ? query.data?.pages.flatMap((page) => normalizePagedResponse(page?.list).page) ?? [] : [];
  const lastPage = isEnabled ? normalizePagedResponse(query.data?.pages.at(-1)?.list) : undefined;
  const stats = isEnabled ? query.data?.pages[0]?.stats : undefined;
  const queryStatus: HttpQueryStatus = !isEnabled
    ? "idle"
    : query.isError
      ? "error"
      : query.isLoading
        ? "loading"
        : "success";
  const status = usePagedStatus(query.isLoading, query.isFetchingNextPage, lastPage?.isDone);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useLoadMore(hasNextPage, isFetchingNextPage, fetchNextPage);

  return {
    results,
    stats,
    status,
    queryStatus,
    queryKey,
    errorMessage: query.isError ? normalizeErrorMessage(query.error) : undefined,
    isFetching: query.isFetching,
    refetch: query.refetch,
    timedOut: query.isError && isHttpTimeoutError(query.error),
    debug: debugFor(queryKey, url, readWorkspaceContext()),
    loadMore,
  };
}

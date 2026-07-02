"use client";

import { useInfiniteQuery, useQuery, type InfiniteData, type PlaceholderDataFunction } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { markAppPerformance } from "@/lib/utils/performance";
import type { QueryDebugMetadata } from "./query-debug";
import { HttpTimeoutError, isHttpTimeoutError, normalizeErrorMessage } from "./errors";
import { makeUrl } from "./url";
import { useOptionalAccountContext } from "@/domains/auth";

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

export type PagedResponse<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
};

export type IndexedPagedResponse<T, TStats> = {
  list: PagedResponse<T>;
  stats: TStats;
};

export type IndexedInfinitePage<T, TStats> = {
  list: PagedResponse<T>;
  stats?: TStats;
};

type PagedStatus = "LoadingFirstPage" | "LoadingMore" | "CanLoadMore" | "Exhausted";
type HttpData<T> = T extends (...args: never[]) => unknown ? never : T;
type HttpQueryStatus = "idle" | "loading" | "success" | "error";
const HTTP_QUERY_TIMEOUT_MS = 10_000;

function emptyPagedResponse<T>(): PagedResponse<T> {
  return { page: [], isDone: true, continueCursor: "" };
}

export function normalizePagedResponse<T>(response: PagedResponse<T> | null | undefined): PagedResponse<T> {
  if (!response || !Array.isArray(response.page) || typeof response.isDone !== "boolean") {
    return emptyPagedResponse<T>();
  }
  return {
    page: response.page,
    isDone: response.isDone,
    continueCursor: typeof response.continueCursor === "string" ? response.continueCursor : "",
  };
}

export function normalizeIndexedPagedResponse<T, TStats>(
  response: IndexedPagedResponse<T, TStats> | null | undefined,
): IndexedInfinitePage<T, TStats> {
  return {
    list: normalizePagedResponse(response?.list),
    stats: response?.stats,
  };
}

export async function fetchJson<T>(
  url: string,
  options?: { timeoutMs?: number; fetcher?: typeof fetch; signal?: AbortSignal },
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? HTTP_QUERY_TIMEOUT_MS;
  const fetcher = options?.fetcher ?? fetch;
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort(options?.signal?.reason);
  if (options?.signal?.aborted) abortFromCaller();
  else options?.signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let response: Response;
  try {
    response = await fetcher(url, { signal: controller.signal });
  } catch (error) {
    if (timedOut) throw new HttpTimeoutError(`Request timed out after ${timeoutMs}ms.`);
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    options?.signal?.removeEventListener("abort", abortFromCaller);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new HttpTimeoutError(payload.error ?? "Request failed.");
  }

  return payload as T;
}

export function useDebouncedValue<T>(value: T, delayMs = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);

  return debounced;
}

function debugFor(
  key: readonly unknown[],
  url: string,
  workspaceContext?: { organizationId?: string | null; workspaceStatus?: string; isConvexAuthPending?: boolean; isConvexAuthenticated?: boolean },
): QueryDebugMetadata {
  const ORG_ID_PATTERN = /^org_[A-Za-z0-9]+$/;
  let fromKey: string | null = null;
  for (const segment of key) {
    if (typeof segment === "string" && ORG_ID_PATTERN.test(segment)) {
      fromKey = segment;
      break;
    }
  }
  if (!fromKey && typeof key.at(-1) === "string") {
    const fromUrl = /\/organizations\/(org_[A-Za-z0-9]+)\//.exec(key.at(-1) as string);
    if (fromUrl) fromKey = fromUrl[1];
  }
  return {
    resourceType: "http",
    resourceId: url,
    path: url.split("?")[0] || "missing",
    queryKey: JSON.stringify(key),
    organizationId: workspaceContext?.organizationId ?? fromKey,
    workspaceStatus: workspaceContext?.workspaceStatus,
    isConvexAuthPending: workspaceContext?.isConvexAuthPending,
    isConvexAuthenticated: workspaceContext?.isConvexAuthenticated,
  };
}

export function placeholderForSameOrganization<TData>(url: string) {
  return ((previousData, previousQuery) => {
    const previousUrl = previousQuery?.queryKey?.at(-1);
    if (typeof previousUrl !== "string") return undefined;
    return previousUrl === url ? previousData : undefined;
  }) satisfies PlaceholderDataFunction<TData, Error, TData, readonly unknown[]>;
}

function useHttpPerformanceMarks(path: string | undefined, url: string, isFetching: boolean, isSettled: boolean) {
  useEffect(() => {
    if (!path || !url) return;
    if (isFetching) {
      markAppPerformance("http:first-page:start", { url });
    } else if (isSettled) {
      markAppPerformance("http:first-page:end", { url });
    }
  }, [isFetching, isSettled, path, url]);
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

  const workspace = readWorkspaceContext();

  return {
    data: path ? query.data : undefined,
    queryStatus,
    errorMessage: query.isError ? normalizeErrorMessage(query.error) : undefined,
    isFetching: query.isFetching,
    refetch: query.refetch,
    timedOut: query.isError && isHttpTimeoutError(query.error),
    debug: debugFor(queryKey, url, workspace),
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
  const status: PagedStatus =
    query.isLoading
      ? "LoadingFirstPage"
      : query.isFetchingNextPage
        ? "LoadingMore"
        : lastPage?.isDone === false
          ? "CanLoadMore"
          : "Exhausted";

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback((numItems: number) => {
    void numItems;
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    results,
    status,
    queryStatus,
    errorMessage: query.isError ? normalizeErrorMessage(query.error) : undefined,
    isFetching: query.isFetching,
    refetch: query.refetch,
    timedOut: query.isError && isHttpTimeoutError(query.error),
    debug: debugFor(queryKey, url, readWorkspaceContext()),
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
  const status: PagedStatus =
    query.isLoading
      ? "LoadingFirstPage"
      : query.isFetchingNextPage
        ? "LoadingMore"
        : lastPage?.isDone === false
          ? "CanLoadMore"
          : "Exhausted";

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback((numItems: number) => {
    void numItems;
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

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

"use client";

import { useInfiniteQuery, useQuery, type InfiniteData, type PlaceholderDataFunction } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { markAppPerformance } from "@/lib/utils/performance";
import type { QueryDebugMetadata } from "./query-debug";

export type PagedResponse<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
};

export type IndexedPagedResponse<T, TStats> = {
  list: PagedResponse<T>;
  stats: TStats;
};

type PagedStatus = "LoadingFirstPage" | "LoadingMore" | "CanLoadMore" | "Exhausted";
type HttpData<T> = T extends (...args: never[]) => unknown ? never : T;
export type HttpQueryStatus = "idle" | "loading" | "success" | "error";
export const HTTP_QUERY_TIMEOUT_MS = 10_000;

export class HttpTimeoutError extends Error {
  constructor(message = "Request timed out.") {
    super(message);
    this.name = "HttpTimeoutError";
  }
}

export class HttpRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpRequestError";
    this.status = status;
  }
}

export function isHttpTimeoutError(error: unknown) {
  return error instanceof HttpTimeoutError || (error instanceof Error && error.name === "HttpTimeoutError");
}

function normalizeErrorMessage(error: unknown) {
  if (isHttpTimeoutError(error)) {
    return "The request took too long. Check the connection and try again.";
  }
  return error instanceof Error ? error.message : "Request failed.";
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
    throw new HttpRequestError(payload.error ?? "Request failed.", response.status);
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

export function makeUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).sort(([left], [right]) => left.localeCompare(right)).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

function debugFor(key: readonly unknown[], url: string): QueryDebugMetadata {
  return {
    resourceType: "http",
    resourceId: url,
    path: url.split("?")[0] || "missing",
    queryKey: JSON.stringify(key),
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

export type IndexedInfinitePage<T, TStats> = {
  list: PagedResponse<T>;
  stats?: TStats;
};

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
    getNextPageParam: (lastPage) => lastPage.isDone ? undefined : lastPage.continueCursor,
    placeholderData: placeholderForSameOrganization<InfiniteData<PagedResponse<T>, string | null>>(url),
    retry: 1,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
  useHttpPerformanceMarks(path, url, query.isFetching, Boolean(query.data) || query.isError);

  const results = path ? query.data?.pages.flatMap((page) => page.page) ?? [] : [];
  const lastPage = path ? query.data?.pages.at(-1) : undefined;
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
        return { list: indexed.list, stats: indexed.stats } satisfies IndexedInfinitePage<T, TStats>;
      }
      const list = await fetchJson<PagedResponse<T>>(
        makeUrl(pagePath!, {
          ...params,
          limit: pageSize,
          cursor: pageParam,
        }),
        { signal },
      );
      return { list } satisfies IndexedInfinitePage<T, TStats>;
    },
    enabled: Boolean(indexPath && pagePath),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.list.isDone ? undefined : lastPage.list.continueCursor,
    placeholderData: placeholderForSameOrganization<InfiniteData<IndexedInfinitePage<T, TStats>, string | null>>(url),
    retry: 1,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
  useHttpPerformanceMarks(indexPath, url, query.isFetching, Boolean(query.data) || query.isError);

  const isEnabled = Boolean(indexPath && pagePath);
  const results = isEnabled ? query.data?.pages.flatMap((page) => page.list.page) ?? [] : [];
  const lastPage = isEnabled ? query.data?.pages.at(-1)?.list : undefined;
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
    debug: debugFor(queryKey, url),
    loadMore,
  };
}

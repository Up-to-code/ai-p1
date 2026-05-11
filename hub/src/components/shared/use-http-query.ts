"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

type PagedResponse<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
};

type PagedStatus = "LoadingFirstPage" | "LoadingMore" | "CanLoadMore" | "Exhausted";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload as T;
}

function makeUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function useHttpQuery<T>(
  key: readonly unknown[],
  path: string | undefined,
  params?: Record<string, string | number | boolean | undefined | null>,
) {
  const url = path ? makeUrl(path, params) : "";

  const query = useQuery({
    queryKey: [...key, url],
    queryFn: () => fetchJson<T>(url),
    enabled: Boolean(path),
    retry: 1,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  if (query.isError) return null;
  return query.data;
}

export function useHttpPagedQuery<T>(
  key: readonly unknown[],
  path: string | undefined,
  params: Record<string, string | number | boolean | undefined | null> | undefined,
  pageSize: number,
) {
  const query = useInfiniteQuery({
    queryKey: [...key, path, params],
    queryFn: ({ pageParam }) =>
      fetchJson<PagedResponse<T>>(
        makeUrl(path!, {
          ...params,
          limit: pageSize,
          cursor: pageParam,
        }),
      ),
    enabled: Boolean(path),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.isDone ? undefined : lastPage.continueCursor,
    retry: 1,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  const results = query.data?.pages.flatMap((page) => page.page) ?? [];
  const lastPage = query.data?.pages.at(-1);
  const status: PagedStatus =
    query.isLoading
      ? "LoadingFirstPage"
      : query.isFetchingNextPage
        ? "LoadingMore"
        : lastPage?.isDone === false
          ? "CanLoadMore"
          : "Exhausted";

  return {
    results,
    status,
    loadMore: (numItems: number) => {
      void numItems;
      if (query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    },
  };
}

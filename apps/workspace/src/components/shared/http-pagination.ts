import type { InfiniteData, PlaceholderDataFunction } from "@tanstack/react-query";
import { useEffect } from "react";
import { markAppPerformance } from "@/lib/utils/performance";
import type { QueryDebugMetadata } from "./query-debug";
import { useCallback } from "react";

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

export type PagedStatus = "LoadingFirstPage" | "LoadingMore" | "CanLoadMore" | "Exhausted";
export type HttpQueryStatus = "idle" | "loading" | "success" | "error";

export function emptyPagedResponse<T>(): PagedResponse<T> {
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

export function useHttpPerformanceMarks(path: string | undefined, url: string, isFetching: boolean, isSettled: boolean) {
  useEffect(() => {
    if (!path || !url) return;
    if (isFetching) {
      markAppPerformance("http:first-page:start", { url });
    } else if (isSettled) {
      markAppPerformance("http:first-page:end", { url });
    }
  }, [isFetching, isSettled, path, url]);
}

export function usePagedStatus(
  isLoading: boolean,
  isFetchingNextPage: boolean,
  lastPageDone: boolean | undefined,
) {
  const status: PagedStatus =
    isLoading
      ? "LoadingFirstPage"
      : isFetchingNextPage
        ? "LoadingMore"
        : lastPageDone === false
          ? "CanLoadMore"
          : "Exhausted";
  return status;
}

export function useLoadMore(hasNextPage: boolean, isFetchingNextPage: boolean, fetchNextPage: () => void) {
  return useCallback((numItems: number) => {
    void numItems;
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
}

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useUrlListState<TFilter extends string, TView extends string>({
  filter,
  search,
  view,
  setFilter,
  setSearch,
  setView,
  defaultFilter,
  defaultView,
  validFilters,
  validViews,
}: {
  filter: TFilter;
  search: string;
  view: TView;
  setFilter: (filter: TFilter) => void;
  setSearch: (search: string) => void;
  setView: (view: TView) => void;
  defaultFilter: TFilter;
  defaultView: TView;
  validFilters?: readonly TFilter[];
  validViews?: readonly TView[];
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const filterParam = searchParams.get("filter");
    const searchParam = searchParams.get("search");
    const viewParam = searchParams.get("view");

    const nextFilter = filterParam && (!validFilters || validFilters.includes(filterParam as TFilter)) ? filterParam as TFilter : defaultFilter;
    const nextView = viewParam && (!validViews || validViews.includes(viewParam as TView)) ? viewParam as TView : defaultView;
    const nextSearch = searchParam?.trim() ?? "";

    setFilter(nextFilter);
    setSearch(nextSearch);
    setView(nextView);
  }, [defaultFilter, defaultView, searchParams, setFilter, setSearch, setView, validFilters, validViews]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (filter && filter !== defaultFilter) params.set("filter", filter);
    else params.delete("filter");

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (view && view !== defaultView) params.set("view", view);
    else params.delete("view");

    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  }, [defaultFilter, defaultView, filter, search, view]);
}

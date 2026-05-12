"use client";

import { useEffect, useRef } from "react";
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
  const searchParamsKey = searchParams.toString();
  const stateRef = useRef({ filter, search, view });
  const configRef = useRef({
    setFilter,
    setSearch,
    setView,
    defaultFilter,
    defaultView,
    validFilters,
    validViews,
  });
  const hasReadUrlRef = useRef(false);
  const hasSkippedInitialWriteRef = useRef(false);

  useEffect(() => {
    stateRef.current = { filter, search, view };
    configRef.current = {
      setFilter,
      setSearch,
      setView,
      defaultFilter,
      defaultView,
      validFilters,
      validViews,
    };
  }, [defaultFilter, defaultView, filter, search, setFilter, setSearch, setView, validFilters, validViews, view]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    const filterParam = params.get("filter");
    const searchParam = params.get("search");
    const viewParam = params.get("view");
    const {
      setFilter: applyFilter,
      setSearch: applySearch,
      setView: applyView,
      defaultFilter: currentDefaultFilter,
      defaultView: currentDefaultView,
      validFilters: currentValidFilters,
      validViews: currentValidViews,
    } = configRef.current;

    const nextFilter = filterParam && (!currentValidFilters || currentValidFilters.includes(filterParam as TFilter)) ? filterParam as TFilter : currentDefaultFilter;
    const nextView = viewParam && (!currentValidViews || currentValidViews.includes(viewParam as TView)) ? viewParam as TView : currentDefaultView;
    const nextSearch = searchParam?.trim() ?? "";
    const current = stateRef.current;

    if (nextFilter !== current.filter) applyFilter(nextFilter);
    if (nextSearch !== current.search) applySearch(nextSearch);
    if (nextView !== current.view) applyView(nextView);
    hasReadUrlRef.current = true;
  }, [searchParamsKey]);

  useEffect(() => {
    if (!hasReadUrlRef.current) return;
    if (!hasSkippedInitialWriteRef.current) {
      hasSkippedInitialWriteRef.current = true;
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (filter && filter !== defaultFilter) params.set("filter", filter);
    else params.delete("filter");

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (view && view !== defaultView) params.set("view", view);
    else params.delete("view");

    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [defaultFilter, defaultView, filter, search, view]);
}

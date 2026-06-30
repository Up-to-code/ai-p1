"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useLocalConfig } from "@/domains/storage";
import {
  ALL_VIEWS, DEFAULT_VIEW_IDS, VIEW_IDS_STORAGE_KEY,
  type ViewToken,
} from "@/app/[locale]/(app)/ws/config/views.config";
import {
  getActiveViewFromParams, buildPath, resolveActiveTokens,
  removeViewFromIds, addViewToIds, getFallbackViewId,
} from "../workspace-header-helpers";

export function useViewNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeView = getActiveViewFromParams(pathname, searchParams.toString());
  const [activeViewIds, setActiveViewIds] = useLocalConfig<string[]>(VIEW_IDS_STORAGE_KEY, [...DEFAULT_VIEW_IDS]);
  const activeTokens = resolveActiveTokens(activeViewIds, ALL_VIEWS);
  const qs = searchParams.toString();

  const getItemHref = useCallback((id: string) => buildPath(id, qs), [qs]);

  const handleViewSelect = useCallback((id: string) => {
    router.push(buildPath(id, qs));
  }, [router, qs]);

  const handleViewAdd = useCallback((item: ViewToken) => {
    setActiveViewIds(addViewToIds(activeViewIds, item.id));
    router.push(buildPath(item.viewId, qs));
  }, [activeViewIds, setActiveViewIds, router, qs]);

  const handleViewRemove = useCallback((id: string) => {
    const next = removeViewFromIds(activeViewIds, id);
    if (next.length === 0) return;
    setActiveViewIds(next);
    const fallback = getFallbackViewId(activeViewIds, id);
    if (activeView === id && fallback) {
      router.push(buildPath(fallback, qs));
    }
  }, [activeView, activeViewIds, setActiveViewIds, router, qs]);

  const handleItemsReorder = useCallback((newItems: ViewToken[]) => {
    setActiveViewIds(newItems.map((item) => item.id));
  }, [setActiveViewIds]);

  return {
    activeView,
    activeTokens,
    getItemHref,
    handleViewSelect,
    handleViewAdd,
    handleViewRemove,
    handleItemsReorder,
  };
}

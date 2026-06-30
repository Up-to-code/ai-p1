"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { TokenBar } from "@/components/shared";
import { useLocalConfig } from "@/domains/storage";
import {
  ALL_VIEWS, DEFAULT_VIEW_IDS, CATEGORY_LABELS, STATUS_FILTERS, VIEW_IDS_STORAGE_KEY,
  type ViewToken,
} from "@/app/[locale]/(app)/ws/config/views.config";
import {
  getActiveViewFromPath, buildPath, resolveActiveTokens,
  removeViewFromIds, addViewToIds, getFallbackViewId,
} from "./workspace-header-helpers";
import { WorkspaceActionsBar } from "./workspace-actions-bar";

export function WorkspaceHeaderInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeView = getActiveViewFromPath(pathname);
  const [activeViewIds, setActiveViewIds] = useLocalConfig<string[]>(VIEW_IDS_STORAGE_KEY, [...DEFAULT_VIEW_IDS]);
  const activeTokens = resolveActiveTokens(activeViewIds, ALL_VIEWS);
  const qs = searchParams.toString();

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

  return (
    <div className="flex flex-col border-b">
      <div className="px-6 pb-2 pt-2">
        <TokenBar<ViewToken>
          variant="tabs"
          items={activeTokens}
          activeItemId={activeView}
          onItemSelect={handleViewSelect}
          onItemAdd={handleViewAdd}
          onItemRemove={handleViewRemove}
          onItemsReorder={handleItemsReorder}
          availableItems={ALL_VIEWS}
          categoryLabels={CATEGORY_LABELS}
          addLabel="View"
          searchPlaceholder="Search views..."
          emptyMessage="No views found"
          modalTitle="Add view"
          modalExtra={{ showPreview: true, statusFilters: STATUS_FILTERS, showVisibilityFlags: true }}
        />
      </div>
      <WorkspaceActionsBar />
    </div>
  );
}

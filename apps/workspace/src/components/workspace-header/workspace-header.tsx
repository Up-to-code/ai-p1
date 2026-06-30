"use client";

import { TokenBar } from "@/components/shared";
import {
  ALL_VIEWS, CATEGORY_LABELS, STATUS_FILTERS,
  type ViewToken,
} from "@/app/[locale]/(app)/ws/config/views.config";
import { useViewNavigation } from "./hooks/use-view-navigation";
import { WorkspaceActionsBar } from "./workspace-actions-bar";

export function WorkspaceHeaderInner() {
  const {
    activeView, activeTokens,
    getItemHref, handleViewSelect,
    handleViewAdd, handleViewRemove, handleItemsReorder,
  } = useViewNavigation();

  return (
    <div className="flex flex-col border-b">
      <div className="px-6 pb-2 pt-2">
        <TokenBar<ViewToken>
          variant="tabs"
          items={activeTokens}
          activeItemId={activeView}
          getItemHref={getItemHref}
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

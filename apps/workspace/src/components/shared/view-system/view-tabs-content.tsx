"use client";

import type { ReactNode } from "react";
import type { ViewItem } from "./types";

interface ViewTabsContentProps {
  tabs: ViewItem[];
  activeTabId: string;
  mountedTabIds: ReadonlySet<string>;
  renderTab: (tab: ViewItem) => ReactNode;
}

export function ViewTabsContent({
  tabs,
  activeTabId,
  mountedTabIds,
  renderTab,
}: ViewTabsContentProps) {
  return (
    <>
      {tabs.map((tab) =>
        mountedTabIds.has(tab.id) ? (
          <div
            key={tab.id}
            className={tab.id === activeTabId ? "h-full" : "hidden"}
          >
            {renderTab(tab)}
          </div>
        ) : null,
      )}
    </>
  );
}

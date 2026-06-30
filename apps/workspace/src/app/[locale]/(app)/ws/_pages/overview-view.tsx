"use client";

import { useState, useCallback } from "react";
import { WidgetGrid, type ActiveWidget, type WidgetOption } from "@qentrah/our-platform-components/widget-grid";
import { useOrgId, useUserId } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useWidgetLayout, useSaveWidgetLayout } from "@/domains/workspace/api/widget-layouts";
import { useFallbackConfig } from "@/domains/storage";
import { WIDGET_OPTIONS, DEFAULT_WIDGETS, WIDGET_COMPONENT_MAP as widgetComponentMap, WIDGETS_STORAGE_KEY } from "../config/widgets.config";

function renderWidgetContent(type: string, extraProps: { organizationId?: string; spaceSlug?: string | null; projectId?: string | null }) {
  const Component = widgetComponentMap[type];
  if (!Component) return <div className="text-xs text-muted-foreground p-4">Widget not found</div>;
  return <Component {...extraProps} />;
}

export function OverviewView() {
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const { spaceSlug, projectId } = useNavigation();
  const orgId = useOrgId() ?? undefined;
  const userId = useUserId();
  const savedLayout = useWidgetLayout(orgId, userId);
  const saveLayout = useSaveWidgetLayout();

  const [widgets, setWidgets] = useFallbackConfig<ActiveWidget[]>({
    key: "workspace-widgets",
    remote: savedLayout?.widgets,
    save: async (next) => {
      if (orgId && userId) {
        await saveLayout({ organizationId: orgId, userId, widgets: next });
      }
    },
    defaults: DEFAULT_WIDGETS,
  });

  const handleWidgetAdd = useCallback((option: WidgetOption) => {
    const newWidget: ActiveWidget = {
      id: `widget-${Date.now()}`,
      type: option.type,
      title: option.title,
      w: option.defaultWidth,
      h: option.defaultHeight,
    };
    setWidgets((prev: ActiveWidget[]) => [...prev, newWidget]);
    setIsWidgetModalOpen(false);
  }, [setWidgets]);

  const handleWidgetRemove = useCallback((id: string) => {
    setWidgets((prev: ActiveWidget[]) => prev.filter(w => w.id !== id));
  }, [setWidgets]);

  const handleWidgetRename = useCallback((id: string, title: string) => {
    setWidgets((prev: ActiveWidget[]) => prev.map(w => w.id === id ? { ...w, title } : w));
  }, [setWidgets]);

  const handleWidgetResize = useCallback((id: string, dw: number, dh: number) => {
    setWidgets((prev: ActiveWidget[]) => prev.map(w => {
      if (w.id === id) return { ...w, w: Math.max(3, w.w + dw), h: Math.max(2, w.h + dh) };
      return w;
    }));
  }, [setWidgets]);

  const handleWidgetReset = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    if (typeof window !== "undefined") {
      try { localStorage.removeItem(WIDGETS_STORAGE_KEY); } catch { /* ignore */ }
    }
  }, [setWidgets]);

  return (
    <WidgetGrid
      widgets={widgets}
      widgetOptions={WIDGET_OPTIONS}
      onWidgetsChange={setWidgets}
      onWidgetAdd={handleWidgetAdd}
      onWidgetRemove={handleWidgetRemove}
      onWidgetRename={handleWidgetRename}
      onWidgetResize={handleWidgetResize}
      renderWidgetContent={(type) => renderWidgetContent(type, { organizationId: orgId, spaceSlug, projectId })}
      isModalOpen={isWidgetModalOpen}
      onModalClose={() => setIsWidgetModalOpen(false)}
      showResetButton
      onReset={handleWidgetReset}
      className=""
    />
  );
}

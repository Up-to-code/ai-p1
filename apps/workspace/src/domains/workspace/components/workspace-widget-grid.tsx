"use client";

import { useState, useEffect } from "react";
import { WidgetGrid, type ActiveWidget, type WidgetOption } from "@/components/widget-grid/widget-grid";
import { getWorkspaceWidgetComponent, WORKSPACE_WIDGET_OPTIONS, type WorkspaceWidgetOption } from "./workspace-widget-registry";
import { useAccountContext } from "@/domains/auth";
import { useWidgetLayout, useSaveWidgetLayout } from "../api/widget-layouts";

const DEFAULT_WIDGETS: ActiveWidget[] = [
  { id: "metrics", type: "metrics", title: "Metrics", w: 12, h: 2, x: 0, y: 0 },
  { id: "ai-brain", type: "ai-brain", title: "AI Brain", w: 6, h: 6, x: 0, y: 2 },
  { id: "folders", type: "folders", title: "Folders", w: 6, h: 4, x: 6, y: 2 },
  { id: "portfolio", type: "portfolio", title: "Portfolio", w: 12, h: 4, x: 0, y: 8 },
  { id: "calendar", type: "calendar", title: "Calendar Today", w: 6, h: 4, x: 0, y: 12 },
  { id: "docs", type: "docs", title: "Recent Docs", w: 6, h: 4, x: 6, y: 12 },
  { id: "conversations", type: "conversations", title: "Recent Conversations", w: 12, h: 4, x: 0, y: 16 },
];

import { useNavigation } from "@/domains/navigation";

interface WorkspaceWidgetGridProps {
  isWidgetModalOpen?: boolean;
  onWidgetModalClose?: () => void;
}

export function WorkspaceWidgetGrid({ 
  isWidgetModalOpen, 
  onWidgetModalClose 
}: WorkspaceWidgetGridProps) {
  const { spaceSlug, projectId } = useNavigation();
  const [widgets, setWidgets] = useState<ActiveWidget[]>(DEFAULT_WIDGETS);
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready"
      ? (account.workspace.organizationId ?? undefined)
      : undefined;
  const userId = account.workspace.status === "ready" ? account.user.id : undefined;
  
  const savedLayout = useWidgetLayout(organizationId, userId);
  const saveLayout = useSaveWidgetLayout();

  useEffect(() => {
    if (savedLayout && savedLayout.widgets && savedLayout.widgets.length > 0) {
      setWidgets(savedLayout.widgets);
    } else {
      const localSaved = localStorage.getItem("workspace-widgets");
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved) as ActiveWidget[];
          if (parsed.length > 0) {
            setWidgets(parsed);
            if (organizationId && userId) {
              saveLayout({ organizationId, userId, widgets: parsed });
            }
          }
        } catch { /* ignore */ }
      }
    }
  }, [savedLayout, organizationId, userId, saveLayout]);

  const handleWidgetsChange = (updated: ActiveWidget[]) => {
    setWidgets(updated);
    if (organizationId && userId) {
      saveLayout({ organizationId, userId, widgets: updated });
    }
    localStorage.setItem("workspace-widgets", JSON.stringify(updated));
  };

  const handleWidgetAdd = (option: WidgetOption) => {
    const wsOption = option as WorkspaceWidgetOption;
    const newWidget: ActiveWidget = {
      id: `widget-${Date.now()}`,
      type: wsOption.type,
      title: wsOption.title,
      w: wsOption.defaultWidth,
      h: wsOption.defaultHeight,
    };
    handleWidgetsChange([...widgets, newWidget]);
    onWidgetModalClose?.();
  };

  const handleWidgetRemove = (id: string) => {
    handleWidgetsChange(widgets.filter(w => w.id !== id));
  };

  const handleWidgetRename = (id: string, title: string) => {
    handleWidgetsChange(widgets.map(w => w.id === id ? { ...w, title } : w));
  };

  const handleWidgetResize = (id: string, dw: number, dh: number) => {
    handleWidgetsChange(widgets.map(w => {
      if (w.id === id) {
        return { ...w, w: Math.max(3, w.w + dw), h: Math.max(2, w.h + dh) };
      }
      return w;
    }));
  };

  const handleReset = () => {
    handleWidgetsChange(DEFAULT_WIDGETS);
    localStorage.removeItem("workspace-layout");
  };

  const widgetOptions: WidgetOption[] = WORKSPACE_WIDGET_OPTIONS.map(w => ({
    type: w.type,
    title: w.title,
    description: w.description,
    icon: w.icon,
    color: w.color,
    defaultWidth: w.defaultWidth,
    defaultHeight: w.defaultHeight,
    category: w.category,
  }));

  return (
    <WidgetGrid
      widgets={widgets}
      widgetOptions={widgetOptions}
      onWidgetsChange={handleWidgetsChange}
      onWidgetAdd={handleWidgetAdd}
      onWidgetRemove={handleWidgetRemove}
      onWidgetRename={handleWidgetRename}
      onWidgetResize={handleWidgetResize}
      renderWidgetContent={(type) => {
        const WidgetComponent = getWorkspaceWidgetComponent(type as any);
        return <WidgetComponent organizationId={organizationId} spaceSlug={spaceSlug} projectId={projectId} />;
      }}
      isModalOpen={isWidgetModalOpen}
      onModalClose={onWidgetModalClose}
      showResetButton
      onReset={handleReset}
      className=""
    />
  );
}

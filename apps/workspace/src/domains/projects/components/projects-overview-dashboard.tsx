"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "gridstack/dist/gridstack.min.css";
import { GridStack } from "gridstack";
import { PopoverMenu } from "@qentrah/our-platform-components";
import { cn } from "@/lib/utils";
import { GripHorizontal, MoreHorizontal, Plus, Trash2, Pencil } from "lucide-react";
import { ProjectStatsWidget } from "./widgets/project-stats-widget";
import { ProjectStatusWidget } from "./widgets/project-status-widget";
import { ProjectHealthWidget } from "./widgets/project-health-widget";
import { RecentProjectsWidget } from "./widgets/recent-projects-widget";
import { BudgetOverviewWidget } from "./widgets/budget-overview-widget";
import { AddProjectWidgetModal, type ProjectWidgetOption } from "./add-project-widget-modal";
import { getItem, setItem, removeItem } from "@/domains/storage";
import { logger } from "@/lib/logger";

interface ActiveWidget {
  id: string;
  type: string;
  title: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
}

const DEFAULT_WIDGETS: ActiveWidget[] = [
  { id: "stats", type: "stats", title: "Overview", w: 4, h: 4, x: 0, y: 0 },
  { id: "status", type: "status", title: "By Status", w: 4, h: 4, x: 4, y: 0 },
  { id: "health", type: "health", title: "By Health", w: 4, h: 3, x: 8, y: 0 },
  { id: "recent", type: "recent", title: "Recent Projects", w: 6, h: 4, x: 0, y: 4 },
];

function WidgetContent({ type }: { type: string }) {
  switch (type) {
    case "stats": return <ProjectStatsWidget />;
    case "status": return <ProjectStatusWidget />;
    case "health": return <ProjectHealthWidget />;
    case "recent": return <RecentProjectsWidget />;
    case "budget": return <BudgetOverviewWidget />;
    default: return <div className="flex items-center justify-center h-full text-sm text-muted-foreground/60">Coming soon</div>;
  }
}

function WidgetShell({
  widget,
  onRemove,
  onRename,
  children,
}: {
  widget: ActiveWidget;
  onRemove: () => void;
  onRename: (title: string) => void;
  children: React.ReactNode;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(widget.title);

  return (
    <div className="grid-stack-item-content rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col">
      <div className="drag-handle p-3 border-b border-border/40 bg-muted/20 flex items-center justify-between cursor-move group/hdr">
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="h-4 w-4 text-muted-foreground/30 group-hover/hdr:text-muted-foreground transition-colors shrink-0" />
          {isRenaming ? (
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => {
                if (renameValue.trim()) onRename(renameValue.trim());
                setIsRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") { if (renameValue.trim()) onRename(renameValue.trim()); setIsRenaming(false); }
                if (e.key === "Escape") setIsRenaming(false);
              }}
              autoFocus
              className="text-sm font-bold text-foreground bg-transparent border-b border-primary outline-none w-full"
            />
          ) : (
            <span className="text-sm font-bold text-foreground truncate">{widget.title}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <PopoverMenu
            align="right"
            trigger={
              <button
                type="button"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
                aria-label="Widget options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
            items={[
              {
                key: "rename",
                label: "Rename",
                icon: <Pencil className="h-3 w-3" />,
                onClick: () => setIsRenaming(true),
              },
              {
                key: "remove",
                label: "Remove",
                icon: <Trash2 className="h-3 w-3" />,
                destructive: true,
                onClick: () => onRemove(),
              },
            ]}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-background">{children}</div>
    </div>
  );
}

export function ProjectsOverviewDashboard({ 
  isWidgetModalOpen, 
  onWidgetModalClose,
  isAutoLayout,
  onAutoLayoutComplete 
}: { 
  isWidgetModalOpen?: boolean; 
  onWidgetModalClose?: () => void;
  isAutoLayout?: boolean;
  onAutoLayoutComplete?: () => void;
}) {
  const gridRef = useRef<GridStack | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [widgets, setWidgets] = useState<ActiveWidget[]>(DEFAULT_WIDGETS);
  const [containerKey, setContainerKey] = useState(0);

  useEffect(() => {
    getItem("layouts", "projects-overview-widgets").then((entry) => {
      if (entry) {
        try {
          const parsed = entry.value as unknown as ActiveWidget[];
          if (parsed.length > 0) setWidgets(parsed);
        } catch {
          logger.error("projects_dashboard.widgets_parse_failed", { error: entry.value });
        }
      }
    });
  }, []);

  const initGrid = useCallback(() => {
    if (!containerRef.current) return;
    
    // Destroy existing grid
    if (gridRef.current) {
      gridRef.current.destroy(false);
      gridRef.current = null;
    }

    // Initialize new grid
    gridRef.current = GridStack.init({
      margin: 20,
      cellHeight: 80,
      float: true,
      animate: true,
      handle: ".drag-handle",
      resizable: { handles: "se, sw, ne, nw, e, s, w, n" },
    }, containerRef.current);

    gridRef.current.on("change", () => {
      if (gridRef.current) {
        const layout = gridRef.current.save(false);
        setItem("layouts", "projects-overview-layout", layout as unknown as Record<string, unknown>);
      }
    });

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current || widgets.length === 0) return;

    const timer = setTimeout(initGrid, 100);
    return () => clearTimeout(timer);
  }, [widgets, containerKey, initGrid]);

  // Auto layout - destroy and recreate grid with default widgets
  useEffect(() => {
    if (!isAutoLayout) return;

    // Reset to defaults
    setWidgets(DEFAULT_WIDGETS);
    setItem("layouts", "projects-overview-widgets", DEFAULT_WIDGETS as unknown as Record<string, unknown>);
    removeItem("layouts", "projects-overview-layout");

    // Force reinitialization
    setIsReady(false);
    setContainerKey(k => k + 1);

    // Complete after grid reinitializes
    const timer = setTimeout(() => {
      onAutoLayoutComplete?.();
    }, 400);

    return () => clearTimeout(timer);
  }, [isAutoLayout, onAutoLayoutComplete]);

  const handleRemoveWidget = (widgetId: string) => {
    const updated = widgets.filter((w) => w.id !== widgetId);
    setWidgets(updated);
    setItem("layouts", "projects-overview-widgets", updated as unknown as Record<string, unknown>);
    const el = containerRef.current?.querySelector(`[gs-id="${widgetId}"]`);
    if (el && gridRef.current) gridRef.current.removeWidget(el as HTMLElement);
  };

  const handleRenameWidget = (widgetId: string, title: string) => {
    const updated = widgets.map((w) => (w.id === widgetId ? { ...w, title } : w));
    setWidgets(updated);
    setItem("layouts", "projects-overview-widgets", updated as unknown as Record<string, unknown>);
  };

  const handleAddWidget = (option: ProjectWidgetOption) => {
    const newWidget: ActiveWidget = {
      id: `widget-${Date.now()}`,
      type: option.type,
      title: option.title,
      w: option.defaultWidth,
      h: option.defaultHeight,
    };
    const updated = [...widgets, newWidget];
    setWidgets(updated);
    setItem("layouts", "projects-overview-widgets", updated as unknown as Record<string, unknown>);
    onWidgetModalClose?.();
  };

  return (
    <div className={cn("transition-opacity duration-300 h-full flex flex-col", isReady ? "opacity-100" : "opacity-0")}>
      {/* Grid */}
      <div className="flex-1 min-h-0" key={containerKey}>
        <div className="grid-stack" ref={containerRef}>
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="grid-stack-item"
              gs-w={widget.w}
              gs-h={widget.h}
              gs-x={widget.x}
              gs-y={widget.y}
              gs-id={widget.id}
              gs-min-w="3"
              gs-min-h="3"
            >
              <WidgetShell
                widget={widget}
                onRemove={() => handleRemoveWidget(widget.id)}
                onRename={(title) => handleRenameWidget(widget.id, title)}
              >
                <WidgetContent type={widget.type} />
              </WidgetShell>
            </div>
          ))}
        </div>
      </div>

      {/* Add Widget Modal */}
      <AddProjectWidgetModal
        isOpen={!!isWidgetModalOpen}
        onClose={() => onWidgetModalClose?.()}
        onSelectWidget={handleAddWidget}
      />
    </div>
  );
}

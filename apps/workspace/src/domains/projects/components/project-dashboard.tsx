"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "gridstack/dist/gridstack.min.css";
import { GridStack } from "gridstack";
import { PopoverMenu } from "@qentrah/our-platform-components";
import { cn } from "@/lib/utils";
import { GripHorizontal, MoreHorizontal, Plus, Trash2, Pencil } from "lucide-react";
import { AddWidgetModal, type WidgetOption, type WidgetType } from "./add-widget-modal";
import { DashboardProvider } from "./dashboard-context";
import { useDashboardPersistence } from "@/domains/projects/hooks/use-dashboard-persistence";
import { useAccountContext } from "@/domains/auth";
import { getWidgetComponent } from "./widgets/widget-registry";

interface ProjectDashboardProps {
  projectId: string;
}

interface ActiveWidget {
  id: string;
  type: WidgetType;
  title: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
}

const DEFAULT_WIDGETS: ActiveWidget[] = [
  { id: "default-tasks", type: "task-list", title: "Task List", w: 12, h: 6 },
  { id: "default-workload", type: "workload", title: "Workload by Status", w: 6, h: 4 },
  { id: "default-notes", type: "notes", title: "Notes", w: 6, h: 4 },
  { id: "default-progress", type: "progress-chart", title: "Progress", w: 6, h: 4 },
  { id: "default-budget", type: "budget-chart", title: "Budget", w: 6, h: 4 },
];

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
      {/* Widget Header (Draggable) */}
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
                if (e.key === "Enter") {
                  if (renameValue.trim()) onRename(renameValue.trim());
                  setIsRenaming(false);
                }
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
                onClick={(e) => e.stopPropagation()}
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

      {/* Widget Content */}
      <div className="flex-1 overflow-auto bg-background">
        {children}
      </div>
    </div>
  );
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready" ? account.workspace.organizationId ?? "" : "";

  const gridRef = useRef<GridStack | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [widgets, setWidgets] = useState<ActiveWidget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { config, isLoaded, saveWidgetConfig, saveLayout, lastSyncedAt, syncStatus } =
    useDashboardPersistence(projectId, organizationId);

  // Load widgets from persistence
  useEffect(() => {
    if (!isLoaded || !config) return;
    try {
      const parsed = JSON.parse(config.widgetConfig) as ActiveWidget[];
      if (parsed.length > 0) {
        setWidgets(parsed);
      } else {
        setWidgets(DEFAULT_WIDGETS);
      }
    } catch {
      setWidgets(DEFAULT_WIDGETS);
    }
  }, [isLoaded, config]);

  // Initialize gridstack
  useEffect(() => {
    if (!containerRef.current || widgets.length === 0) return;

    if (!gridRef.current) {
      gridRef.current = GridStack.init({
        margin: 24,
        cellHeight: 80,
        float: true,
        animate: true,
        handle: ".drag-handle",
        resizable: { handles: "se, sw, ne, nw" },
      }, containerRef.current);

      // Load saved layout
      if (config?.layout) {
        try {
          const layout = JSON.parse(config.layout);
          gridRef.current.load(layout);
        } catch {
          // ignore
        }
      }

      // Save layout on change
      gridRef.current.on("change", () => {
        if (gridRef.current) {
          const layout = gridRef.current.save(false);
          saveLayout(JSON.stringify(layout));
        }
      });

      setIsReady(true);
    } else {
      const elements = containerRef.current.querySelectorAll(".grid-stack-item:not(.grid-stack-item-initialized)");
      elements.forEach((el) => {
        gridRef.current?.makeWidget(el as HTMLElement);
      });
    }
  }, [widgets, config?.layout, saveLayout]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gridRef.current) {
        gridRef.current.destroy(false);
        gridRef.current = null;
      }
    };
  }, []);

  const handleAddWidget = useCallback(
    (option: WidgetOption) => {
      const newWidget: ActiveWidget = {
        id: `widget-${Date.now()}`,
        type: option.type,
        title: option.title,
        w: option.defaultWidth,
        h: option.defaultHeight,
      };
      const updated = [...widgets, newWidget];
      setWidgets(updated);
      saveWidgetConfig(JSON.stringify(updated));
      setIsModalOpen(false);
    },
    [widgets, saveWidgetConfig],
  );

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      const updated = widgets.filter((w) => w.id !== widgetId);
      setWidgets(updated);
      saveWidgetConfig(JSON.stringify(updated));
      // Remove from gridstack
      const el = containerRef.current?.querySelector(`[gs-id="${widgetId}"]`);
      if (el && gridRef.current) {
        gridRef.current.removeWidget(el as HTMLElement);
      }
    },
    [widgets, saveWidgetConfig],
  );

  const handleRenameWidget = useCallback(
    (widgetId: string, title: string) => {
      const updated = widgets.map((w) => (w.id === widgetId ? { ...w, title } : w));
      setWidgets(updated);
      saveWidgetConfig(JSON.stringify(updated));
    },
    [widgets, saveWidgetConfig],
  );

  if (!organizationId) return null;

  return (
    <DashboardProvider projectId={projectId} organizationId={organizationId}>
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="flex items-center gap-3">
            {syncStatus === "syncing" && (
              <span className="text-[10px] font-bold text-muted-foreground/60 animate-pulse">Saving...</span>
            )}
            {syncStatus === "synced" && lastSyncedAt && (
              <span className="text-[10px] font-bold text-muted-foreground/60">
                Saved {Math.round((Date.now() - lastSyncedAt) / 1000)}s ago
              </span>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </button>
        </div>

        {/* Grid */}
        <div className={cn("transition-opacity duration-300 flex-1", isReady ? "opacity-100" : "opacity-0")}>
          <div className="grid-stack" ref={containerRef}>
            {widgets.map((widget) => {
              const WidgetComponent = getWidgetComponent(widget.type);
              return (
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
                    <WidgetComponent />
                  </WidgetShell>
                </div>
              );
            })}
          </div>
        </div>

        <AddWidgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectWidget={handleAddWidget}
        />
      </div>
    </DashboardProvider>
  );
}

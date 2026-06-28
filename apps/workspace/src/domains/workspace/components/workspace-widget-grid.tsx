"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "gridstack/dist/gridstack.min.css";
import { GridStack } from "gridstack";
import { cn } from "@/lib/utils";
import { GripHorizontal, MoreHorizontal, Plus, Trash2, Pencil, Maximize2, Minimize2, Expand } from "lucide-react";
import { getWorkspaceWidgetComponent, WORKSPACE_WIDGET_OPTIONS, type WorkspaceWidgetOption } from "./workspace-widget-registry";
import { useAccountContext } from "@/domains/auth";
import { useWidgetLayout, useSaveWidgetLayout } from "../api/widget-layouts";

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
  { id: "metrics", type: "metrics", title: "Metrics", w: 12, h: 2, x: 0, y: 0 },
  { id: "ai-brain", type: "ai-brain", title: "AI Brain", w: 6, h: 6, x: 0, y: 2 },
  { id: "folders", type: "folders", title: "Folders", w: 6, h: 4, x: 6, y: 2 },
  { id: "portfolio", type: "portfolio", title: "Portfolio", w: 12, h: 4, x: 0, y: 8 },
  { id: "calendar", type: "calendar", title: "Calendar Today", w: 6, h: 4, x: 0, y: 12 },
  { id: "docs", type: "docs", title: "Recent Docs", w: 6, h: 4, x: 6, y: 12 },
  { id: "conversations", type: "conversations", title: "Recent Conversations", w: 12, h: 4, x: 0, y: 16 },
];

function WidgetContent({ type, organizationId }: { type: string; organizationId?: string }) {
  const WidgetComponent = getWorkspaceWidgetComponent(type as any);
  return <WidgetComponent organizationId={organizationId} />;
}

function WidgetShell({
  widget,
  onRemove,
  onRename,
  onResize,
  children,
}: {
  widget: ActiveWidget;
  onRemove: () => void;
  onRename: (title: string) => void;
  onResize: (id: string, dw: number, dh: number) => void;
  children: React.ReactNode;
}) {
  const [showMenu, setShowMenu] = useState(false);
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
          {/* Size controls */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onResize(widget.id, -1, 0); }}
            className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
            title="Decrease width"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onResize(widget.id, 1, 0); }}
            className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
            title="Increase width"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onResize(widget.id, 0, 1); }}
            className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
            title="Increase height"
          >
            <Expand className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-2 top-10 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
              <button type="button" onClick={() => { setIsRenaming(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors">
                <Pencil className="h-3 w-3" /> Rename
              </button>
              <button type="button" onClick={() => { onRemove(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                <Trash2 className="h-3 w-3" /> Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-background">{children}</div>
    </div>
  );
}

interface WorkspaceWidgetGridProps {
  isWidgetModalOpen?: boolean;
  onWidgetModalClose?: () => void;
}

export function WorkspaceWidgetGrid({ 
  isWidgetModalOpen, 
  onWidgetModalClose 
}: WorkspaceWidgetGridProps) {
  const gridRef = useRef<GridStack | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [widgets, setWidgets] = useState<ActiveWidget[]>(DEFAULT_WIDGETS);
  const [containerKey, setContainerKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
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
      // Fallback to localStorage for migration
      const localSaved = localStorage.getItem("workspace-widgets");
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved) as ActiveWidget[];
          if (parsed.length > 0) {
            setWidgets(parsed);
            // Migrate to Convex
            if (organizationId && userId) {
              saveLayout({ organizationId, userId, widgets: parsed });
            }
          }
        } catch { /* ignore */ }
      }
    }
  }, [savedLayout, organizationId, userId, saveLayout]);

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
        // Save layout to Convex
        if (organizationId && userId) {
          saveLayout({ organizationId, userId, widgets, layout });
        }
        // Keep localStorage as backup
        localStorage.setItem("workspace-layout", JSON.stringify(layout));
      }
    });

    setIsReady(true);
  }, [organizationId, userId, saveLayout, widgets]);

  useEffect(() => {
    if (!containerRef.current || widgets.length === 0) return;

    const timer = setTimeout(initGrid, 100);
    return () => clearTimeout(timer);
  }, [widgets, containerKey, initGrid]);

  const handleRemoveWidget = (widgetId: string) => {
    const updated = widgets.filter((w) => w.id !== widgetId);
    setWidgets(updated);
    if (organizationId && userId) {
      saveLayout({ organizationId, userId, widgets: updated });
    }
    localStorage.setItem("workspace-widgets", JSON.stringify(updated));
    const el = containerRef.current?.querySelector(`[gs-id="${widgetId}"]`);
    if (el && gridRef.current) gridRef.current.removeWidget(el as HTMLElement);
  };

  const handleRenameWidget = (widgetId: string, title: string) => {
    const updated = widgets.map((w) => (w.id === widgetId ? { ...w, title } : w));
    setWidgets(updated);
    if (organizationId && userId) {
      saveLayout({ organizationId, userId, widgets: updated });
    }
    localStorage.setItem("workspace-widgets", JSON.stringify(updated));
  };

  const handleResizeWidget = (widgetId: string, dw: number, dh: number) => {
    const updated = widgets.map((w) => {
      if (w.id === widgetId) {
        const newW = Math.max(3, w.w + dw);
        const newH = Math.max(2, w.h + dh);
        return { ...w, w: newW, h: newH };
      }
      return w;
    });
    setWidgets(updated);
    if (organizationId && userId) {
      saveLayout({ organizationId, userId, widgets: updated });
    }
    localStorage.setItem("workspace-widgets", JSON.stringify(updated));
  };

  const handleAddWidget = (option: WorkspaceWidgetOption) => {
    const newWidget: ActiveWidget = {
      id: `widget-${Date.now()}`,
      type: option.type,
      title: option.title,
      w: option.defaultWidth,
      h: option.defaultHeight,
    };
    const updated = [...widgets, newWidget];
    setWidgets(updated);
    if (organizationId && userId) {
      saveLayout({ organizationId, userId, widgets: updated });
    }
    localStorage.setItem("workspace-widgets", JSON.stringify(updated));
    onWidgetModalClose?.();
  };

  const handleResetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
    if (organizationId && userId) {
      saveLayout({ organizationId, userId, widgets: DEFAULT_WIDGETS });
    }
    localStorage.setItem("workspace-widgets", JSON.stringify(DEFAULT_WIDGETS));
    localStorage.removeItem("workspace-layout");
    setIsReady(false);
    setContainerKey(k => k + 1);
  };

  return (
    <div className={cn("transition-opacity duration-300 h-full flex flex-col", isReady ? "opacity-100" : "opacity-0")}>
      {/* Header with add button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Workspace</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetLayout}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            Reset Layout
          </button>
          <button
            type="button"
            onClick={() => onWidgetModalClose?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Widget
          </button>
        </div>
      </div>

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
              gs-min-h="2"
            >
              <WidgetShell
                widget={widget}
                onRemove={() => handleRemoveWidget(widget.id)}
                onRename={(title) => handleRenameWidget(widget.id, title)}
                onResize={handleResizeWidget}
              >
                <WidgetContent type={widget.type} organizationId={organizationId} />
              </WidgetShell>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Selection Modal */}
      {isWidgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Add Widget</h3>
              <button
                type="button"
                onClick={() => onWidgetModalClose?.()}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-border/40 px-4">
              {['all', 'overview', 'ai', 'content', 'collaboration'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeCategory === category
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-3">
                {WORKSPACE_WIDGET_OPTIONS
                  .filter(widget => activeCategory === 'all' || widget.category === activeCategory)
                  .map((widget) => (
                  <button
                    key={widget.type}
                    type="button"
                    onClick={() => handleAddWidget(widget)}
                    className="flex flex-col text-left border border-border/20 rounded-xl p-4 bg-muted/20 hover:border-border/40 hover:bg-muted/30 transition-all group"
                  >
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-105", widget.color)}>
                      <widget.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{widget.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{widget.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

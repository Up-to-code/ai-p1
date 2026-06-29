"use client";

import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import "gridstack/dist/gridstack.min.css";
import { GridStack } from "gridstack";
import { cn } from "@/lib/utils";
import { GripHorizontal, MoreHorizontal, Plus, Trash2, Pencil, Maximize2, Minimize2, Expand, Search, LayoutGrid } from "lucide-react";

export interface WidgetOption {
  type: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
  category: string;
}

export interface ActiveWidget {
  id: string;
  type: string;
  title: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
}

export interface WidgetGridProps {
  widgets: ActiveWidget[];
  widgetOptions: WidgetOption[];
  onWidgetsChange: (widgets: ActiveWidget[]) => void;
  onWidgetAdd: (option: WidgetOption) => void;
  onWidgetRemove: (id: string) => void;
  onWidgetRename: (id: string, title: string) => void;
  onWidgetResize: (id: string, dw: number, dh: number) => void;
  renderWidgetContent: (type: string) => ReactNode;
  isModalOpen?: boolean;
  onModalClose?: () => void;
  showAddButton?: boolean;
  showResetButton?: boolean;
  onReset?: () => void;
  className?: string;
}

export function WidgetGrid({
  widgets,
  widgetOptions,
  onWidgetsChange,
  onWidgetAdd,
  onWidgetRemove,
  onWidgetRename,
  onWidgetResize,
  renderWidgetContent,
  isModalOpen = false,
  onModalClose,
  showAddButton = true,
  showResetButton = false,
  onReset,
  className,
}: WidgetGridProps) {
  const gridRef = useRef<GridStack | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [containerKey, setContainerKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const initGrid = useCallback(() => {
    if (!containerRef.current) return;
    
    if (gridRef.current) {
      gridRef.current.destroy(false);
      gridRef.current = null;
    }

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
        const layout = gridRef.current.save(false) as any[];
        // Update widget positions from layout
        const updatedWidgets = widgets.map(w => {
          const layoutItem = layout.find((l: any) => l.id === w.id);
          if (layoutItem) {
            return { ...w, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h };
          }
          return w;
        });
        onWidgetsChange(updatedWidgets);
      }
    });

    setIsReady(true);
  }, [widgets, onWidgetsChange]);

  useEffect(() => {
    if (!containerRef.current || widgets.length === 0) return;
    const timer = setTimeout(initGrid, 100);
    return () => clearTimeout(timer);
  }, [widgets, containerKey, initGrid]);

  const handleResizeWidget = (widgetId: string, dw: number, dh: number) => {
    const updated = widgets.map((w) => {
      if (w.id === widgetId) {
        const newW = Math.max(3, w.w + dw);
        const newH = Math.max(2, w.h + dh);
        return { ...w, w: newW, h: newH };
      }
      return w;
    });
    onWidgetsChange(updated);
    onWidgetResize(widgetId, dw, dh);
  };

  const categories = ['all', ...Array.from(new Set(widgetOptions.map(w => w.category)))];

  return (
    <div className={cn("transition-opacity duration-300 h-full flex flex-col", isReady ? "opacity-100" : "opacity-0", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Widgets</h2>
        <div className="flex items-center gap-2">
          {showResetButton && onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            >
              Reset Layout
            </button>
          )}
          {showAddButton && onModalClose && (
            <button
              type="button"
              onClick={() => onModalClose()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Widget
            </button>
          )}
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
                onRemove={() => onWidgetRemove(widget.id)}
                onRename={(title) => onWidgetRename(widget.id, title)}
                onResize={handleResizeWidget}
              >
                {renderWidgetContent(widget.type)}
              </WidgetShell>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Selection Modal */}
      {isModalOpen && onModalClose && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Add Widget</h3>
              <button
                type="button"
                onClick={() => onModalClose()}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Search */}
            <div className="px-4 py-3 border-b border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search widgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/30 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-colors"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/40 px-4">
              {categories.map((category) => (
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
                {widgetOptions
                  .filter(widget => {
                    const matchesCategory = activeCategory === 'all' || widget.category === activeCategory;
                    const matchesSearch = searchQuery === '' || 
                      widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      widget.description.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((widget) => (
                  <button
                    key={widget.type}
                    type="button"
                    onClick={() => onWidgetAdd(widget)}
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
  children: ReactNode;
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
            <div className="absolute right-2 top-10 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                Size
              </div>
              <button type="button" onClick={() => { onResize(widget.id, 3 - widget.w, 2 - widget.h); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors">
                <LayoutGrid className="h-3 w-3" /> Small
              </button>
              <button type="button" onClick={() => { onResize(widget.id, 6 - widget.w, 4 - widget.h); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors">
                <LayoutGrid className="h-3 w-3" /> Medium
              </button>
              <button type="button" onClick={() => { onResize(widget.id, 12 - widget.w, 6 - widget.h); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors">
                <LayoutGrid className="h-3 w-3" /> Large
              </button>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 mt-1">
                Actions
              </div>
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

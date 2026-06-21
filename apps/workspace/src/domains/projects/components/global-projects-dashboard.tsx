"use client";

import { useEffect, useRef, useState } from "react";
import "gridstack/dist/gridstack.min.css";
import { GridStack } from "gridstack";
import { PortfolioTableWidget } from "./widgets/portfolio-table-widget";
import { cn } from "@/lib/utils";
import { GripHorizontal, MoreHorizontal } from "lucide-react";

export function GlobalProjectsDashboard() {
  const gridRef = useRef<GridStack | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Gridstack
    gridRef.current = GridStack.init({
      margin: 16,
      cellHeight: 80,
      float: true,
      animate: true,
      handle: '.drag-handle', // Only drag from headers
    }, containerRef.current);

    // Load saved layout from localStorage
    const savedLayout = localStorage.getItem(`global-projects-dashboard`);
    
    if (savedLayout && gridRef.current) {
      try {
        const layout = JSON.parse(savedLayout);
        gridRef.current.load(layout);
      } catch (e) {
        console.error("Failed to parse saved layout", e);
      }
    }

    // Save layout on change
    gridRef.current.on("change", () => {
      if (gridRef.current) {
        const layout = gridRef.current.save(false);
        localStorage.setItem(`global-projects-dashboard`, JSON.stringify(layout));
      }
    });

    setIsReady(true);

    return () => {
      if (gridRef.current) {
        gridRef.current.destroy(false);
      }
    };
  }, []);

  return (
    <div className={cn("transition-opacity duration-300 h-full", isReady ? "opacity-100" : "opacity-0")}>
      <div className="grid-stack" ref={containerRef}>
        
        {/* Portfolio Table Widget */}
        <div className="grid-stack-item" gs-w="12" gs-h="6" gs-id="portfolio-table" gs-min-w="6" gs-min-h="4">
          <div className="grid-stack-item-content rounded-2xl border border-border bg-surface dark:border-white/5 overflow-hidden flex flex-col shadow-sm">
            <div className="drag-handle p-3 border-b border-border/50 bg-muted/30 flex items-center justify-between cursor-move group/header">
              <div className="flex items-center gap-2">
                <GripHorizontal className="h-4 w-4 text-muted-foreground opacity-50 group-hover/header:opacity-100 transition-opacity" />
                <span className="font-semibold text-sm">Portfolio</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-background">
              <PortfolioTableWidget />
            </div>
          </div>
        </div>

        {/* Global Summary Widget */}
        <div className="grid-stack-item" gs-w="6" gs-h="4" gs-id="global-summary-1" gs-x="0" gs-y="6">
          <div className="grid-stack-item-content rounded-2xl border border-border bg-surface dark:border-white/5 overflow-hidden flex flex-col shadow-sm">
            <div className="drag-handle p-3 border-b border-border/50 bg-muted/30 flex items-center justify-between cursor-move group/header">
              <div className="flex items-center gap-2">
                <GripHorizontal className="h-4 w-4 text-muted-foreground opacity-50 group-hover/header:opacity-100 transition-opacity" />
                <span className="font-semibold text-sm">Workspace Overview</span>
              </div>
            </div>
            <div className="flex-1 p-6 text-sm text-muted-foreground flex items-center justify-center bg-background">
              Drag to resize or move this widget.
            </div>
          </div>
        </div>

        {/* Global Activity Widget */}
        <div className="grid-stack-item" gs-w="6" gs-h="4" gs-id="global-summary-2" gs-x="6" gs-y="6">
          <div className="grid-stack-item-content rounded-2xl border border-border bg-surface dark:border-white/5 overflow-hidden flex flex-col shadow-sm">
            <div className="drag-handle p-3 border-b border-border/50 bg-muted/30 flex items-center justify-between cursor-move group/header">
              <div className="flex items-center gap-2">
                <GripHorizontal className="h-4 w-4 text-muted-foreground opacity-50 group-hover/header:opacity-100 transition-opacity" />
                <span className="font-semibold text-sm">Workspace Activity</span>
              </div>
            </div>
            <div className="flex-1 p-6 text-sm text-muted-foreground flex items-center justify-center bg-background">
              Layout configuration is automatically saved.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

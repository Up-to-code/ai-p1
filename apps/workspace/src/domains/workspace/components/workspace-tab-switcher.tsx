"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw, Filter, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "list", label: "List" },
  { id: "gantt", label: "Gantt" },
  { id: "calendar", label: "Calendar" },
  { id: "table", label: "Table" },
  { id: "board", label: "Board" },
];

export function WorkspaceTabSwitcher() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="border-b border-border/50 bg-background/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[13px] font-medium transition-colors",
                activeTab === tab.id
                  ? "border border-border bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>View</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Refreshed: 2m ago</span>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
              "bg-accent text-accent-foreground",
            )}
          >
            <RefreshCw className="h-3 w-3" />
            Auto-refresh
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Filter className="h-3 w-3" />
            Filter
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            + Card
          </button>
        </div>
      </div>
    </div>
  );
}

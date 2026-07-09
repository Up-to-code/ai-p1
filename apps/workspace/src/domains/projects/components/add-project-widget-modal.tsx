"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, PieChart, ListTodo, StickyNote, Clock, BarChart3, Activity, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProjectWidgetType = "stats" | "status" | "health" | "recent" | "progress" | "timeline" | "activity" | "goals" | "team-load";

export interface ProjectWidgetOption {
  type: ProjectWidgetType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
}

const PROJECT_WIDGET_OPTIONS: ProjectWidgetOption[] = [
  { type: "stats", title: "Project Overview", description: "Key metrics across all projects — total, active, completed, at risk", icon: BarChart3, color: "text-primary bg-primary/10", defaultWidth: 4, defaultHeight: 4 },
  { type: "status", title: "Projects by Status", description: "Donut chart showing project distribution by status", icon: PieChart, color: "text-teal-500 bg-teal-500/10", defaultWidth: 4, defaultHeight: 4 },
  { type: "health", title: "Projects by Health", description: "Donut chart showing on track, at risk, and blocked projects", icon: Activity, color: "text-emerald-500 bg-emerald-500/10", defaultWidth: 4, defaultHeight: 4 },
  { type: "recent", title: "Recent Projects", description: "List of recently created or updated projects", icon: Clock, color: "text-sky-500 bg-sky-500/10", defaultWidth: 6, defaultHeight: 4 },
  { type: "progress", title: "Progress Tracker", description: "Average progress and completion rates across projects", icon: TrendingUp, color: "text-indigo-500 bg-indigo-500/10", defaultWidth: 6, defaultHeight: 4 },
  { type: "timeline", title: "Project Timeline", description: "Projects with upcoming deadlines and milestones", icon: Target, color: "text-rose-500 bg-rose-500/10", defaultWidth: 6, defaultHeight: 4 },
  { type: "activity", title: "Activity Feed", description: "Recent changes and updates across all projects", icon: ListTodo, color: "text-violet-500 bg-violet-500/10", defaultWidth: 6, defaultHeight: 4 },
];

interface AddProjectWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidget: (widget: ProjectWidgetOption) => void;
}

export function AddProjectWidgetModal({ isOpen, onClose, onSelectWidget }: AddProjectWidgetModalProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Widgets" },
    { id: "overview", label: "Overview" },
    { id: "charts", label: "Charts" },
    { id: "data", label: "Data" },
  ];

  const filteredWidgets = PROJECT_WIDGET_OPTIONS.filter((w) => {
    const matchesSearch = !search || w.title.toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[850px] p-0 overflow-hidden border-border bg-surface shadow-2xl rounded-xl gap-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Add Widget</DialogTitle>
        <DialogDescription className="sr-only">Select a widget to add to your projects dashboard</DialogDescription>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-[220px] border-r border-border bg-muted/20 flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-bold">+</span>
              </div>
              <span className="font-bold text-sm">Add Widget</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left",
                      activeCategory === cat.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-background">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search widgets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-muted/30 border-transparent focus-visible:ring-1 focus-visible:ring-border shadow-none"
                />
              </div>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">
                {activeCategory === "all" ? "All Widgets" : categories.find((c) => c.id === activeCategory)?.label}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {filteredWidgets.map((widget) => (
                  <button
                    key={widget.type}
                    onClick={() => onSelectWidget(widget)}
                    className="flex flex-col text-left border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all bg-surface group"
                  >
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110", widget.color)}>
                      <widget.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground mb-1">{widget.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{widget.description}</p>
                  </button>
                ))}
              </div>
              {filteredWidgets.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No widgets match your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

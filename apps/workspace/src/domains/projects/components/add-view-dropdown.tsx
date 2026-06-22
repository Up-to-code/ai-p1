"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, ListTodo, Calendar, KanbanSquare, FileText, 
  CheckSquare, LayoutGrid, Table2, Presentation, Clock, 
  Activity, BarChart, Network, Users, MapPin, Globe, FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewType = "list" | "calendar" | "board" | "doc" | "form" | "dashboard" | "table" | "whiteboard" | "timeline" | "activity" | "workload" | "mindmap" | "team" | "map" | "website" | "sheets";

export interface ViewOption {
  type: ViewType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const POPULAR_VIEWS: ViewOption[] = [
  { type: "list", label: "List", description: "Track tasks, bugs, people & more", icon: ListTodo, color: "text-slate-500 bg-slate-500/10" },
  { type: "calendar", label: "Calendar", description: "Plan, schedule, & delegate", icon: Calendar, color: "text-orange-500 bg-orange-500/10" },
  { type: "board", label: "Board – Kanban", description: "Move tasks between columns", icon: KanbanSquare, color: "text-indigo-500 bg-indigo-500/10" },
  { type: "doc", label: "Doc", description: "Collaborate & document anything", icon: FileText, color: "text-blue-500 bg-blue-500/10" },
  { type: "form", label: "Form", description: "Collect, track, & report data", icon: CheckSquare, color: "text-violet-500 bg-violet-500/10" },
  { type: "dashboard", label: "Dashboard", description: "Track metrics & insights", icon: LayoutGrid, color: "text-purple-500 bg-purple-500/10" },
];

const MORE_VIEWS: ViewOption[] = [
  { type: "table", label: "Table", description: "Structured table format", icon: Table2, color: "text-emerald-500 bg-emerald-500/10" },
  { type: "whiteboard", label: "Whiteboard", description: "Visualize & brainstorm ideas", icon: Presentation, color: "text-amber-500 bg-amber-500/10" },
  { type: "timeline", label: "Timeline", description: "See tasks by start & due date", icon: Clock, color: "text-orange-600 bg-orange-600/10" },
  { type: "activity", label: "Activity", description: "Real-time activity feed", icon: Activity, color: "text-blue-600 bg-blue-600/10" },
  { type: "workload", label: "Workload", description: "Visualize team capacity", icon: BarChart, color: "text-teal-500 bg-teal-500/10" },
  { type: "mindmap", label: "Mind Map", description: "Visual brainstorming of ideas", icon: Network, color: "text-pink-500 bg-pink-500/10" },
  { type: "team", label: "Team", description: "Monitor work being done", icon: Users, color: "text-indigo-600 bg-indigo-600/10" },
  { type: "map", label: "Map", description: "Tasks visualized by address", icon: MapPin, color: "text-orange-500 bg-orange-500/10" },
];

const EMBEDS: ViewOption[] = [
  { type: "website", label: "Any website", description: "Embed a website", icon: Globe, color: "text-slate-400 bg-slate-400/10" },
  { type: "sheets", label: "Google Sheets", description: "Embed a Google Sheet", icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-600/10" },
];

interface AddViewDropdownProps {
  onAddView: (view: ViewOption) => void;
}

export function AddViewDropdown({ onAddView }: AddViewDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (view: ViewOption) => {
    onAddView(view);
    setOpen(false);
  };

  const renderSection = (title: string, views: ViewOption[]) => {
    const filtered = views.filter(v => 
      v.label.toLowerCase().includes(search.toLowerCase()) || 
      v.description.toLowerCase().includes(search.toLowerCase())
    );
    
    if (filtered.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground px-2 mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-1">
          {filtered.map(view => (
            <button
              key={view.type}
              onClick={() => handleSelect(view)}
              className="flex items-start text-left gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className={cn("mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0", view.color)}>
                <view.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{view.label}</div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{view.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className="flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors text-sm font-medium cursor-pointer">
          <Plus className="h-4 w-4" />
          Add view
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0 rounded-xl border-border shadow-xl overflow-hidden" align="start">
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            <Input 
              placeholder="Search views..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-primary/30 focus-visible:ring-primary/20 bg-primary/5 rounded-md text-sm" 
            />
          </div>
        </div>
        <div className="p-3 max-h-[450px] overflow-y-auto">
          {renderSection("Popular", POPULAR_VIEWS)}
          {renderSection("More views", MORE_VIEWS)}
          {renderSection("Embeds", EMBEDS)}
        </div>
      </PopoverContent>
    </Popover>
  );
}

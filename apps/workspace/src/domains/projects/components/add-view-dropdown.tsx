"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, ListTodo, Calendar, KanbanSquare, FileText, 
  CheckSquare, LayoutGrid, Table2, Presentation, Clock, 
  Activity, BarChart, Network, Users, MapPin, Globe, FileSpreadsheet,
  Lock, Pin
} from "lucide-react";

export type ViewType = "list" | "calendar" | "board" | "doc" | "form" | "dashboard" | "table" | "whiteboard" | "timeline" | "activity" | "workload" | "mindmap" | "team" | "map" | "website" | "sheets";

export interface ViewOption {
  type: ViewType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const POPULAR_VIEWS: ViewOption[] = [
  { type: "list", label: "List", description: "Track tasks, bugs, people & more", icon: ListTodo, color: "#3a3a3a" },
  { type: "calendar", label: "Calendar", description: "Plan, schedule, & delegate", icon: Calendar, color: "#e87732" },
  { type: "board", label: "Board \u2013 Kanban", description: "Move tasks between columns", icon: KanbanSquare, color: "#7c3aed" },
  { type: "doc", label: "Doc", description: "Collaborate & document anything", icon: FileText, color: "#2563eb" },
  { type: "form", label: "Form", description: "Collect, track, & report data", icon: CheckSquare, color: "#db2777" },
  { type: "dashboard", label: "Dashboard", description: "Track metrics & insights", icon: LayoutGrid, color: "#4f46e5" },
];

const MORE_VIEWS: ViewOption[] = [
  { type: "table", label: "Table", description: "Structured table format", icon: Table2, color: "#16a34a" },
  { type: "whiteboard", label: "Whiteboard", description: "Visualize & brainstorm ideas", icon: Presentation, color: "#d97706" },
  { type: "timeline", label: "Timeline", description: "See tasks by start & due date", icon: Clock, color: "#e87732" },
  { type: "activity", label: "Activity", description: "Real-time activity feed", icon: Activity, color: "#0891b2" },
  { type: "workload", label: "Workload", description: "Visualize team capacity", icon: BarChart, color: "#0d9488" },
  { type: "mindmap", label: "Mind Map", description: "Visual brainstorming of ideas", icon: Network, color: "#db2777" },
  { type: "team", label: "Team", description: "Monitor work being done", icon: Users, color: "#7c3aed" },
  { type: "map", label: "Map", description: "Tasks visualized by address", icon: MapPin, color: "#dc2626" },
];

const EMBEDS: ViewOption[] = [
  { type: "website", label: "Any website", description: "Embed any page or tool", icon: Globe, color: "#111111" },
  { type: "sheets", label: "Google Sheets", description: "Connect your spreadsheet", icon: FileSpreadsheet, color: "#16a34a" },
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

  const filterViews = (views: ViewOption[]) =>
    views.filter(v =>
      v.label.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase())
    );

  const filteredPopular = filterViews(POPULAR_VIEWS);
  const filteredMore = filterViews(MORE_VIEWS);
  const filteredEmbeds = filterViews(EMBEDS);

  const hasResults = filteredPopular.length > 0 || filteredMore.length > 0 || filteredEmbeds.length > 0;

  const renderSection = (title: string, views: ViewOption[], showDivider: boolean = false) => {
    if (views.length === 0) return null;

    return (
      <>
        {showDivider && <div className="h-px bg-border my-2" />}
        <div className="text-[11px] text-muted-foreground font-medium tracking-wider px-2 mb-1.5">{title}</div>
        <div className="grid grid-cols-2 gap-0.5 px-2">
          {views.map(view => (
            <button
              key={view.type}
              onClick={() => handleSelect(view)}
              className="flex items-center text-left gap-2.5 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div 
                className="h-[34px] w-[34px] rounded-lg flex items-center justify-center shrink-0 text-white"
                style={{ backgroundColor: view.color }}
              >
                <view.icon className="h-[17px] w-[17px]" />
              </div>
              <div>
                <div className="text-[13px] font-medium text-foreground leading-tight">{view.label}</div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{view.description}</div>
              </div>
            </button>
          ))}
        </div>
      </>
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
      <PopoverContent className="w-[460px] p-0 rounded-[10px] border shadow-2xl overflow-hidden bg-card" align="start">
        <div className="p-2.5 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input 
              placeholder="Search views..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 border-none focus-visible:ring-0 bg-transparent text-foreground text-[13px] placeholder:text-muted-foreground/50" 
            />
          </div>
        </div>
        <div className="p-2 max-h-[450px] overflow-y-auto">
          {hasResults ? (
            <>
              {renderSection("Popular", filteredPopular)}
              {renderSection("More views", filteredMore, true)}
              {renderSection("Embeds", filteredEmbeds, true)}
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-[13px]">No views found</div>
          )}
        </div>
        <div className="flex items-center gap-5 px-3.5 py-2.5 border-t border-border">
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground cursor-pointer hover:text-foreground/80">
            <input type="checkbox" className="accent-foreground w-[13px] h-[13px]" />
            <Lock className="h-[13px] w-[13px]" />
            Private view
          </label>
          <label className="flex items-center gap-1.5 text-[12px] text-muted-foreground cursor-pointer hover:text-foreground/80">
            <input type="checkbox" className="accent-[#555] w-[13px] h-[13px]" />
            <Pin className="h-[13px] w-[13px]" />
            Pin view
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}

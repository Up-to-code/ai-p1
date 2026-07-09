"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, ListTodo, PieChart, Calculator, FolderKanban, Users, StickyNote, MessageSquare, Bookmark, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export type WidgetType = "ai-brain" | "task-list" | "workload" | "calculation" | "portfolio" | "assignee" | "notes" | "discussion" | "bookmarks" | "progress-chart" | "budget-chart";

export interface WidgetOption {
  type: WidgetType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
}

const WIDGET_OPTIONS: WidgetOption[] = [
  { type: "task-list", title: "Task List", description: "View and interact with project tasks", icon: ListTodo, color: "text-blue-500 bg-blue-500/10", defaultWidth: 12, defaultHeight: 6 },
  { type: "notes", title: "Notes", description: "Add rich text notes for this project", icon: StickyNote, color: "text-amber-500 bg-amber-500/10", defaultWidth: 6, defaultHeight: 4 },
  { type: "workload", title: "Workload by Status", description: "Pie chart showing tasks by status", icon: PieChart, color: "text-teal-500 bg-teal-500/10", defaultWidth: 6, defaultHeight: 4 },
  { type: "progress-chart", title: "Progress Chart", description: "Project progress with task breakdown", icon: TrendingUp, color: "text-indigo-500 bg-indigo-500/10", defaultWidth: 6, defaultHeight: 4 },
  { type: "ai-brain", title: "AI Brain", description: "Generate ideas and content with a custom prompt", icon: Sparkles, color: "text-purple-500 bg-purple-500/10", defaultWidth: 4, defaultHeight: 4 },
  { type: "calculation", title: "Calculation", description: "Calculate sums, averages, and so much more", icon: Calculator, color: "text-indigo-500 bg-indigo-500/10", defaultWidth: 4, defaultHeight: 4 },
  { type: "portfolio", title: "Portfolio", description: "Categorize and track progress of Lists & Folders", icon: FolderKanban, color: "text-orange-500 bg-orange-500/10", defaultWidth: 12, defaultHeight: 6 },
  { type: "assignee", title: "Tasks by Assignee", description: "Display a pie chart of your total tasks by Assignee", icon: Users, color: "text-sky-500 bg-sky-500/10", defaultWidth: 4, defaultHeight: 4 },
  { type: "discussion", title: "Discussion", description: "Collaborate and chat with members", icon: MessageSquare, color: "text-pink-500 bg-pink-500/10", defaultWidth: 4, defaultHeight: 4 },
  { type: "bookmarks", title: "Bookmarks", description: "Bookmark items such as URLs or external links", icon: Bookmark, color: "text-emerald-500 bg-emerald-500/10", defaultWidth: 4, defaultHeight: 4 },
];

const SIDEBAR_ITEMS = [
  { id: "featured", icon: Sparkles },
  { id: "overview", icon: PieChart },
  { id: "charts", icon: TrendingUp },
  { id: "ai", icon: Sparkles },
  { id: "custom", icon: Calculator },
];

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWidget: (widget: WidgetOption) => void;
}

export function AddWidgetModal({ isOpen, onClose, onSelectWidget }: AddWidgetModalProps) {
  const t = useTranslations("Widgets.addWidgetModal");
  const [activeCategory, setActiveCategory] = useState("featured");
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getWidgetTranslationKey = (type: string): { title: string; description: string } => {
    const keyMap: Record<string, string> = {
      "task-list": "taskList",
      "notes": "notes",
      "workload": "workload",
      "progress-chart": "progressChart",
      "ai-brain": "aiBrain",
      "calculation": "calculation",
      "portfolio": "portfolio",
      "assignee": "assignee",
      "discussion": "discussion",
      "bookmarks": "bookmarks",
    };
    const key = keyMap[type] || type;
    return {
      title: t(`widgets.${key}`),
      description: t(`widgets.${key}Desc`),
    };
  };

  const filteredWidgets = WIDGET_OPTIONS.filter((widget) => {
    const matchesSearch = searchQuery === "" || 
      widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setIsExpanded(false);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-0 overflow-hidden border-border/60 bg-background shadow-2xl rounded-2xl gap-0" showCloseButton={false}>
        <DialogTitle className="sr-only">{t("addCard")}</DialogTitle>
        <DialogDescription className="sr-only">{t("addCard")}</DialogDescription>
        
        <div className="flex h-[550px]">
          {/* Radial Menu Sidebar */}
          <div className="relative w-[80px] bg-[#141414] dark:bg-[#141414] border-r border-border/30 flex flex-col items-center py-4">
            {/* Center toggle button */}
            <div className="relative mb-6">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isExpanded 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <Sparkles className="h-5 w-5" />
              </button>
            </div>

            {/* Radial menu items */}
            <div className="relative flex-1 flex flex-col items-center justify-center">
              <AnimatePresence>
                {SIDEBAR_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeCategory === item.id;
                  const angle = isExpanded 
                    ? (index * (360 / SIDEBAR_ITEMS.length) - 90) * (Math.PI / 180)
                    : 0;
                  const radius = isExpanded ? 60 : 0;
                  const x = isExpanded ? Math.cos(angle) * radius : 0;
                  const y = isExpanded ? Math.sin(angle) * radius : 0;

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        x: isExpanded ? x : 0,
                        y: isExpanded ? y : 0,
                      }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ 
                        duration: 0.2,
                        delay: isExpanded ? index * 0.05 : 0,
                      }}
                      onClick={() => handleCategoryClick(item.id)}
                      className={cn(
                        "absolute h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200",
                        isActive 
                          ? "bg-primary/20 text-primary ring-2 ring-primary/30" 
                          : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground"
                      )}
                      style={{
                        position: isExpanded ? 'absolute' : 'relative',
                        top: isExpanded ? '50%' : 'auto',
                        left: isExpanded ? '50%' : 'auto',
                        transform: isExpanded ? 'translate(-50%, -50%)' : 'none',
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Collapsed sidebar items */}
            {!isExpanded && (
              <div className="flex flex-col items-center gap-2 mt-4">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCategoryClick(item.id)}
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200",
                        isActive 
                          ? "bg-primary/20 text-primary" 
                          : "bg-[#1a1a1a] text-muted-foreground hover:bg-[#2a2a2a] hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-[var(--q-bg)]">
            <div className="p-3 border-b border-border/30 flex items-center justify-between">
              <div className="relative flex-1 max-w-sm ml-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t("search")} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-8 bg-[#1a1a1a] dark:bg-[#1a1a1a] border-transparent focus-visible:ring-1 focus-visible:ring-border shadow-none rounded-md text-[13px]" 
                />
              </div>
              <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-white/10 mr-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-[15px] font-semibold mb-4 text-foreground">{t(`categories.${activeCategory}`)}</h2>
              <div className="grid grid-cols-2 gap-4">
                {filteredWidgets.map((widget) => {
                  const translation = getWidgetTranslationKey(widget.type);
                  return (
                    <button
                      key={widget.type}
                      onClick={() => onSelectWidget({ ...widget, title: translation.title, description: translation.description })}
                      className="flex flex-col text-left border border-border/20 rounded-xl p-4 bg-[#181818] dark:bg-[#181818] hover:border-border/40 hover:bg-[#1c1c1c] transition-all group"
                    >
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-105", widget.color)}>
                        <widget.icon className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-[13px] text-foreground mb-1">{translation.title}</h3>
                      <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">{translation.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

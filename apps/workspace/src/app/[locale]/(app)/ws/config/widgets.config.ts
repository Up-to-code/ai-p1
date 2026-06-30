import { BarChart3, Folder, FolderKanban, CalendarDays, MessageSquare, FileText as FileTextIcon, Sparkles } from "lucide-react";
import { type WidgetOption, type ActiveWidget } from "@qentrah/our-platform-components/widget-grid";
import {
  MetricCards, FoldersWidget, PortfolioWidget, CalendarTodayWidget,
  RecentConversationsWidget, DocsWidget, AiBrainWidget,
} from "@/domains/workspace/components/workspace-widgets";

export const WIDGET_OPTIONS: WidgetOption[] = [
  { type: "metrics", title: "Metrics", description: "Overview of tasks, conversations, and events",
    icon: BarChart3, color: "text-blue-500 bg-blue-500/10", defaultWidth: 12, defaultHeight: 2, category: "overview" },
  { type: "ai-brain", title: "AI Brain", description: "Quick access to AI assistant",
    icon: Sparkles, color: "text-purple-500 bg-purple-500/10", defaultWidth: 6, defaultHeight: 6, category: "ai" },
  { type: "folders", title: "Folders", description: "Quick access to document folders",
    icon: Folder, color: "text-amber-500 bg-amber-500/10", defaultWidth: 6, defaultHeight: 4, category: "content" },
  { type: "portfolio", title: "Portfolio", description: "Project portfolio with progress tracking",
    icon: FolderKanban, color: "text-orange-500 bg-orange-500/10", defaultWidth: 12, defaultHeight: 4, category: "overview" },
  { type: "calendar", title: "Calendar Today", description: "Today's events and schedule",
    icon: CalendarDays, color: "text-teal-500 bg-teal-500/10", defaultWidth: 6, defaultHeight: 4, category: "collaboration" },
  { type: "conversations", title: "Recent Conversations", description: "Recent AI conversation threads",
    icon: MessageSquare, color: "text-pink-500 bg-pink-500/10", defaultWidth: 12, defaultHeight: 4, category: "ai" },
  { type: "docs", title: "Recent Docs", description: "Recently accessed documents",
    icon: FileTextIcon, color: "text-emerald-500 bg-emerald-500/10", defaultWidth: 6, defaultHeight: 4, category: "content" },
];

export const DEFAULT_WIDGETS: ActiveWidget[] = [
  { id: "metrics", type: "metrics", title: "Metrics", w: 12, h: 2, x: 0, y: 0 },
  { id: "ai-brain", type: "ai-brain", title: "AI Brain", w: 6, h: 6, x: 0, y: 2 },
  { id: "folders", type: "folders", title: "Folders", w: 6, h: 4, x: 6, y: 2 },
  { id: "portfolio", type: "portfolio", title: "Portfolio", w: 12, h: 4, x: 0, y: 8 },
  { id: "calendar", type: "calendar", title: "Calendar Today", w: 6, h: 4, x: 0, y: 12 },
  { id: "docs", type: "docs", title: "Recent Docs", w: 6, h: 4, x: 6, y: 12 },
  { id: "conversations", type: "conversations", title: "Recent Conversations", w: 12, h: 4, x: 0, y: 16 },
];

export const WIDGET_COMPONENT_MAP: Record<string, React.ComponentType<{ organizationId?: string; spaceSlug?: string | null; projectId?: string | null }>> = {
  "metrics": MetricCards,
  "ai-brain": AiBrainWidget,
  "folders": FoldersWidget,
  "portfolio": PortfolioWidget,
  "calendar": CalendarTodayWidget,
  "conversations": RecentConversationsWidget,
  "docs": DocsWidget,
};

export const WIDGETS_STORAGE_KEY = "workspace-widgets";

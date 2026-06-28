import type { ComponentType } from "react";
import { 
  BarChart3, 
  Sparkles, 
  Folder, 
  FolderKanban, 
  CalendarDays, 
  MessageSquare, 
  FileText 
} from "lucide-react";
import { MetricCards } from "./workspace-screen";
import { FoldersWidget } from "./workspace-screen";
import { PortfolioWidget } from "./workspace-screen";
import { CalendarTodayWidget } from "./workspace-screen";
import { RecentConversationsWidget } from "./workspace-screen";
import { DocsWidget } from "./workspace-screen";
import { AiBrainWidget } from "./workspace-screen";

const PlaceholderWidget: ComponentType = () => <div>Widget not found</div>;

export type WorkspaceWidgetType = 
  | "metrics"
  | "ai-brain"
  | "folders"
  | "portfolio"
  | "calendar"
  | "conversations"
  | "docs";

export interface WorkspaceWidgetOption {
  type: WorkspaceWidgetType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
  category: "overview" | "ai" | "content" | "collaboration";
}

export const WORKSPACE_WIDGET_OPTIONS: WorkspaceWidgetOption[] = [
  { 
    type: "metrics", 
    title: "Metrics", 
    description: "Overview of tasks, conversations, and events", 
    icon: BarChart3,
    color: "text-blue-500 bg-blue-500/10", 
    defaultWidth: 12, 
    defaultHeight: 2,
    category: "overview"
  },
  { 
    type: "ai-brain", 
    title: "AI Brain", 
    description: "Quick access to AI assistant", 
    icon: Sparkles,
    color: "text-purple-500 bg-purple-500/10", 
    defaultWidth: 6, 
    defaultHeight: 6,
    category: "ai"
  },
  { 
    type: "folders", 
    title: "Folders", 
    description: "Quick access to document folders", 
    icon: Folder,
    color: "text-amber-500 bg-amber-500/10", 
    defaultWidth: 6, 
    defaultHeight: 4,
    category: "content"
  },
  { 
    type: "portfolio", 
    title: "Portfolio", 
    description: "Project portfolio with progress tracking", 
    icon: FolderKanban,
    color: "text-orange-500 bg-orange-500/10", 
    defaultWidth: 12, 
    defaultHeight: 4,
    category: "overview"
  },
  { 
    type: "calendar", 
    title: "Calendar Today", 
    description: "Today's events and schedule", 
    icon: CalendarDays,
    color: "text-teal-500 bg-teal-500/10", 
    defaultWidth: 6, 
    defaultHeight: 4,
    category: "collaboration"
  },
  { 
    type: "conversations", 
    title: "Recent Conversations", 
    description: "Recent AI conversation threads", 
    icon: MessageSquare,
    color: "text-pink-500 bg-pink-500/10", 
    defaultWidth: 12, 
    defaultHeight: 4,
    category: "ai"
  },
  { 
    type: "docs", 
    title: "Recent Docs", 
    description: "Recently accessed documents", 
    icon: FileText,
    color: "text-emerald-500 bg-emerald-500/10", 
    defaultWidth: 6, 
    defaultHeight: 4,
    category: "content"
  },
];

export interface WorkspaceWidgetEntry {
  component: ComponentType<{ organizationId?: string }>;
}

const registry: Record<WorkspaceWidgetType, WorkspaceWidgetEntry> = {
  "metrics": { component: MetricCards },
  "ai-brain": { component: AiBrainWidget },
  "folders": { component: FoldersWidget },
  "portfolio": { component: PortfolioWidget },
  "calendar": { component: CalendarTodayWidget },
  "conversations": { component: RecentConversationsWidget },
  "docs": { component: DocsWidget },
};

export function getWorkspaceWidgetComponent(type: WorkspaceWidgetType): ComponentType<{ organizationId?: string }> {
  return registry[type]?.component ?? PlaceholderWidget;
}

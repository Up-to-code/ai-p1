import {
  LayoutDashboard, List, BarChart3, Calendar, Table, Columns3,
  FileText, ClipboardCheck, Clock, Activity, Users, Globe, Presentation,
} from "lucide-react";
import { TokenBar, type TokenOption } from "@/components/shared";

export interface ViewToken extends TokenOption {
  viewId: string;
}

export const ALL_VIEWS: ViewToken[] = [
  { id: "list", viewId: "list", label: "List", icon: List, color: "text-[#22c55e]", iconBg: "bg-[#22c55e]/15", iconColor: "text-[#22c55e]", category: "popular", description: "Track tasks, bugs, people & more" },
  { id: "gantt", viewId: "gantt", label: "Gantt", icon: BarChart3, color: "text-[#ef4444]", iconBg: "bg-[#ef4444]/15", iconColor: "text-[#ef4444]", category: "popular", description: "Plan dependencies & time" },
  { id: "calendar", viewId: "calendar", label: "Calendar", icon: Calendar, color: "text-[#f97316]", iconBg: "bg-[#f97316]/15", iconColor: "text-[#f97316]", category: "popular", description: "Plan, schedule, & delegate" },
  { id: "doc", viewId: "doc", label: "Doc", icon: FileText, color: "text-[#3b82f6]", iconBg: "bg-[#3b82f6]/15", iconColor: "text-[#3b82f6]", category: "popular", description: "Collaborate & document anything" },
  { id: "board", viewId: "board", label: "Board", icon: Columns3, color: "text-[#a855f7]", iconBg: "bg-[#a855f7]/15", iconColor: "text-[#a855f7]", category: "popular", description: "Move tasks between columns" },
  { id: "form", viewId: "form", label: "Form", icon: ClipboardCheck, color: "text-[#ec4899]", iconBg: "bg-[#ec4899]/15", iconColor: "text-[#ec4899]", category: "popular", description: "Collect, track, & report data" },
  { id: "overview", viewId: "overview", label: "Box", icon: LayoutDashboard, color: "text-[#d97706]", iconBg: "bg-[#d97706]/15", iconColor: "text-[#d97706]", category: "popular", description: "Track metrics & insights" },
  { id: "table", viewId: "table", label: "Table", icon: Table, color: "text-[#16a34a]", iconBg: "bg-[#16a34a]/15", iconColor: "text-[#16a34a]", category: "more", description: "Structured table format" },
  { id: "whiteboard", viewId: "whiteboard", label: "Whiteboard", icon: Presentation, color: "text-[#ca8a04]", iconBg: "bg-[#ca8a04]/15", iconColor: "text-[#ca8a04]", category: "more", description: "Visualize & brainstorm ideas" },
  { id: "timeline", viewId: "timeline", label: "Timeline", icon: Clock, color: "text-[#f97316]", iconBg: "bg-[#f97316]/15", iconColor: "text-[#f97316]", category: "more", description: "See tasks by start & due date" },
  { id: "activity", viewId: "activity", label: "Activity", icon: Activity, color: "text-[#0891b2]", iconBg: "bg-[#0891b2]/15", iconColor: "text-[#0891b2]", category: "more", description: "Real-time activity feed" },
  { id: "workload", viewId: "workload", label: "Workload", icon: BarChart3, color: "text-[#06b6d4]", iconBg: "bg-[#06b6d4]/15", iconColor: "text-[#06b6d4]", category: "more", description: "Visualize team capacity" },
  { id: "team", viewId: "team", label: "Team", icon: Users, color: "text-[#a855f7]", iconBg: "bg-[#a855f7]/15", iconColor: "text-[#a855f7]", category: "more", description: "Monitor work being done" },
  { id: "website", viewId: "website", label: "Any website", icon: Globe, color: "text-muted-foreground", iconBg: "bg-muted", iconColor: "text-foreground", category: "embed", description: "Embed any page or tool" },
  { id: "sheets", viewId: "sheets", label: "Google Sheets", icon: Table, color: "text-[#16a34a]", iconBg: "bg-[#16a34a]/15", iconColor: "text-[#16a34a]", category: "embed", description: "Connect your spreadsheet" },
];

export const DEFAULT_VIEW_IDS = ["overview", "list", "gantt", "calendar", "table", "board"] as const;

export const CATEGORY_LABELS: Record<string, string> = { popular: "Popular", more: "More views", embed: "Embeds" };

export const STATUS_FILTERS = [
  { id: "in-progress", label: "In progress", active: true },
  { id: "to-do", label: "To do", active: true },
  { id: "done", label: "Done", active: false },
  { id: "blocked", label: "Blocked", active: false },
  { id: "review", label: "Review", active: false },
];

export const VIEW_IDS_STORAGE_KEY = "workspace-active-view-ids";

"use client";

import { useAccountContext } from "@/domains/auth";
import { useProjectQuery } from "../api/projects";
import { 
  Box, 
  Table2, 
  KanbanSquare, 
  LayoutGrid, 
  Plus, 
  ListFilter, 
  ChevronDown, 
  ArrowUpDown, 
  EyeOff, 
  Share2, 
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectDashboard } from "./project-dashboard";

interface ProjectDetailOverviewProps {
  projectId: string;
}

const statusTone: Record<string, string> = {
  "IN PROGRESS": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "PENDING": "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  "READY FOR DEV": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "REVIEW": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "ISSUES FOUND": "bg-red-500/10 text-red-600 dark:text-red-400",
};

// Task data is now mocked inside the TaskTableWidget

export function ProjectDetailOverview({ projectId }: ProjectDetailOverviewProps) {
  const account = useAccountContext();
  const workspaceOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  
  const project = useProjectQuery(workspaceOrganizationId ?? undefined, projectId);

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center px-2 pb-2 border-b border-border dark:border-white/5">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Box className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{project.name || "Project Details"}</h1>
          
          <div className="flex items-center gap-4 ml-6 text-sm font-medium text-muted-foreground">
            <button className="flex items-center gap-1.5 text-primary">
              <Table2 className="h-4 w-4" />
              Table
            </button>
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <KanbanSquare className="h-4 w-4" />
              Board
            </button>
            <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <LayoutGrid className="h-4 w-4" />
              Box
            </button>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Plus className="h-4 w-4" />
              Add view
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between px-2 py-2 text-[13px] font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <ListFilter className="h-4 w-4" />
            Filter
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            Group by: None
            <ChevronDown className="h-3 w-3" />
          </button>
          <button className="hover:text-foreground transition-colors rounded border border-border p-1 dark:border-white/10">
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors rounded border border-border px-2 py-1 dark:border-white/10">
            <EyeOff className="h-3.5 w-3.5" />
            Hide Columns
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors rounded border border-border px-2 py-1 dark:border-white/10">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
          <button className="hover:text-foreground transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto -mx-2 px-2 pb-8">
        <ProjectDashboard projectId={projectId} />
      </div>
    </div>
  );
}

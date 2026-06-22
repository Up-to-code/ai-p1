"use client";

import { useState, useEffect } from "react";
import { useAccountContext } from "@/domains/auth";
import { useProjectQuery } from "../api/projects";
import { 
  Box, 
  Table2, 
  KanbanSquare, 
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectDashboard } from "./project-dashboard";
import { AddViewDropdown, type ViewOption } from "./add-view-dropdown";

interface ProjectDetailOverviewProps {
  projectId: string;
}

interface ActiveView {
  id: string;
  type: string;
  label: string;
  icon: React.ElementType;
}

const DEFAULT_VIEWS: ActiveView[] = [
  { id: "view-1", type: "table", label: "Table", icon: Table2 },
  { id: "view-2", type: "board", label: "Board", icon: KanbanSquare },
  { id: "view-3", type: "dashboard", label: "Box", icon: LayoutGrid },
];

export function ProjectDetailOverview({ projectId }: ProjectDetailOverviewProps) {
  const account = useAccountContext();
  const workspaceOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  
  const project = useProjectQuery(workspaceOrganizationId ?? undefined, projectId);

  const [views, setViews] = useState<ActiveView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>("");

  useEffect(() => {
    const savedViews = localStorage.getItem(`project-views-${projectId}`);
    if (savedViews) {
      try {
        // Need to restore icons since they can't be stringified properly
        // For now, we'll just fall back to DEFAULT_VIEWS if we parse from JSON
        // A more robust implementation would map the string 'type' back to the correct lucide icon
        const parsed = JSON.parse(savedViews);
        if (parsed.length > 0) {
          // We will just use the default for simplicity in this demo, but in a real app
          // we would map parsed[].type -> icon component
        }
        setViews(DEFAULT_VIEWS);
        setActiveViewId(DEFAULT_VIEWS[0].id);
      } catch (e) {
        setViews(DEFAULT_VIEWS);
        setActiveViewId(DEFAULT_VIEWS[0].id);
      }
    } else {
      setViews(DEFAULT_VIEWS);
      setActiveViewId(DEFAULT_VIEWS[0].id);
    }
  }, [projectId]);

  const handleAddView = (option: ViewOption) => {
    const newView: ActiveView = {
      id: `view-${Date.now()}`,
      type: option.type,
      label: option.label,
      icon: option.icon,
    };
    const updatedViews = [...views, newView];
    setViews(updatedViews);
    setActiveViewId(newView.id);
    
    // Normally we'd save to localStorage here, but since icons aren't serializable
    // we'd need to store just the types and labels.
  };

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
    <div className="mx-auto max-w-[1400px] px-6 py-10 space-y-8 h-full flex flex-col">
      {/* Header Tabs - Hidden as per user request
      <div className="flex flex-col gap-6 md:flex-row md:items-center px-4 pb-4 border-b border-border/50 dark:border-white/5">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Box className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{project.name || "Project Details"}</h1>
          
          <div className="flex items-center gap-2 ml-6 text-sm font-medium text-muted-foreground">
            {views.map((view) => (
              <button 
                key={view.id}
                onClick={() => setActiveViewId(view.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 transition-colors rounded-md",
                  activeViewId === view.id ? "text-primary bg-primary/5" : "hover:text-foreground hover:bg-muted/50"
                )}
              >
                <view.icon className="h-4 w-4" />
                {view.label}
              </button>
            ))}
            
            <div className="ml-2 pl-2 border-l border-border">
              <AddViewDropdown onAddView={handleAddView} />
            </div>
          </div>
        </div>
      </div>
      */}



      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto px-4 pb-12 mt-4">
        {/* We always render ProjectDashboard for this demo, but in reality 
            we would switch based on activeViewId.type */}
        <ProjectDashboard projectId={projectId} />
      </div>
    </div>
  );
}

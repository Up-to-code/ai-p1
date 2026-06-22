"use client";

import { useMemo } from "react";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useProjectsIndexQuery } from "../../api/projects";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";

const statusDot: Record<string, string> = {
  planned: "bg-gray-400",
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  completed: "bg-sky-500",
  archived: "bg-gray-300",
};

export function RecentProjectsWidget() {
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const query = useProjectsIndexQuery(orgId);
  const projects = query.results ?? [];

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .slice(0, 5);
  }, [projects]);

  if (recentProjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground/60">
        No projects yet
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="divide-y divide-border/40">
        {recentProjects.map((project) => (
          <WorkspaceLink
            key={project.id}
            href={`/projects/${project.id}`}
            extraParams={{ project: project.id }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
          >
            <span className={cn("h-2 w-2 rounded-full shrink-0", statusDot[project.status] ?? "bg-gray-400")} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{project.status}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${project.progress ?? 0}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{project.progress ?? 0}%</p>
            </div>
          </WorkspaceLink>
        ))}
      </div>
    </div>
  );
}

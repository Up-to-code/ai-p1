"use client";

import { useMemo } from "react";
import { ProgressBar } from "@qentrah/our-platform-components";
import { ColorDot } from "@qentrah/ui";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useProjectsIndexQuery } from "../../api/projects";
import { useAuthSession } from "@/domains/auth";

const statusDot: Record<string, string> = {
  planned: "bg-gray-400",
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  completed: "bg-sky-500",
  archived: "bg-gray-300",
};

export function RecentProjectsWidget() {
  const session = useAuthSession();
  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;
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
            <ColorDot dotClassName={statusDot[project.status] ?? "bg-gray-400"} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{project.status}</p>
            </div>
            <div className="text-right shrink-0">
              <ProgressBar
                value={project.progress ?? 0}
                size="xs"
                className="w-12"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{project.progress ?? 0}%</p>
            </div>
          </WorkspaceLink>
        ))}
      </div>
    </div>
  );
}

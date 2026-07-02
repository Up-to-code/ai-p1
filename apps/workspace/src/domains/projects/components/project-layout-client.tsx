"use client";

import { useProjectQuery } from "@/domains/projects/api/projects";
import { useAuthSession } from "@/domains/auth";
import { ProjectOverviewSidebar } from "./project-overview-sidebar";

interface ProjectLayoutClientProps {
  projectId: string;
  children: React.ReactNode;
}

export function ProjectLayoutClient({ projectId, children }: ProjectLayoutClientProps) {
  const session = useAuthSession();
  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId : undefined;
  const project = useProjectQuery(orgId ?? undefined, projectId);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Main content */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Project overview sidebar — only when project is loaded */}
      {project && (
        <ProjectOverviewSidebar project={project} />
      )}
    </div>
  );
}

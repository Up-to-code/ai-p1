"use client";

import { useAccountContext } from "@/domains/auth";
import type { Project } from "../../../store/projects.types";
import { ProjectDashboard } from "../../project-dashboard";

interface OverviewTabProps {
  project: Project;
}

export function OverviewTab({ project }: OverviewTabProps) {
  const account = useAccountContext();
  const organizationId =
    account.workspace.status === "ready" ? account.workspace.organizationId ?? "" : "";

  if (!organizationId) return null;

  return (
    <div className="h-[calc(100vh-280px)] min-h-[500px]">
      <ProjectDashboard projectId={project.id} />
    </div>
  );
}

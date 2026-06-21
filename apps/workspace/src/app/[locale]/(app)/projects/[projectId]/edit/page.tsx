"use client";

import { use } from "react";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";
import { EditProjectForm } from "@/domains/projects/components/edit-project-form";

export default function ProjectEditPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  const project = useProjectQuery(orgId ?? undefined, projectId);

  if (project === undefined) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm font-medium text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return <EditProjectForm project={project} />;
}

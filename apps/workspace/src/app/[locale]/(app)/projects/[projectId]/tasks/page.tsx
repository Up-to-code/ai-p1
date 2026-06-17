"use client";

import { use } from "react";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";

export default function ProjectTasksPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const account = useAccountContext();
  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  const project = useProjectQuery(orgId ?? undefined, projectId);

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-6 sm:px-6 lg:px-8 border-b border-border dark:border-white/10">
        <h2 className="text-lg font-black">Tasks</h2>
        <p className="text-sm text-muted-foreground">Manage tasks specific to {project?.name || "this project"}.</p>
      </div>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/50 dark:bg-foreground/50">
        {/* Placeholder for scoped Tasks Kanban integration */}
        <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border dark:border-white/10">
          <p className="text-sm font-semibold text-muted-foreground">Task Pipeline (Scoped to Project) goes here.</p>
        </div>
      </div>
    </div>
  );
}

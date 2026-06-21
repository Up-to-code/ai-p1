"use client";

import { use } from "react";
import { usePathname } from "next/navigation";
import { ProjectDetailLayout } from "@/domains/projects/components/detail/project-detail-layout";
import { EditProjectForm } from "@/domains/projects/components/edit-project-form";
import { useProjectQuery } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";

export default function ProjectLayout({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const pathname = usePathname();
  const isEditMode = pathname.endsWith("/edit");

  // For edit page, render standalone form
  if (isEditMode) {
    return <EditPageWrapper projectId={projectId} />;
  }

  // For all other sub-pages (tabs), render the detail layout
  return <ProjectDetailLayout projectId={projectId} />;
}

function EditPageWrapper({ projectId }: { projectId: string }) {
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <EditProjectForm project={project} />
    </div>
  );
}

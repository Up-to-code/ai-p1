import { ReactNode } from "react";
import { ProjectTabs } from "@/domains/projects/components/project-tabs";
import { ProjectLayoutClient } from "@/domains/projects/components/project-layout-client";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top tab navigation */}
      <div className="border-b border-border bg-background px-4 sm:px-6 lg:px-8">
        <ProjectTabs projectId={projectId} />
      </div>

      {/* Main area: tab content + project overview sidebar */}
      <ProjectLayoutClient projectId={projectId}>
        {children}
      </ProjectLayoutClient>
    </div>
  );
}

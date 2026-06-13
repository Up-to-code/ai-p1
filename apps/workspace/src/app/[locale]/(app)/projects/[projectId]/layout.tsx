import { ReactNode } from "react";

import { ProjectTabs } from "@/domains/projects/components/project-tabs";

export default async function ProjectLayout({ children, params }: { children: ReactNode; params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">

      {/* Tabs Navigation */}
      <div className="border-b border-zinc-200 bg-white px-4 dark:border-white/10 dark:bg-zinc-950 sm:px-6 lg:px-8">
        <ProjectTabs projectId={projectId} />
      </div>

      {/* Main Tab Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

import { Suspense } from "react";

import { ProjectsPageRedesigned } from "@/domains/projects/components/ProjectsPageRedesigned";
import { ProjectsPageSkeleton } from "@/domains/projects/components/projects-page-skeleton";

export default function ProjectsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        <Suspense fallback={<ProjectsPageSkeleton />}>
          <ProjectsPageRedesigned />
        </Suspense>
      </main>
    </div>
  );
}

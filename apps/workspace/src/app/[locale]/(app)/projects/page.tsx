import { Suspense } from "react";

import { SpacesRouter } from "@/domains/projects/components/spaces-router";
import { ProjectsPageRedesigned } from "@/domains/projects/components/ProjectsPageRedesigned";

export default function ProjectsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
          <ProjectsPageRedesigned />
        </Suspense>
      </main>
    </div>
  );
}

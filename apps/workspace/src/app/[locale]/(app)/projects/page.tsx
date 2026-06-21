import { Suspense } from "react";

import { ProjectsRouter } from "@/domains/projects/components/projects-router";

export default function ProjectsPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading projects...</div>}>
          <ProjectsRouter />
        </Suspense>
      </main>
    </div>
  );
}

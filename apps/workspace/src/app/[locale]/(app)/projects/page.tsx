import { Suspense } from "react";

import { ProjectListView } from "@/domains/projects/components/project-list-view";

export default function ProjectsPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading projects...</div>}>
          <ProjectListView />
        </Suspense>
      </main>
    </div>
  );
}

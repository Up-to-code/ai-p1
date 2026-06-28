import { Suspense } from "react";
import { SpacesRouter } from "@/domains/projects/components/spaces-router";

export default function SpacesPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <main className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading spaces...</div>}>
          <SpacesRouter />
        </Suspense>
      </main>
    </div>
  );
}

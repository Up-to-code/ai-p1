import { Suspense } from "react";
import { SpacesRouter } from "@/domains/projects/components/spaces-router";

export default function SpacesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading spaces...</div>}>
      <SpacesRouter />
    </Suspense>
  );
}

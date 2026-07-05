"use client";

import { useSearchParams } from "next/navigation";
import { SpaceDetailView } from "./space-detail-view";
import { SpaceList } from "./space-list";

export function SpacesPage() {
  const searchParams = useSearchParams();
  const spaceId = searchParams.get("id");

  if (spaceId) {
    return <SpaceDetailView spaceId={spaceId} />;
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Spaces</h1>
        <p className="text-sm text-muted-foreground">
          Organize your projects into spaces
        </p>
      </div>
      <SpaceList />
    </div>
  );
}

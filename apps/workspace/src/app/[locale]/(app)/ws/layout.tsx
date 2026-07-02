import { Suspense } from "react";
import { WorkspaceHeaderInner } from "@/components/workspace-header/workspace-header";
import { WorkspaceSearchView } from "./_components/workspace-search-view";

function WorkspaceHeader() {
  return (
    <Suspense fallback={<div className="h-[89px] border-b" />}>
      <WorkspaceHeaderInner />
    </Suspense>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full bg-background">
      <div className="flex flex-1 flex-col min-h-0">
        <WorkspaceHeader />
        <div className="flex-1 min-h-0 overflow-auto p-6">
          <WorkspaceSearchView />
          {children}
        </div>
      </div>
    </div>
  );
}

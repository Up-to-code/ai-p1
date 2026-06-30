import { Suspense } from "react";
import { WorkspaceHeaderInner } from "@/components/workspace-header/workspace-header";

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
      <div className="flex flex-1 flex-col">
        <WorkspaceHeader />
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

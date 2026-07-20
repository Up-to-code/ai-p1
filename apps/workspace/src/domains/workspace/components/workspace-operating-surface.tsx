"use client";

import { WorkspaceQueryState } from "@/components/shared/crud-ui";
import { PageLoading } from "@/components/shared/loading/ViewLoading";
import { useAuthSession } from "@/domains/auth";
import { WorkspaceContent } from "./workspace-content";
import { WorkspaceIndex } from "./workspace-index";
import { WorkspaceSurfaceProvider } from "./workspace-surface-provider";

export function WorkspaceOperatingSurface() {
  const session = useAuthSession();

  if (
    session.workspace.status === "loadingSession" ||
    session.workspace.status === "convexAuthLoading"
  ) {
    return <PageLoading showLogo={false} showMessage={false} />;
  }

  if (
    !session.workspace.isReady ||
    !session.workspace.organizationId ||
    !session.user.id
  ) {
    return (
      <WorkspaceQueryState
        status={session.workspace.status as Exclude<typeof session.workspace.status, "ready">}
        variant="dashboard"
      />
    );
  }

  return (
    <WorkspaceSurfaceProvider
      organizationId={session.workspace.organizationId}
      userId={session.user.id}
    >
      <div className="flex h-full min-h-0 overflow-hidden bg-background">
        <WorkspaceIndex />
        <main className="min-w-0 flex-1 overflow-hidden">
          <WorkspaceContent />
        </main>
      </div>
    </WorkspaceSurfaceProvider>
  );
}

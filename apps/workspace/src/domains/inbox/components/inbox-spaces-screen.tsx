"use client";

import { FolderOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceLink } from "@/components/layout/workspace-link";
import { useAuthSession } from "@/domains/auth";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { InboxEmptyState } from "./inbox-empty-state";
import { InboxRouteHeader } from "./inbox-route-header";

export function InboxSpacesScreen() {
  const session = useAuthSession();
  const organizationId =
    session.workspace.status === "ready"
      ? (session.workspace.organizationId ?? undefined)
      : undefined;
  const spaces = useWorkspaceSpacesQuery(organizationId) ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <InboxRouteHeader
        title="All Spaces"
        description="Visible spaces in this organization"
        actions={
          <WorkspaceLink href="/spaces">
            <Button size="sm" className="h-8 gap-2 text-[12px]">
              <Plus className="h-3.5 w-3.5" />
              New Space
            </Button>
          </WorkspaceLink>
        }
      />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_280px] overflow-hidden">
        <main className="min-h-0 overflow-auto p-4">
          <div className="mb-3 flex h-9 items-center justify-between gap-3">
            <button className="text-[12px] text-muted-foreground" type="button">
              Date created
            </button>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              Search
            </div>
          </div>
          {spaces.length === 0 ? (
            <InboxEmptyState
              icon={FolderOpen}
              title="No visible spaces"
              description="Spaces that you have access to will appear here."
            />
          ) : (
            <div className="grid gap-2">
              {spaces.map((space) => (
                <WorkspaceLink
                  key={space.id}
                  href={`/spaces/${space.id}`}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-3 hover:bg-muted/40"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold text-white"
                      style={{ backgroundColor: space.color || "hsl(var(--primary))" }}
                    >
                      {space.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate text-[13px] font-medium text-foreground">
                      {space.name}
                    </span>
                  </span>
                  <span className="text-[11px] capitalize text-muted-foreground">
                    {space.visibility}
                  </span>
                </WorkspaceLink>
              ))}
            </div>
          )}
        </main>
        <aside className="border-l border-border p-4">
          <h3 className="text-[13px] font-semibold text-foreground">
            Visible Spaces
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Spaces shown in your left sidebar.
          </p>
          <div className="mt-4 grid gap-2">
            {spaces.map((space) => (
              <WorkspaceLink
                key={space.id}
                href={`/spaces/${space.id}`}
                className="flex items-center gap-2 text-[12px] text-foreground"
              >
                <span
                  className="h-5 w-5 rounded"
                  style={{ backgroundColor: space.color || "hsl(var(--primary))" }}
                />
                <span className="truncate">{space.name}</span>
              </WorkspaceLink>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

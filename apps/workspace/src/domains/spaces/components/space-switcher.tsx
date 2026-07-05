"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Layers, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWorkspaceSpacesQuery } from "@/domains/spaces/api/spaces";
import { useAuthSession } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { SpaceCreateForm } from "./space-create-form";
import { useSidebarRail } from "@/components/layout/sidebar/sidebar-rail-context";

export function SpaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const session = useAuthSession();
  const { spaceSlug, setSpace } = useNavigation();
  const { openRailItem } = useSidebarRail();

  const orgId =
    session.workspace.status === "ready"
      ? session.workspace.organizationId ?? undefined
      : undefined;

  const spaces = useWorkspaceSpacesQuery(orgId);
  const spaceList = spaces ?? [];
  const isLoading = spaces === undefined;

  const currentSpace = spaceList.find((s) => s.slug === spaceSlug) ?? null;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <div
            role="combobox"
            aria-expanded={open}
            className="flex h-9 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold transition-colors hover:bg-muted w-[200px]"
          >
            <div className="flex items-center gap-2 truncate">
              {isLoading ? (
                <>
                  <Skeleton className="h-5 w-5 rounded shrink-0" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </>
              ) : currentSpace ? (
                <>
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: currentSpace.color ?? "#6b7280" }}
                  />
                  <span className="truncate">{currentSpace.name}</span>
                </>
                ) : (
                  <>
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-foreground dark:bg-white/10 dark:text-muted-foreground">
                      <Layers className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate text-text-muted">All Spaces</span>
                  </>
                )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-2 shadow-xl rounded-xl" align="start">
          <div className="flex flex-col gap-0.5">
            <div className="px-2 pt-1 pb-1 text-xs font-medium text-text-muted">
              Spaces
            </div>

            {isLoading ? (
              <div className="space-y-1 px-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="h-3 w-3 rounded-full shrink-0" />
                    <Skeleton className="h-4 rounded-full" style={{ width: `${60 + i * 12}%` }} />
                  </div>
                ))}
              </div>
            ) : spaceList.length === 0 ? (
              <div className="px-2 py-2 text-sm text-text-muted">No spaces yet</div>
            ) : (
              spaceList.map((space) => (
                <button
                  key={space.id}
                  onClick={() => {
                    setSpace(space.slug);
                    setOpen(false);
                  }}
                  className="flex w-full items-center px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  <div
                    className="me-2 h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: space.color ?? "#6b7280" }}
                  />
                  <span className="truncate">{space.name}</span>
                  {currentSpace?.id === space.id && (
                    <Check className="ms-auto h-4 w-4" />
                  )}
                </button>
              ))
            )}

            <div className="border-t border-border my-1" />
            <button
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <Plus className="h-4 w-4" />
              Create New Space
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <SpaceCreateForm open={createOpen} onOpenChange={setCreateOpen} onAfterCreate={() => openRailItem("spaces")} />
    </>
  );
}

"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Layers, Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useCurrentSpace } from "@/domains/projects/hooks/use-current-space";
import { useSpacesQuery } from "@/domains/projects/api/spaces";
import { useAccountContext } from "@/domains/auth";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SpaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const account = useAccountContext();

  const projectId = useCurrentProjectId();
  const currentSpace = useCurrentSpace();

  const orgId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

  const spaces = useSpacesQuery(orgId, projectId ?? undefined);
  const spaceList = spaces ?? [];
  const isLoading = spaces === undefined;

  const isGlobal = !currentSpace;

  const switchSpace = React.useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set("space", slug);
      } else {
        params.delete("space");
      }
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}` as never);
      setOpen(false);
    },
    [router, pathname, searchParams],
  );

  // Don't render when not inside a project
  if (!projectId) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div
          role="combobox"
          aria-expanded={open}
          className="flex h-9 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold transition-colors hover:bg-muted w-[180px]"
        >
          <div className="flex items-center gap-2 truncate">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-5 rounded shrink-0" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </>
            ) : isGlobal ? (
              <>
                <div className="flex h-5 w-5 items-center justify-center rounded bg-muted text-foreground dark:bg-white/10 dark:text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span className="truncate">All Spaces</span>
              </>
            ) : (
              <>
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: currentSpace.space.color ?? "#6b7280" }}
                />
                <span className="truncate">{currentSpace.space.name}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-2 shadow-xl rounded-xl" align="start">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => switchSpace(null)}
            className="flex w-full items-center px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
          >
            <Globe className="me-2 h-4 w-4 text-muted-foreground" />
            <span className="truncate">All Spaces</span>
            {isGlobal && <Check className="ms-auto h-4 w-4" />}
          </button>

          <div className="h-px bg-border my-1" />

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
                onClick={() => switchSpace(space.slug)}
                className="flex w-full items-center px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
              >
                <div
                  className="me-2 h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: space.color ?? "#6b7280" }}
                />
                <span className="truncate">{space.name}</span>
                {currentSpace?.spaceSlug === space.slug && (
                  <Check className="ms-auto h-4 w-4" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

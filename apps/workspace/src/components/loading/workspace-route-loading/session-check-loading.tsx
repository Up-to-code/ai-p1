import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceShellSkeleton } from "../workspace-shell-skeleton";

const MAIN_CARD_ITEMS = [0, 1, 2];
const TIMELINE_ITEMS = [0, 1, 2, 3];

export function SessionCheckLoading() {
  return (
    <WorkspaceShellSkeleton>
      <div className="mx-auto max-w-[1400px] space-y-6 p-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-9 w-72 max-w-full rounded-full" />
          <Skeleton className="h-4 w-96 max-w-full rounded-full" />
        </div>
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[24px] border border-border bg-surface p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-36 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {MAIN_CARD_ITEMS.map((item) => (
                <Skeleton className="h-[232px] rounded-[20px]" key={item} />
              ))}
            </div>
          </section>
          <section className="rounded-[24px] border border-border bg-surface p-5 xl:sticky xl:top-6">
            <Skeleton className="mb-5 h-5 w-40 rounded-full" />
            <div className="space-y-4">
              {TIMELINE_ITEMS.map((item) => (
                <div className="grid grid-cols-[54px_minmax(0,1fr)_32px] items-center gap-3" key={item}>
                  <Skeleton className="h-12 rounded-full" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton className="h-3 w-4/5 rounded-full" />
                    <Skeleton className="h-2.5 w-1/2 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </WorkspaceShellSkeleton>
  );
}

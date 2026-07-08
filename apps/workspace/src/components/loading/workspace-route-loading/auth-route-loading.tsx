import { Skeleton } from "@/components/ui/skeleton";
import type { AuthRouteLoadingMode } from "./types";

const GRID_ROWS = Array.from({ length: 8 }, (_, index) => index);
const GRID_COLUMNS = Array.from({ length: 12 }, (_, index) => index);

export function AuthRouteLoading({ mode = "sign-in" }: { mode?: AuthRouteLoadingMode }) {
  const isSignUp = mode === "sign-up";
  const isAppleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === "true";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[oklch(97.5%_0.006_255)] text-foreground dark:bg-[oklch(8.5%_0.012_255)]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30 dark:invert-canvas lg:h-[800px] lg:w-[800px]">
        <Skeleton className="h-full w-full rounded-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        {GRID_ROWS.map((i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {GRID_COLUMNS.map((i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[min(420px,calc(100vw-2rem))] min-w-0 text-start">
            <div className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="space-y-3">
              <Skeleton className={`h-9 rounded-full ${isSignUp ? "w-72" : "w-64"}`} />
              <Skeleton className="h-4 w-80 max-w-full rounded-full" />
            </div>

            <div className={`mt-8 grid gap-3 ${isAppleAuthEnabled ? "sm:grid-cols-2" : ""}`}>
              <Skeleton className="h-12 rounded-2xl" />
              {isAppleAuthEnabled ? <Skeleton className="h-12 rounded-2xl" /> : null}
            </div>

            <div className="my-6 flex items-center gap-3">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3 w-6 rounded-full" />
              <Skeleton className="h-px flex-1" />
            </div>

            <div className="space-y-4">
              {isSignUp ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SkeletonField labelWidth="w-16" />
                  <SkeletonField labelWidth="w-14" />
                </div>
              ) : null}

              <SkeletonField labelWidth="w-10" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>

            <div className="mt-5 space-y-2">
              <Skeleton className="mx-auto h-3 w-72 max-w-full rounded-full" />
              <Skeleton className="mx-auto h-3 w-56 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SkeletonField({ labelWidth }: { labelWidth: string }) {
  return (
    <div className="space-y-2">
      <Skeleton className={`h-3 rounded-full ${labelWidth}`} />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}

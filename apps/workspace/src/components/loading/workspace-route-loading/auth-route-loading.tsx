import { BrandMark } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuthRouteLoadingMode } from "./types";

export function AuthRouteLoading({ mode = "sign-in" }: { mode?: AuthRouteLoadingMode }) {
  const isSignUp = mode === "sign-up";
  const isAppleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === "true";

  return (
    <main
      aria-busy="true"
      className="relative min-h-[100dvh] overflow-hidden bg-white text-foreground dark:bg-[oklch(10%_0.008_260)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_10%_-30%,rgba(255,184,150,0.55),transparent_43%),radial-gradient(ellipse_at_43%_-25%,rgba(255,160,207,0.48),transparent_42%),radial-gradient(ellipse_at_86%_-20%,rgba(141,198,255,0.5),transparent_45%)] dark:opacity-40"
      />

      <div className="relative flex min-h-[100dvh] flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5">
            <BrandMark className="h-6 w-6" priority />
            <Skeleton className="h-3.5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-20 rounded-full" />
        </header>

        <div className="flex flex-1 items-center justify-center py-12 sm:py-16">
          <div className="w-full max-w-[368px] min-w-0">
            <div className="mb-6 flex justify-center">
              <BrandMark className="h-9 w-9" priority />
            </div>

            <div className="space-y-2 text-center">
              <Skeleton className={`mx-auto h-7 rounded-full ${isSignUp ? "w-48" : "w-36"}`} />
              <Skeleton className="mx-auto h-4 w-64 max-w-full rounded-full" />
            </div>

            <div className={`mt-7 grid gap-2.5 ${isAppleAuthEnabled ? "sm:grid-cols-2" : ""}`}>
              <Skeleton className="h-11 rounded-md" />
              {isAppleAuthEnabled ? <Skeleton className="h-11 rounded-md" /> : null}
            </div>

            <div className="my-5 flex items-center gap-3">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3 w-5 rounded-full" />
              <Skeleton className="h-px flex-1" />
            </div>

            <div className="space-y-3">
              {isSignUp ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <SkeletonField labelWidth="w-14" />
                  <SkeletonField labelWidth="w-12" />
                </div>
              ) : null}

              <SkeletonField labelWidth="w-10" />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-14 rounded-full" />
                  <Skeleton className="h-3 w-20 rounded-full" />
                </div>
                <Skeleton className="h-11 w-full rounded-md" />
              </div>
              <Skeleton className="h-11 w-full rounded-md" />
            </div>

            <div className="mt-5 space-y-2">
              <Skeleton className="mx-auto h-3 w-64 max-w-full rounded-full" />
              <Skeleton className="mx-auto h-3 w-44 rounded-full" />
            </div>
          </div>
        </div>

        <Skeleton className="mx-auto h-3 w-16 rounded-full" />
      </div>
    </main>
  );
}

function SkeletonField({ labelWidth }: { labelWidth: string }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className={`h-3 rounded-full ${labelWidth}`} />
      <Skeleton className="h-11 w-full rounded-md" />
    </div>
  );
}

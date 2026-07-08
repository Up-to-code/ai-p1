import { Skeleton } from "@/components/ui/skeleton";
import { BrandLoader } from "./brand-loader";

const STEP_ITEMS = [0, 1, 2];
const FIELD_ITEMS = [0, 1, 2, 3];

export function OnboardingRouteLoading() {
  return (
    <main className="min-h-svh bg-background px-4 py-8 text-text-primary">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10">
        <BrandLoader />
        <div className="flex w-full flex-col items-center gap-8 text-center">
          <div className="space-y-3">
            <Skeleton className="mx-auto h-8 w-80 max-w-full rounded-full" />
            <Skeleton className="mx-auto h-4 w-96 max-w-full rounded-full" />
            <Skeleton className="mx-auto h-4 w-72 max-w-full rounded-full" />
          </div>
          <div className="flex items-center gap-10">
            {STEP_ITEMS.map((item) => (
              <Skeleton className="h-10 w-10 rounded-full" key={item} />
            ))}
          </div>
        </div>
        <div className="w-full rounded-[24px] border border-border bg-background p-6">
          <div className="space-y-5">
            <Skeleton className="h-6 w-52 rounded-full" />
            <Skeleton className="h-4 w-80 max-w-full rounded-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELD_ITEMS.map((item) => (
                <Skeleton className="h-12 rounded-2xl" key={item} />
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <Skeleton className="h-10 w-28 rounded-2xl" />
            <Skeleton className="h-10 w-40 rounded-2xl bg-text-primary/15 dark:bg-white/20" />
          </div>
        </div>
      </div>
    </main>
  );
}

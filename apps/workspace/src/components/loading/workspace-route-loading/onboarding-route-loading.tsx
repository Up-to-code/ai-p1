import { Skeleton } from "@/components/ui/skeleton";
import { BrandLoader } from "./brand-loader";

const FIELD_ITEMS = [0, 1, 2, 3];

export function OnboardingRouteLoading() {
  return (
    <main className="min-h-svh bg-[#050607] px-6 py-6 text-white sm:px-10 sm:py-8 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-7xl flex-col">
        <div className="flex items-center justify-between">
          <BrandLoader />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex flex-1 items-center py-12 sm:py-16">
          <div className="w-full space-y-8">
            <div className="space-y-3">
              <Skeleton className="h-8 w-80 max-w-full rounded-full" />
              <Skeleton className="h-4 w-96 max-w-full rounded-full" />
            </div>
            <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
              {FIELD_ITEMS.map((item) => (
                <Skeleton className="h-12 rounded-full" key={item} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5 pb-2">
          <Skeleton className="h-1 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}

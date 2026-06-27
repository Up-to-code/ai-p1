import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="h-full bg-background p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-9 w-72 max-w-full rounded-full" />
          <Skeleton className="h-4 w-96 max-w-full rounded-full" />
        </div>
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-[24px] border border-border bg-surface p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-36 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <Skeleton className="h-[232px] rounded-[20px]" key={item} />
                ))}
              </div>
            </section>
            <section className="rounded-[24px] border border-border bg-surface p-5">
              <Skeleton className="mb-5 h-5 w-32 rounded-full" />
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div className="flex items-center gap-3" key={item}>
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-2/3 rounded-full" />
                      <Skeleton className="h-2.5 w-1/2 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <section className="rounded-[24px] border border-border bg-surface p-5 xl:sticky xl:top-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <div className="space-y-4">
              {[0, 1, 2, 3].map((item) => (
                <div className="grid grid-cols-[54px_minmax(0,1fr)_32px] items-center gap-3" key={item}>
                  <div className="space-y-2">
                    <Skeleton className="mx-auto h-3 w-9 rounded-full" />
                    <Skeleton className="mx-auto h-1.5 w-1.5 rounded-full" />
                  </div>
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
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

const MAIN_CARD_ITEMS = [0, 1, 2];
const SIDEBAR_ITEMS = [0, 1, 2, 3, 4];
const SETTINGS_ITEMS = [0, 1];
const SUPPORT_ITEMS = [0, 1, 2];
const TIMELINE_ITEMS = [0, 1, 2, 3];

export function SessionCheckLoading() {
  return (
    <div className="flex h-full overflow-hidden bg-background text-text-primary">
      <aside className="relative flex h-screen w-64 shrink-0 flex-col overflow-hidden border-e border-border/50 bg-background">
        <div className="flex h-14 shrink-0 items-center border-b border-border/50 px-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-4 w-28 rounded-full" />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
          {SIDEBAR_ITEMS.map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
          <div className="my-2 h-px bg-border/50" />
          <div className="mb-1 pt-2">
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
          {SUPPORT_ITEMS.map((i) => (
            <Skeleton key={`t-${i}`} className="h-9 w-full rounded-xl" />
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border/50 px-3 py-3">
          {SETTINGS_ITEMS.map((i) => (
            <Skeleton key={`s-${i}`} className="h-9 w-full rounded-xl" />
          ))}
          <div className="mt-2 flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-full" />
              <Skeleton className="h-2.5 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 px-8">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-9 w-[220px] rounded-lg" />
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex flex-1" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="ms-2 border-l border-border/50 ps-4">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 outline-none">
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
                    {MAIN_CARD_ITEMS.map((item) => (
                      <Skeleton className="h-[232px] rounded-[20px]" key={item} />
                    ))}
                  </div>
                </section>
              </div>
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
        </main>
      </div>
    </div>
  );
}

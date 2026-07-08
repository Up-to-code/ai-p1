import { Skeleton } from "@/components/ui/skeleton";

const ORGANIZATION_ROWS = [0, 1];

export function ChooseOrganizationRouteLoading() {
  return (
    <main className="min-h-svh bg-[oklch(96.5%_0.008_255)] px-4 py-6 text-foreground dark:bg-[oklch(8.5%_0.012_255)] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-3xl flex-col">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Skeleton className="h-9 w-40 justify-self-start rounded-full" />
          <div className="flex items-center gap-2 justify-self-center">
            <Skeleton className="h-6 w-6 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center gap-7 py-8 sm:py-10">
          <div className="max-w-sm text-center">
            <Skeleton className="mx-auto h-3 w-20 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-9 w-72 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-4 w-80 max-w-full rounded-full" />
          </div>

          <div className="w-full max-w-[424px] overflow-hidden rounded-3xl border border-border bg-[oklch(99%_0.004_255)] dark:bg-[oklch(13%_0.016_255)]">
            <SectionHeader width="w-32" />
            <div className="divide-y divide-border">
              {ORGANIZATION_ROWS.map((item) => (
                <OrganizationRow key={item} />
              ))}
            </div>
            <SectionHeader width="w-24" />
            <div className="divide-y divide-border">
              <OrganizationRow titleWidth="w-40" subtitleWidth="w-56" />
            </div>
            <div className="bg-background p-5">
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({ width }: { width: string }) {
  return (
    <div className="bg-muted/40 px-5 py-3">
      <Skeleton className={`h-3 rounded-full ${width}`} />
    </div>
  );
}

function OrganizationRow({ titleWidth = "w-2/3", subtitleWidth = "w-1/2" }: { titleWidth?: string; subtitleWidth?: string }) {
  return (
    <div className="flex items-center gap-4 p-5">
      <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className={`h-3 rounded-full ${titleWidth}`} />
        <Skeleton className={`h-2.5 rounded-full ${subtitleWidth}`} />
      </div>
      <Skeleton className="h-4 w-4" />
    </div>
  );
}

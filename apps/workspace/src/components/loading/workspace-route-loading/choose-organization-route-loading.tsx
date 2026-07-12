import { BrandMark } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

const ORGANIZATION_ROWS = [0, 1];

export function ChooseOrganizationRouteLoading() {
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
        <header className="flex h-9 items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark className="h-6 w-6" priority />
            <Skeleton className="h-3.5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-8 w-32 rounded-md" />
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-12 sm:py-16">
          <div className="mb-7 text-center">
            <BrandMark className="mx-auto h-9 w-9" priority />
            <Skeleton className="mx-auto mt-4 h-3 w-16 rounded-full" />
            <Skeleton className="mx-auto mt-2 h-7 w-48 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-4 w-64 max-w-full rounded-full" />
          </div>

          <div className="w-full max-w-[368px] space-y-2.5">
            {ORGANIZATION_ROWS.map((item) => (
              <OrganizationRow key={item} />
            ))}
            <OrganizationRow dashed />
          </div>
        </section>
      </div>
    </main>
  );
}

function OrganizationRow({ dashed = false }: { dashed?: boolean }) {
  return (
    <div className={`flex min-h-[72px] items-center gap-3 rounded-md border px-4 py-3 ${dashed ? "border-dashed border-border" : "border-border bg-white dark:bg-white/5"}`}>
      <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3 rounded-full" />
        <Skeleton className="h-2.5 w-1/2 rounded-full" />
      </div>
    </div>
  );
}

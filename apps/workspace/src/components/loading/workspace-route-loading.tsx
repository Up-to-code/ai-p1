import { BrandMark } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

type WorkspaceRouteLoadingProps = {
  variant?: "auth" | "app" | "onboarding" | "choose-org" | "session";
};

export function WorkspaceRouteLoading({ variant = "app" }: WorkspaceRouteLoadingProps) {
  if (variant === "session") return <SessionCheckLoading />;
  if (variant === "auth") return <AuthRouteLoading />;
  if (variant === "onboarding") return <OnboardingRouteLoading />;
  if (variant === "choose-org") return <ChooseOrganizationRouteLoading />;
  return <AppRouteLoading />;
}

function BrandLoader() {
  return (
    <div className="flex items-center gap-3">
      <BrandMark className="h-7 w-7" priority />
      <Skeleton className="h-4 w-20 rounded-full" />
    </div>
  );
}

function SessionCheckLoading() {
  return (
    <div className="flex h-full overflow-hidden bg-background text-text-primary">
      {/* Skeleton sidebar */}
      <aside className="relative flex h-screen w-64 shrink-0 flex-col overflow-hidden border-e border-border/50 bg-background">
        <div className="flex h-14 shrink-0 items-center border-b border-border/50 px-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <Skeleton className="h-4 w-28 rounded-full" />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
          <div className="my-2 h-px bg-border/50" />
          <div className="mb-1 pt-2">
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
          {[0, 1, 2].map((i) => (
            <Skeleton key={`t-${i}`} className="h-9 w-full rounded-xl" />
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border/50 px-3 py-3">
          {[0, 1].map((i) => (
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

      {/* Skeleton main area */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {/* Skeleton topbar */}
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

        {/* Skeleton content */}
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
                    {[0, 1, 2].map((item) => (
                      <Skeleton className="h-[232px] rounded-[20px]" key={item} />
                    ))}
                  </div>
                </section>
              </div>
              <section className="rounded-[24px] border border-border bg-surface p-5 xl:sticky xl:top-6">
                <Skeleton className="mb-5 h-5 w-40 rounded-full" />
                <div className="space-y-4">
                  {[0, 1, 2, 3].map((item) => (
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

function AuthRouteLoading() {
  return (
    <main className="min-h-svh overflow-hidden bg-background text-text-primary lg:grid lg:grid-cols-2">
      <section className="flex min-h-svh flex-col px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
        <div className="flex items-center justify-between gap-4">
          <BrandLoader />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px] space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-9 w-64 rounded-full" />
              <Skeleton className="h-4 w-80 max-w-full rounded-full" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-px flex-1 rounded-full" />
              <Skeleton className="h-3 w-8 rounded-full" />
              <Skeleton className="h-px flex-1 rounded-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl bg-text-primary/15 dark:bg-text-primary/20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="mx-auto h-3 w-72 max-w-full rounded-full" />
              <Skeleton className="mx-auto h-3 w-44 rounded-full" />
            </div>
          </div>
        </div>
      </section>
      <section className="relative hidden min-h-screen overflow-hidden bg-surface lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_24%,var(--q-bg-tertiary),transparent_34%),linear-gradient(180deg,transparent,var(--q-bg-secondary))] dark:bg-[radial-gradient(circle_at_55%_24%,var(--q-bg-tertiary),transparent_34%),linear-gradient(180deg,transparent,var(--q-bg-secondary))]" />
        <div className="relative flex min-h-screen flex-col justify-between p-10">
          <BrandLoader />
          <div className="max-w-xl space-y-5 pb-8">
            <Skeleton className="h-3 w-64 rounded-full" />
            <Skeleton className="h-14 w-96 max-w-full rounded-2xl" />
            <Skeleton className="h-14 w-80 max-w-full rounded-2xl" />
            <Skeleton className="h-4 w-72 max-w-full rounded-full" />
          </div>
        </div>
      </section>
    </main>
  );
}

function ChooseOrganizationRouteLoading() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background px-4 py-6 text-text-primary sm:px-6 lg:px-10">
      <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <BrandLoader />
          <Skeleton className="h-9 w-40 rounded-full" />
        </header>
        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="max-w-xl space-y-5">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-12 w-80 max-w-full rounded-2xl" />
            <Skeleton className="h-12 w-60 max-w-full rounded-2xl" />
            <Skeleton className="h-4 w-96 max-w-full rounded-full" />
            <Skeleton className="h-4 w-72 max-w-full rounded-full" />
          </div>
          <div className="overflow-hidden rounded-[24px] border border-border bg-background">
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((item) => (
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4" key={item}>
                  <Skeleton className="h-11 w-11 rounded-2xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3 rounded-full" />
                    <Skeleton className="h-2.5 w-1/2 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function OnboardingRouteLoading() {
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
            {[0, 1, 2].map((item) => (
              <Skeleton className="h-10 w-10 rounded-full" key={item} />
            ))}
          </div>
        </div>
        <div className="w-full rounded-[24px] border border-border bg-background p-6">
          <div className="space-y-5">
            <Skeleton className="h-6 w-52 rounded-full" />
            <Skeleton className="h-4 w-80 max-w-full rounded-full" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
              <Skeleton className="h-12 rounded-2xl" />
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

function AppRouteLoading() {
  return (
    <div className="min-h-full bg-background p-6 text-text-primary lg:p-10">
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

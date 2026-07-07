import { BrandMark } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

type WorkspaceRouteLoadingProps = {
  variant?: "auth" | "app" | "onboarding" | "choose-org" | "session";
  authMode?: "sign-in" | "sign-up";
};

export function WorkspaceRouteLoading({ variant = "app", authMode = "sign-in" }: WorkspaceRouteLoadingProps) {
  if (variant === "session") return <SessionCheckLoading />;
  if (variant === "auth") return <AuthRouteLoading mode={authMode} />;
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

function AuthRouteLoading({ mode = "sign-in" }: { mode?: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const isAppleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === "true";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[oklch(97.5%_0.006_255)] text-foreground dark:bg-[oklch(8.5%_0.012_255)]">
      {/* Animated Sphere skeleton */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-30 pointer-events-none dark:invert-canvas">
        <Skeleton className="h-full w-full rounded-full" />
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col px-4 py-5 sm:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>

        {/* Center form */}
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[min(420px,calc(100vw-2rem))] min-w-0 text-start">
            {/* Mobile brand (lg:hidden) */}
            <div className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Title + Description */}
            <div className="space-y-3">
              <Skeleton className={`h-9 rounded-full ${isSignUp ? "w-72" : "w-64"}`} />
              <Skeleton className="h-4 w-80 max-w-full rounded-full" />
            </div>

            {/* Social buttons */}
            <div className={`mt-8 grid gap-3 ${isAppleAuthEnabled ? "sm:grid-cols-2" : ""}`}>
              <Skeleton className="h-12 rounded-2xl" />
              {isAppleAuthEnabled ? <Skeleton className="h-12 rounded-2xl" /> : null}
            </div>

            {/* "or" divider */}
            <div className="my-6 flex items-center gap-3">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3 w-6 rounded-full" />
              <Skeleton className="h-px flex-1" />
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              {isSignUp ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-14 rounded-full" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Skeleton className="h-3 w-10 rounded-full" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-3 w-24 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>

              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>

            {/* Legal + Toggle */}
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

function ChooseOrganizationRouteLoading() {
  return (
    <main className="min-h-svh bg-[oklch(96.5%_0.008_255)] px-4 py-6 text-foreground dark:bg-[oklch(8.5%_0.012_255)] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-3xl flex-col">
        {/* Top bar */}
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Skeleton className="h-9 w-40 justify-self-start rounded-full" />
          <div className="flex items-center gap-2 justify-self-center">
            <Skeleton className="h-6 w-6 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </header>

        {/* Center content */}
        <section className="flex flex-1 flex-col items-center justify-center gap-7 py-8 sm:py-10">
          {/* Title section */}
          <div className="max-w-sm text-center">
            <Skeleton className="mx-auto h-3 w-20 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-9 w-72 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-4 w-80 max-w-full rounded-full" />
          </div>

          {/* Card with org list */}
          <div className="w-full max-w-[424px] overflow-hidden rounded-3xl border border-border bg-[oklch(99%_0.004_255)] dark:bg-[oklch(13%_0.016_255)]">
            {/* Org list header */}
            <div className="bg-muted/40 px-5 py-3">
              <Skeleton className="h-3 w-32 rounded-full" />
            </div>

            {/* Org list items */}
            <div className="divide-y divide-border">
              {[0, 1].map((item) => (
                <div className="flex items-center gap-4 p-5" key={item}>
                  <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-2/3 rounded-full" />
                    <Skeleton className="h-2.5 w-1/2 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>

            {/* Create section header */}
            <div className="bg-muted/40 px-5 py-3">
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>

            {/* Create new item */}
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 p-5">
                <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-40 rounded-full" />
                  <Skeleton className="h-2.5 w-56 rounded-full" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </div>

            {/* Continue to workspace button */}
            <div className="bg-background p-5">
              <Skeleton className="h-12 w-full rounded-2xl" />
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

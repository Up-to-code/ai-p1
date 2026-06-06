import { Loader2 } from "lucide-react";
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
    <main className="grid min-h-svh place-items-center bg-[oklch(97.5%_0.006_255)] text-foreground dark:bg-[oklch(8.5%_0.012_255)]">
      <div className="flex flex-col items-center gap-4">
        <BrandMark className="h-8 w-8" priority />
        <Loader2 className="h-6 w-6 animate-spin text-text-secondary" aria-hidden="true" />
        <span className="sr-only">Checking session</span>
      </div>
    </main>
  );
}

function AuthRouteLoading() {
  return (
    <main className="min-h-svh overflow-hidden bg-[oklch(97.5%_0.006_255)] text-foreground dark:bg-[oklch(8.5%_0.012_255)] lg:grid lg:grid-cols-2">
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
              <Skeleton className="h-12 rounded-2xl bg-foreground/15 dark:bg-white/20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="mx-auto h-3 w-72 max-w-full rounded-full" />
              <Skeleton className="mx-auto h-3 w-44 rounded-full" />
            </div>
          </div>
        </div>
      </section>
      <section className="relative hidden min-h-screen overflow-hidden bg-[oklch(91%_0.012_255)] dark:bg-[oklch(12%_0.018_255)] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_24%,oklch(96%_0.018_255),transparent_34%),linear-gradient(180deg,transparent,oklch(97%_0.006_255))] dark:bg-[radial-gradient(circle_at_55%_24%,oklch(24%_0.04_255),transparent_34%),linear-gradient(180deg,transparent,oklch(8.5%_0.012_255))]" />
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
    <main className="relative min-h-svh overflow-hidden bg-[oklch(96.5%_0.008_255)] px-4 py-6 text-foreground dark:bg-[oklch(8.5%_0.012_255)] sm:px-6 lg:px-10">
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
          <div className="overflow-hidden rounded-[28px] border border-border bg-background">
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
    <main className="min-h-svh bg-[oklch(97.5%_0.006_255)] px-4 py-8 text-foreground dark:bg-[oklch(8.5%_0.012_255)]">
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
        <div className="w-full rounded-[28px] border border-border bg-background p-6">
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
            <Skeleton className="h-10 w-40 rounded-2xl bg-foreground/15 dark:bg-white/20" />
          </div>
        </div>
      </div>
    </main>
  );
}

function AppRouteLoading() {
  return (
    <div className="min-h-full bg-background p-6 text-foreground lg:p-10">
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
                  <Skeleton className="h-[232px] rounded-[22px]" key={item} />
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

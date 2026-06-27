"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import type { WorkspaceStatus } from "@/domains/auth";
import { normalizeQueryDebugDetails, type QueryDebugMetadata } from "../query-debug";
import { EmptyWorkspace } from "./status";

type LoadingSkeletonVariant = "grid" | "table" | "pipeline" | "calendar" | "activity" | "dashboard" | "detail";

type HttpQueryStateLike = {
  queryStatus: "idle" | "loading" | "success" | "error";
  errorMessage?: string;
  refetch?: () => unknown;
  timedOut?: boolean;
  debug?: QueryDebugMetadata;
};

export function LoadingState({
  variant = "table",
}: {
  title?: string;
  description?: string;
  variant?: LoadingSkeletonVariant;
}) {
  return <ResourceLoadingSkeleton variant={variant} />;
}

export function ProgressiveLoadingState({
  title,
  description,
  delayMs = 7000,
  debug,
  variant = "table",
}: {
  title?: string;
  description?: string;
  delayMs?: number;
  debug?: QueryDebugMetadata;
  variant?: LoadingSkeletonVariant;
}) {
  const t = useTranslations("Common");
  const [isStalled, setIsStalled] = useState(false);
  const shouldShowDebug = Boolean(debug) && isStalled && process.env.NODE_ENV !== "production";
  const debugDetails = debug ? normalizeQueryDebugDetails(debug, { timedOut: isStalled }) : [];

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsStalled(true), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs]);

  return (
    <div className="space-y-4">
      <ResourceLoadingSkeleton variant={variant} />
      {isStalled && (
        <div className="rounded-[24px] border border-border bg-card p-4 text-start">
          <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
            {t("loadingStillTitle")}
          </h3>
          <p className="mt-2 max-w-md text-xs font-medium uppercase leading-relaxed tracking-tight text-muted-foreground">
            {t("loadingStillDesc")}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest"
            onClick={() => window.location.reload()}
          >
            {t("refresh")}
          </Button>
          {shouldShowDebug && (
            <details className="mt-5 w-full max-w-xl rounded-2xl border border-border bg-card/70 p-4 text-start">
              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("debugDetails")}
              </summary>
              <dl className="mt-4 grid gap-2 text-[11px] font-medium text-muted-foreground sm:grid-cols-2">
                {debugDetails.map((item) => (
                  <div key={item.label} className="min-w-0 rounded-xl bg-muted px-3 py-2">
                    <dt className="truncate text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</dt>
                    <dd className="mt-1 break-all font-mono text-[10px] text-foreground">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkspaceQueryState({
  status,
  variant = "table",
}: {
  status: Exclude<WorkspaceStatus, "ready">;
  variant?: LoadingSkeletonVariant;
}) {
  const t = useTranslations("Common");

  if (status === "loadingSession" || status === "convexAuthLoading") {
    return (
      <ProgressiveLoadingState
        title={status === "convexAuthLoading" ? t("convexAuthLoadingTitle") : undefined}
        description={status === "convexAuthLoading" ? t("convexAuthLoadingDesc") : undefined}
        variant={variant}
      />
    );
  }

  if (status === "noOrganization") {
    return (
      <EmptyWorkspace
        icon={AlertTriangle}
        title={t("noOrganizationTitle")}
        description={t("noOrganizationDesc")}
      />
    );
  }

  return (
    <ErrorState
      title={t("convexAuthFailedTitle")}
      description={t("convexAuthFailedDesc")}
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest"
            onClick={() => window.location.reload()}
          >
            {t("refresh")}
          </Button>
          <a
            href="/sign-in"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("signIn")}
          </a>
        </div>
      }
    />
  );
}

function QueryDebugDetails({
  debug,
  timedOut,
}: {
  debug?: QueryDebugMetadata;
  timedOut?: boolean;
}) {
  const t = useTranslations("Common");
  if (!debug || process.env.NODE_ENV === "production") return null;
  const debugDetails = normalizeQueryDebugDetails(debug, { timedOut });

  return (
    <details className="mt-4 w-full max-w-xl rounded-2xl border border-border bg-card/70 p-4 text-start">
      <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {t("debugDetails")}
      </summary>
      <dl className="mt-4 grid gap-2 text-[11px] font-medium text-muted-foreground sm:grid-cols-2">
        {debugDetails.map((item) => (
          <div key={item.label} className="min-w-0 rounded-xl bg-muted px-3 py-2">
            <dt className="truncate text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</dt>
            <dd className="mt-1 break-all font-mono text-[10px] text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export function HttpQueryState({
  query,
  title,
  description,
  variant = "table",
}: {
  query: HttpQueryStateLike;
  title?: string;
  description?: string;
  variant?: LoadingSkeletonVariant;
}) {
  const t = useTranslations("Common");

  if (query.queryStatus === "error") {
    return (
      <ErrorState
        title={query.timedOut ? t("requestTimedOutTitle") : t("requestFailedTitle")}
        description={query.errorMessage || t("requestFailedDesc")}
        action={
          <div className="flex flex-col items-start">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest"
              onClick={() => void query.refetch?.()}
            >
              {t("tryAgain")}
            </Button>
            <QueryDebugDetails debug={query.debug} timedOut={query.timedOut} />
          </div>
        }
      />
    );
  }

  return (
    <ProgressiveLoadingState
      title={title}
      description={description}
      debug={query.debug}
      variant={variant}
    />
  );
}

function ResourceLoadingSkeleton({ variant }: { variant: LoadingSkeletonVariant }) {
  if (variant === "grid") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((item) => (
          <article key={item} className="overflow-hidden rounded-[24px] border border-border bg-card">
            <Skeleton className="h-44 rounded-none" />
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-xl" />
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (variant === "pipeline") {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((column) => (
          <section key={column} className="min-h-[420px] rounded-[24px] border border-border bg-muted/40 p-3">
            <div className="mb-4 flex items-center justify-between px-2">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2].map((card) => (
                <div key={card} className="rounded-[20px] border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-2xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-28 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-8 rounded-xl" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (variant === "calendar") {
    return (
      <div className="overflow-hidden rounded-[24px] border border-border bg-card" aria-hidden="true">
        <div className="flex items-center justify-between border-b border-border p-5">
          <Skeleton className="h-6 w-36 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-border">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <div key={day} className="border-e border-border p-3 last:border-e-0">
              <Skeleton className="mx-auto h-3 w-12 rounded-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, day) => (
            <div key={day} className="min-h-24 border-e border-t border-border p-3 last:border-e-0">
              <Skeleton className="h-4 w-5 rounded-full" />
              {day % 3 === 0 && <Skeleton className="mt-4 h-6 rounded-lg" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" aria-hidden="true">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => <Skeleton key={item} className="h-40 rounded-[20px]" />)}
            </div>
          </div>
          <TableLoadingSkeleton rows={4} />
        </div>
        <div className="rounded-[24px] border border-border bg-card p-5">
          <Skeleton className="h-5 w-32 rounded-full" />
          <div className="mt-5 space-y-3">
            {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-16 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="space-y-6" aria-hidden="true">
        <section className="rounded-[24px] border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="h-9 w-80 max-w-full rounded-xl" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-8 w-40 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                <Skeleton className="h-9 w-16 rounded-xl" />
                <Skeleton className="h-9 w-16 rounded-xl" />
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_420px]">
            <Skeleton className="aspect-[16/9] min-h-[260px] rounded-[24px]" />
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-24 rounded-2xl" />)}
            </div>
          </div>
        </section>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((tab) => (
            <Skeleton key={tab} className="h-8 w-24 rounded-xl" />
          ))}
        </div>
        <div className="rounded-[24px] border border-border bg-card p-5">
          <Skeleton className="h-5 w-40 rounded-full" />
          <div className="mt-4 flex gap-2">
            {[0, 1, 2, 3].map((filter) => (
              <Skeleton key={filter} className="h-7 w-16 rounded-lg" />
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-24 rounded-[20px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <TableLoadingSkeleton rows={variant === "activity" ? 6 : 5} />;
}

function TableLoadingSkeleton({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-border bg-card" aria-hidden="true">
      <div className="flex items-center gap-10 border-b border-border bg-muted/50 p-4">
        {[0, 1, 2, 3].map((cell) => (
          <Skeleton key={cell} className="h-3 w-20 rounded-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid grid-cols-[minmax(0,1.4fr)_0.8fr_0.7fr_0.5fr] items-center gap-8 border-b border-border p-4 last:border-b-0">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-36 max-w-full rounded-full" />
              <Skeleton className="h-3 w-24 max-w-full rounded-full" />
            </div>
          </div>
          <Skeleton className="h-4 rounded-full" />
          <Skeleton className="h-6 rounded-full" />
          <Skeleton className="h-8 w-8 justify-self-end rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: React.ReactNode;
}) {
  const t = useTranslations('Common');
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50/40 p-6 text-start dark:border-red-900/30 dark:bg-red-950/10">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black uppercase tracking-tight text-red-700 dark:text-red-300">{title || t('errorTitle')}</h3>
          <p className="mt-1 text-xs font-medium uppercase leading-relaxed tracking-tight text-red-600/80 dark:text-red-200/70">{description}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </div>
    </div>
  );
}

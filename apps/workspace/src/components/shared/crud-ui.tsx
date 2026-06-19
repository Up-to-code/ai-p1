"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowLeft, Search, Trash2 } from "lucide-react";
import { AppPrimaryButton } from "@/components/shared";
import { Link } from "@/i18n/routing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WorkspaceStatus } from "@/domains/auth";
import { normalizeQueryDebugDetails, type QueryDebugMetadata } from "./query-debug";

type FieldError = string | undefined;
type HttpQueryStateLike = {
  queryStatus: "idle" | "loading" | "success" | "error";
  errorMessage?: string;
  refetch?: () => unknown;
  timedOut?: boolean;
  debug?: QueryDebugMetadata;
};

type LoadingSkeletonVariant = "grid" | "table" | "pipeline" | "calendar" | "activity" | "dashboard" | "detail";

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral" | "info";
}) {
  const toneClassName = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400",
    neutral: "border-border bg-muted text-muted-foreground",
  }[tone];

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest", toneClassName)}>
      {label}
    </span>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  name = "search",
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const t = useTranslations("Common");
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border border-border bg-muted px-3 focus-within:ring-2 focus-within:ring-ring", className)}>
      <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <input
        aria-label={ariaLabel || t('searchAriaLabel')}
        autoComplete="off"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || t('searchPlaceholder')}
        className="h-9 w-40 border-none bg-transparent text-[10px] font-black uppercase tracking-widest text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function EmptyWorkspace({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-border p-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/40" />
      <h3 className="mt-5 text-sm font-black uppercase tracking-widest text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-xs font-medium uppercase leading-relaxed tracking-tight text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}

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
          <Link
            href="/sign-in"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("signIn")}
          </Link>
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
          <section key={column} className="min-h-[420px] rounded-[28px] border border-border bg-muted/40 p-3">
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
        <section className="rounded-[28px] border border-border bg-card p-5 md:p-6">
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

function ErrorState({
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

export function FormErrorSummary({ errors }: { errors: Record<string, string | undefined> }) {
  const t = useTranslations('Common');
  const messages = Object.values(errors).filter(Boolean);
  if (messages.length === 0) return null;

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4 text-start dark:border-red-900/30 dark:bg-red-950/10" role="alert">
      <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{t('reviewFields')}</p>
      <ul className="mt-2 space-y-1 text-xs font-bold text-red-600/80">
        {messages.slice(0, 4).map((message) => <li key={message}>{message}</li>)}
      </ul>
    </div>
  );
}

export function DetailNotFoundState({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
}) {
  const t = useTranslations('Common');
  return (
    <EmptyWorkspace icon={AlertTriangle} title={title} description={description}>
      <Link href={backHref} className="mt-6 inline-flex h-10 items-center justify-center rounded-xl border border-border px-5 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <ArrowLeft className="me-2 h-3.5 w-3.5" aria-hidden="true" />
        {backLabel || t('backToList')}
      </Link>
    </EmptyWorkspace>
  );
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting = false,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isDeleting?: boolean;
  error?: string | null;
}) {
  const t = useTranslations('Common');
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[28px] border-border bg-card p-6 shadow-none">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-start text-lg font-black uppercase tracking-tight">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-start text-xs font-medium uppercase leading-relaxed tracking-tight">
            {description}
          </AlertDialogDescription>
          {error && <ErrorState description={error} />}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-5 gap-2">
          <AlertDialogCancel className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest">
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-10 rounded-xl bg-red-600 px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? t('deleting') : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FormField({
  id,
  label,
  error,
  children,
  className,
}: {
  id?: string;
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 text-start", className)}>
      <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground rtl:text-right">
        {label}
      </Label>
      {children}
      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-[10px] font-bold text-red-600 rtl:text-right" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete = "off",
  inputMode,
  error,
  className,
}: {
  id?: string;
  name?: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: FieldError;
  className?: string;
}) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <FormField id={inputId} label={label} error={error} className={className}>
      <Input
        id={inputId}
        name={name ?? inputId}
        value={value}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border-border bg-muted/50 px-4 text-sm font-black uppercase tracking-tight shadow-none transition-all focus:border-ring focus:bg-card focus:ring-4 focus:ring-ring rtl:text-right"
      />
    </FormField>
  );
}

function WizardActions({
  onNext,
  onBack,
  nextLabel,
  backLabel,
  isSubmitting = false,
  isFirstStep = false,
  isLastStep = false,
  className,
}: {
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isSubmitting?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  className?: string;
}) {
  const t = useTranslations('Common');
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <AppPrimaryButton 
        onClick={onNext} 
        disabled={isSubmitting} 
        className="h-12 w-full rounded-[20px] shadow-none transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {isLastStep ? t('finish') : (nextLabel || t('next'))}
      </AppPrimaryButton>
      {!isFirstStep && (
        <Button 
          type="button"
          variant="ghost" 
          onClick={onBack} 
          className="h-12 w-full rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          {backLabel || t('back')}
        </Button>
      )}
    </div>
  );
}

function ChoiceGrid<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  columns = "grid-cols-2 md:grid-cols-4",
  error,
}: {
  id?: string;
  label: string;
  value: TValue;
  options: { value: TValue; label: string; icon?: LucideIcon }[];
  onChange: (value: TValue) => void;
  columns?: string;
  error?: FieldError;
}) {
  const groupId = id ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const labelId = `${groupId}-label`;

  return (
    <FormField id={labelId} label={label} error={error}>
      <div id={groupId} className={cn("grid gap-3", columns)} role="radiogroup" aria-labelledby={labelId} aria-describedby={error ? `${labelId}-error` : undefined}>
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex min-h-24 flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-[10px] font-black uppercase tracking-widest transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
              {option.label}
            </button>
          );
        })}
      </div>
    </FormField>
  );
}

export function FormActions({
  onCancel,
  submitLabel,
  isSubmitting = false,
}: {
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}) {
  const t = useTranslations('Common');
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <AppPrimaryButton type="submit" disabled={isSubmitting} className="h-11 px-10 shadow-none">
        {submitLabel || t('save')}
      </AppPrimaryButton>
      <Button 
        type="button" 
        variant="ghost" 
        onClick={onCancel} 
        className="h-11 rounded-xl px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
      >
        {t('cancel')}
      </Button>
    </div>
  );
}

function IconAction({
  label,
  children,
  onClick,
  className,
}: {
  label: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground/40 transition-colors hover:bg-muted hover:text-foreground", className)}
    >
      {children ?? <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
}

export function SelectField<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  error,
  className,
}: {
  id?: string;
  label: string;
  value: TValue;
  options: { value: TValue; label: string; icon?: LucideIcon }[];
  onChange: (value: TValue) => void;
  placeholder?: string;
  error?: FieldError;
  className?: string;
}) {
  return (
    <FormField id={id} label={label} error={error} className={className}>
      <Select value={value} onValueChange={(val) => onChange(val as TValue)}>
        <SelectTrigger id={id} className="h-11 rounded-xl border-border bg-muted/50 px-4 text-sm font-bold shadow-none transition-all focus:border-ring focus:bg-card focus:ring-4 focus:ring-ring rtl:text-right">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="start" className="rounded-xl border-border">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="py-3 px-4 rounded-xl text-xs font-bold">
              <div className="flex items-center gap-2">
                {option.icon && <option.icon className="h-3.5 w-3.5 opacity-50" />}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

export function SegmentedControl<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  error,
  className,
}: {
  id?: string;
  label: string;
  value: TValue;
  options: { value: TValue; label: string; icon?: LucideIcon }[];
  onChange: (value: TValue) => void;
  error?: FieldError;
  className?: string;
}) {
  return (
    <FormField id={id} label={label} error={error} className={className}>
      <div className="flex h-11 w-full gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {options.map((option) => {
          const isActive = option.value === value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all duration-200",
                isActive
                  ? "bg-white text-foreground dark:bg-white/10"
                  : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:text-muted-foreground/40"
              )}
            >
              {Icon && <Icon className="h-3 w-3" />}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </FormField>
  );
}

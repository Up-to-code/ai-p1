"use client";

import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link as LocaleLink } from "@/i18n/routing";
import { StatusPill } from "@/components/shared/crud-ui";
import { useBillingOverview, useBillingUsage } from "@/domains/billing/api/billing";
import { billingDateLabel, subscriptionTone } from "@/domains/billing/billing-view-model";
import { isRtlLocale } from "@/lib/i18n/locale";

import { BillingMeter } from "./billing-meter";

export function OrganizationBillingPanel({
  organizationId,
  locale,
  memberCount,
}: {
  organizationId: string;
  locale: "en" | "ar";
  memberCount: number;
}) {
  const overview = useBillingOverview(organizationId);
  const usage = useBillingUsage(organizationId);
  const isRtl = isRtlLocale(locale);

  if (!organizationId) return null;

  const subscription = overview?.subscription ?? null;
  const plan = overview?.plan ?? null;
  const status = subscription?.status ?? "inactive";
  const isActive = status === "active";

  // Price per seat
  const pricePerUser = plan?.amount ?? 6.99;
  const priceLabel = plan
    ? new Intl.NumberFormat(isRtl ? "ar-EG" : "en-US", {
        style: "currency",
        currency: plan.currency,
        maximumFractionDigits: 2,
      }).format(pricePerUser)
    : "$6.99";
  const totalLabel = new Intl.NumberFormat(isRtl ? "ar-EG" : "en-US", {
    style: "currency",
    currency: plan?.currency ?? "USD",
    maximumFractionDigits: 2,
  }).format(pricePerUser * memberCount);

  const renewalLabel = billingDateLabel(subscription?.currentPeriodEndAt, locale);

  // AI credits
  const credits = usage.status === "ready" ? usage.data.credits : null;
  const creditsGranted = credits?.subscriptionCreditsGranted ?? 0;
  const creditsUsed = credits?.subscriptionCreditsUsed ?? 0;
  const creditsPercent = creditsGranted > 0 ? Math.round((creditsUsed / creditsGranted) * 100) : 0;
  const creditsWarning = creditsPercent >= 80;

  return (
    <div className="max-w-3xl space-y-5">

      {/* ── Current plan card ──────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className={cn("h-1.5", isActive ? "bg-emerald-500" : "bg-[var(--q-accent)]")} />

        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              {isRtl ? "الخطة الحالية" : "Current plan"}
            </p>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {plan?.name ?? "Qentrah Workspace"}
            </h2>
            {/* Per-seat price */}
            <p className="text-sm font-bold text-muted-foreground">
              {priceLabel}
              <span className="ms-1 text-xs text-muted-foreground/60">
                {isRtl ? "/ مستخدم / شهر" : "/ user / month"}
              </span>
            </p>
            {/* Seat total */}
            <p className="text-[10px] font-bold text-[var(--q-accent)]">
              {priceLabel} × {memberCount} {isRtl ? "مستخدم" : memberCount === 1 ? "user" : "users"}{" "}
              = {totalLabel} {isRtl ? "/ شهر" : "/ month"}
            </p>
            {isActive && (
              <p className="text-[10px] font-bold text-muted-foreground">
                {isRtl ? "يجدد في" : "Renews"} {renewalLabel}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <StatusPill label={status} tone={subscriptionTone(status)} />
            <LocaleLink href="/billing">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                <CreditCard className="h-3.5 w-3.5" />
                {isRtl ? "إدارة الفوترة" : "Manage billing"}
              </Button>
            </LocaleLink>
          </div>
        </div>
      </div>

      {/* ── Usage meters ───────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 space-y-6">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          {isRtl ? "الاستخدام" : "Usage"}
        </p>

        {usage.status === "loading" && (
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-2.5 rounded-full" />
          </div>
        )}

        {usage.status === "ready" && (
          <BillingMeter
            label={isRtl ? "رصيد الذكاء الاصطناعي" : "AI credits"}
            value={creditsUsed}
            total={creditsGranted}
            percent={creditsPercent}
            warn={creditsWarning}
            barColor={creditsWarning ? "bg-amber-500" : "bg-[var(--q-accent)]"}
            suffix={isRtl ? "رصيد" : "credits"}
          />
        )}

        <BillingMeter
          label={isRtl ? "أعضاء الفريق" : "Team members"}
          value={memberCount}
          total={undefined}
          percent={0}
          warn={false}
          barColor="bg-[var(--q-accent)]"
          suffix={isRtl ? "عضو" : "members"}
        />
      </div>

      {/* ── Payment history ────────────────────────────── */}
      <LocaleLink href="/usage">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          {isRtl ? "سجل المدفوعات والاستخدام" : "View usage & payment history"}
        </Button>
      </LocaleLink>
    </div>
  );
}


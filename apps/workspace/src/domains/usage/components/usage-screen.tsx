"use client";

import { useState } from "react";
import type React from "react";
import { ArrowUpRight, CheckCircle2, CreditCard, Gauge, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type BillingPlan,
  type BillingPlanId,
  type OrganizationBillingUsage,
  type Payment,
  useBillingUsage,
} from "@/domains/billing/api/billing";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";

type UsageLocale = "en" | "ar";
type UsageTab = "usage" | "payments";

const fmt = new Intl.NumberFormat("en-US");

function usageCopy(locale: UsageLocale) {
  if (locale === "ar") {
    return {
      title: "استخدام المؤسسة",
      subtitle: "رصيد الذكاء الاصطناعي والاستهلاك والمدفوعات.",
      tabs: { usage: "الاستخدام", payments: "المدفوعات" },
      currentPlan: "الخطة الحالية",
      active: "نشطة",
      inactive: "غير نشطة",
      upgradePlan: "ترقية الخطة",
      subscriptionCredits: "رصيد الاشتراك",
      addOnCredits: "الرصيد الإضافي",
      monthlyCredits: "رصيد ضمن الخطة",
      addCredits: "إضافة رصيد",
      loading: "جار تحميل الاستخدام...",
      error: "تعذر تحميل بيانات الاستخدام.",
      noPayments: "لا توجد مدفوعات مسجلة بعد.",
      thInvoice: "الفاتورة",
      thDate: "التاريخ",
      thDescription: "الوصف",
      thAmount: "المبلغ",
      thStatus: "الحالة",
      paymentDescription: "مدفوعات الفوترة",
      statusPaid: "مدفوع",
    };
  }

  return {
    title: "Organization usage",
    subtitle: "AI credits, consumption, and payment records.",
    tabs: { usage: "Usage", payments: "Payments" },
    currentPlan: "Current plan",
    active: "Active",
    inactive: "Inactive",
    upgradePlan: "Upgrade plan",
    subscriptionCredits: "Subscription credits",
    addOnCredits: "Extra credits",
    monthlyCredits: "Included with plan",
    addCredits: "Add credits",
    loading: "Loading usage...",
    error: "Could not load usage data.",
    noPayments: "No payments recorded yet.",
    thInvoice: "Invoice",
    thDate: "Date",
    thDescription: "Description",
    thAmount: "Amount",
    thStatus: "Status",
    paymentDescription: "Billing payment",
    statusPaid: "Paid",
  };
}

const tabs: { id: UsageTab; label: (copy: ReturnType<typeof usageCopy>) => string; icon: typeof Gauge }[] = [
  { id: "usage", label: (copy) => copy.tabs.usage, icon: Gauge },
  { id: "payments", label: (copy) => copy.tabs.payments, icon: CreditCard },
];

export function UsageScreen() {
  const locale = useLocale() as UsageLocale;
  const account = useAccountContext();
  const copy = usageCopy(locale);
  const [activeTab, setActiveTab] = useState<UsageTab>("usage");
  const organizationId = account.workspace.status === "ready" ? account.organization.id : undefined;
  const usage = useBillingUsage(organizationId);

  if (account.workspace.status !== "ready") {
    return (
      <div className="min-h-screen bg-muted/50/50 dark:bg-[#0A0A0A]">
        <WorkspaceQueryState status={account.workspace.status} variant="dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50/50 dark:bg-[#0A0A0A]">
      <div className="border-b border-border bg-white dark:border-white/[0.06] dark:bg-[#111111]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="space-y-2">
            <h1 className="truncate text-2xl font-black uppercase tracking-tight text-foreground">
              {copy.title}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">
              {copy.subtitle}
            </p>
          </div>

          <div className="mt-8 flex items-center gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                    activeTab === tab.id
                      ? "border-foreground bg-muted/50/80 text-foreground dark:border-white dark:bg-white/[0.03]"
                      : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-white/[0.02] dark:hover:text-muted-foreground/40",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {tab.label(copy)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {usage.status === "loading" && <UsageLoadingSkeleton activeTab={activeTab} label={copy.loading} />}
        {usage.status === "error" && <UsageStatePanel message={copy.error} muted={usage.error.message} />}
        {usage.status === "ready" && activeTab === "usage" && (
          <UsageOverviewPanel copy={copy} locale={locale} usage={usage.data} />
        )}
        {usage.status === "ready" && activeTab === "payments" && (
          <PaymentsLedger copy={copy} locale={locale} payments={usage.data.payments} />
        )}
      </div>
    </div>
  );
}

function UsageLoadingSkeleton({ activeTab, label }: { activeTab: UsageTab; label: string }) {
  if (activeTab === "payments") {
    return (
      <div className="max-w-5xl overflow-hidden rounded-2xl border border-border bg-white dark:border-white/[0.06] dark:bg-[#111]" role="status" aria-label={label}>
        <div className="flex items-center gap-10 border-b border-border bg-muted/50 px-5 py-3 dark:border-white/5 dark:bg-white/[0.02]">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-3 w-20 rounded-full" />
          ))}
        </div>
        <div className="divide-y divide-border dark:divide-white/[0.04]">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="grid grid-cols-[1fr_0.8fr_1.5fr_0.7fr_0.6fr] items-center gap-6 px-5 py-4">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-4 w-16 justify-self-end rounded-full" />
              <Skeleton className="h-6 w-20 justify-self-end rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6" role="status" aria-label={label}>
      <div className="rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-6 w-52 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-3 w-36 rounded-full" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
        <div className="space-y-7">
          {[0, 1].map((item) => (
            <div key={item}>
              <div className="flex items-baseline justify-between gap-4">
                <Skeleton className="h-3 w-36 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-3 rounded-full" />
              <Skeleton className="mt-3 h-7 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-9 w-28 rounded-xl" />
    </div>
  );
}

function UsageOverviewPanel({
  copy,
  locale,
  usage,
}: {
  copy: ReturnType<typeof usageCopy>;
  locale: UsageLocale;
  usage: OrganizationBillingUsage;
}) {
  const status = usage.overview.subscription?.status ?? "inactive";
  const credits = usage.credits;
  const planId = (usage.overview.plan.id ?? "qentrah_workspace") as BillingPlanId;
  void planId; // single plan — no upgrade path needed

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              {copy.currentPlan}
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-foreground">
              {usage.overview.plan.name}
            </h2>
            <p className="mt-1 text-sm font-bold text-muted-foreground">
              {planPriceLabel(usage.overview.plan, locale)}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {fmt.format(credits.subscriptionCreditsGranted)} {copy.monthlyCredits}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className={cn(
              "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest",
              status === "active"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-muted text-muted-foreground dark:bg-white/[0.06]",
            )}>
              {status === "active" ? copy.active : copy.inactive}
            </span>
            <Link href="/billing">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                {copy.upgradePlan}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
        <div className="space-y-7">
          <CreditProgress
            label={copy.subscriptionCredits}
            value={credits.subscriptionCreditsUsed}
            total={credits.subscriptionCreditsGranted}
            toneClassName="bg-blue-600"
          />
          <CreditProgress
            label={copy.addOnCredits}
            value={credits.addOnCreditsUsed}
            total={credits.addOnCreditsGranted}
            toneClassName="bg-emerald-500"
          />
        </div>
      </div>

      <Link href="/billing">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Plus className="h-3.5 w-3.5" />
          {copy.addCredits}
        </Button>
      </Link>
    </div>
  );
}

function CreditProgress({
  label,
  value,
  total,
  toneClassName,
}: {
  label: string;
  value: number;
  total: number;
  toneClassName: string;
}) {
  const safeTotal = Math.max(0, total);
  const safeValue = Math.min(safeTotal, Math.max(0, value));
  const percent = safeTotal > 0 ? Math.round((safeValue / safeTotal) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground">
          {label}
        </p>
        <p className="text-xs font-bold tabular-nums text-muted-foreground">
          {fmt.format(safeValue)} / {fmt.format(safeTotal)}
        </p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full rounded-full transition-all duration-500", toneClassName)} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-foreground">
        {percent}%
      </p>
    </div>
  );
}

function PaymentsLedger({
  copy,
  locale,
  payments,
}: {
  copy: ReturnType<typeof usageCopy>;
  locale: UsageLocale;
  payments: Payment[];
}) {
  return (
    <div className="max-w-5xl overflow-hidden rounded-2xl border border-border bg-white dark:border-white/[0.06] dark:bg-[#111]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 dark:border-white/5 dark:bg-white/[0.02]">
              <LedgerHead>{copy.thInvoice}</LedgerHead>
              <LedgerHead>{copy.thDate}</LedgerHead>
              <LedgerHead>{copy.thDescription}</LedgerHead>
              <LedgerHead align="end">{copy.thAmount}</LedgerHead>
              <LedgerHead align="end">{copy.thStatus}</LedgerHead>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm font-bold text-muted-foreground">
                  {copy.noPayments}
                </td>
              </tr>
            ) : payments.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0 dark:border-white/[0.03]">
                <td className="px-5 py-4 font-bold text-foreground">{row.orderId}</td>
                <td className="px-5 py-4 tabular-nums text-muted-foreground">{dateLabel(row.updatedAt, locale)}</td>
                <td className="px-5 py-4 text-foreground/40">{copy.paymentDescription}</td>
                <td className="px-5 py-4 text-end font-bold tabular-nums text-foreground">{moneyLabel(row.amount, row.currency, locale)}</td>
                <td className="px-5 py-4 text-end">
                  <PaymentStatus status={row.status} copy={copy} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentStatus({ status, copy }: { status: Payment["status"]; copy: ReturnType<typeof usageCopy> }) {
  const paid = status === "succeeded";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
      paid
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        : "bg-muted text-muted-foreground dark:bg-white/[0.06]",
    )}>
      {paid && <CheckCircle2 className="h-3 w-3" />}
      {paid ? copy.statusPaid : status}
    </span>
  );
}

function UsageStatePanel({ message, muted }: { message: string; muted?: string }) {
  return (
    <div className="max-w-3xl rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
      <p className="text-sm font-black text-foreground">{message}</p>
      {muted && <p className="mt-2 text-xs font-medium text-muted-foreground">{muted}</p>}
    </div>
  );
}

function LedgerHead({
  align = "start",
  children,
}: {
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  return (
    <th className={cn(
      "px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground",
      align === "end" ? "text-end" : "text-start",
    )}>
      {children}
    </th>
  );
}

function planPriceLabel(plan: BillingPlan, locale: UsageLocale) {
  const interval = plan.periodDays >= 365
    ? locale === "ar" ? "سنة" : "year"
    : locale === "ar" ? "شهر" : "month";
  if (plan.amount === null) return locale === "ar" ? "مخصص / تم البيع" : "Custom / Contact sales";
  return `${moneyLabel(plan.amount, plan.currency, locale)} / ${interval}`;
}

function moneyLabel(amount: number, currency: string, locale: UsageLocale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function dateLabel(timestamp: number, locale: UsageLocale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(timestamp));
}

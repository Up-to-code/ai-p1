"use client";

import { useState } from "react";
import { ArrowUpRight, CreditCard, Gauge, Plus, Zap } from "lucide-react";
import { useLocale } from "next-intl";
import { WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccountContext } from "@/domains/auth";
import { cn } from "@/lib/utils";

type UsageLocale = "en" | "ar";
type UsageTab = "usage" | "payments";

const monthlyCredits = 100_000;
const planCreditsUsed = 68_400;
const extraCredits = 25_000;
const extraCreditsUsed = 8_250;

const fmt = new Intl.NumberFormat("en-US");

const payments = [
  { id: "INV-0047", date: "2026-05-01", description: "Pro plan — May 2026", amount: "SAR 499.00", status: "paid" },
  { id: "INV-0046", date: "2026-04-18", description: "Extra credits top-up", amount: "SAR 125.00", status: "paid" },
  { id: "INV-0045", date: "2026-04-01", description: "Pro plan — Apr 2026", amount: "SAR 499.00", status: "paid" },
  { id: "INV-0044", date: "2026-03-01", description: "Pro plan — Mar 2026", amount: "SAR 499.00", status: "paid" },
  { id: "INV-0043", date: "2026-02-12", description: "Extra credits top-up", amount: "SAR 250.00", status: "paid" },
  { id: "INV-0042", date: "2026-02-01", description: "Pro plan — Feb 2026", amount: "SAR 499.00", status: "paid" },
  { id: "INV-0041", date: "2026-01-01", description: "Pro plan — Jan 2026", amount: "SAR 499.00", status: "paid" },
] as const;

function usageCopy(locale: UsageLocale) {
  if (locale === "ar") {
    return {
      title: "استخدام المؤسسة",
      subtitle: "تقدم استخدام الذكاء الاصطناعي والرصيد الإضافي.",
      tabs: { usage: "الاستخدام", payments: "المدفوعات" },
      aiUsage: "استخدام الذكاء الاصطناعي هذا الشهر",
      extraCredits: "رصيد إضافي",
      addCredits: "إضافة رصيد",
      currentPlan: "خطتك الحالية",
      planName: "باقة مرنة",
      planPrice: "SAR 499 / شهريًا",
      planCredits: "100,000 رصيد شهري",
      upgradePlan: "ترقية الخطة",
      thInvoice: "الفاتورة",
      thDate: "التاريخ",
      thDescription: "الوصف",
      thAmount: "المبلغ",
      thStatus: "الحالة",
      statusPaid: "مدفوع",
    };
  }

  return {
    title: "Organization usage",
    subtitle: "AI usage progress and extra credit balance.",
    tabs: { usage: "Usage", payments: "Payments" },
    aiUsage: "AI usage this month",
    extraCredits: "Extra credits",
    addCredits: "Add credits",
    currentPlan: "Your current plan",
    planName: "Pro plan",
    planPrice: "SAR 499 / month",
    planCredits: "100,000 credits monthly",
    upgradePlan: "Upgrade plan",
    thInvoice: "Invoice",
    thDate: "Date",
    thDescription: "Description",
    thAmount: "Amount",
    thStatus: "Status",
    statusPaid: "Paid",
  };
}

const tabs: { id: UsageTab; label: (copy: ReturnType<typeof usageCopy>) => string; icon: typeof Gauge }[] = [
  { id: "usage", label: (c) => c.tabs.usage, icon: Gauge },
  { id: "payments", label: (c) => c.tabs.payments, icon: CreditCard },
];

export function UsageScreen() {
  const locale = useLocale() as UsageLocale;
  const account = useAccountContext();
  const copy = usageCopy(locale);
  const [activeTab, setActiveTab] = useState<UsageTab>("usage");

  if (account.workspace.status !== "ready") {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0A0A0A]">
        <WorkspaceQueryState status={account.workspace.status} variant="dashboard" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-[#0A0A0A]">
      {/* Header band — same pattern as organization screen */}
      <div className="border-b border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111111]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-2">
              <h1 className="truncate text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                {copy.title}
              </h1>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{copy.subtitle}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-150",
                  activeTab === tab.id
                    ? "border-zinc-900 bg-zinc-50/80 text-zinc-900 dark:border-white dark:bg-white/[0.03] dark:text-white"
                    : "border-transparent text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-white/[0.02] dark:hover:text-zinc-300",
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label(copy)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        {activeTab === "usage" && (
          <div className="max-w-[500px] space-y-10">
            {/* Current plan — pricing-03 card style */}
            <div className="relative overflow-hidden rounded-[1.5rem] border border-blue-500 bg-blue-50/50 p-6 transition duration-300 hover:bg-blue-50/70 dark:border-blue-400/80 dark:bg-blue-500/[0.12] dark:hover:bg-blue-500/[0.16]">
              <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-blue-500" />
              <Badge className="absolute end-6 top-5 rounded-full bg-blue-600 px-3 text-white dark:bg-blue-600 dark:text-white">
                {copy.currentPlan}
              </Badge>
              <h3 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">{copy.planName}</h3>
              <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{copy.planPrice}</p>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">{copy.planCredits}</p>
              <Button variant="outline" size="sm" className="mt-5 gap-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {copy.upgradePlan}
              </Button>
            </div>

            {/* AI usage this month */}
            <CreditProgress
              label={copy.aiUsage}
              value={planCreditsUsed}
              total={monthlyCredits}
              toneClassName="bg-blue-600"
            />

            {/* Extra credits */}
            <div>
              <CreditProgress
                label={copy.extraCredits}
                value={extraCreditsUsed}
                total={extraCredits}
                toneClassName="bg-emerald-500"
              />
              <Button variant="outline" size="sm" className="mt-4 gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Plus className="h-3.5 w-3.5" />
                {copy.addCredits}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.06] dark:bg-[#111]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-white/5 dark:bg-white/[0.02]">
                  <th className="px-5 py-3 text-start text-[10px] font-black uppercase tracking-widest text-zinc-400">{copy.thInvoice}</th>
                  <th className="px-5 py-3 text-start text-[10px] font-black uppercase tracking-widest text-zinc-400">{copy.thDate}</th>
                  <th className="px-5 py-3 text-start text-[10px] font-black uppercase tracking-widest text-zinc-400">{copy.thDescription}</th>
                  <th className="px-5 py-3 text-end text-[10px] font-black uppercase tracking-widest text-zinc-400">{copy.thAmount}</th>
                  <th className="px-5 py-3 text-end text-[10px] font-black uppercase tracking-widest text-zinc-400">{copy.thStatus}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-50 last:border-b-0 dark:border-white/[0.03]">
                    <td className="px-5 py-4 font-bold text-zinc-950 dark:text-white">{row.id}</td>
                    <td className="px-5 py-4 tabular-nums text-zinc-500 dark:text-zinc-400">{row.date}</td>
                    <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">{row.description}</td>
                    <td className="px-5 py-4 text-end font-bold tabular-nums text-zinc-950 dark:text-white">{row.amount}</td>
                    <td className="px-5 py-4 text-end">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        {copy.statusPaid}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  const percent = Math.round((value / total) * 100);

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="text-sm font-black uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="text-sm font-bold tabular-nums text-zinc-500 dark:text-zinc-400">
          {fmt.format(value)} / {fmt.format(total)}
        </p>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full rounded-full transition-all duration-500", toneClassName)} style={{ width: `${percent}%` }} />
      </div>

      <p className="mt-3 text-3xl font-black tracking-tighter text-zinc-950 dark:text-white">{percent}%</p>
    </div>
  );
}

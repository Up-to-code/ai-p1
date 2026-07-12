import { ArrowUpRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { BillingPlanId, OrganizationBillingUsage } from "@/domains/billing/api/billing";
import { Link } from "@/i18n/routing";
import { localeNumberFormatter } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import { type UsageLocale, usagePlanPriceLabel } from "../lib/usage-formatters";
import { CreditProgress } from "./credit-progress";

export function UsageOverviewPanel({
  locale,
  usage,
}: {
  locale: UsageLocale;
  usage: OrganizationBillingUsage;
}) {
  const t = useTranslations("Usage");
  const status = usage.overview.subscription?.status ?? "inactive";
  const credits = usage.credits;
  const planId = (usage.overview.plan.id ?? "qentrah_workspace") as BillingPlanId;
  void planId;

  const intervalLabels = {
    year: t("planInterval.year"),
    month: t("planInterval.month"),
    custom: t("planInterval.custom"),
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              {t("currentPlan")}
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-foreground">
              {usage.overview.plan.name}
            </h2>
            <p className="mt-1 text-sm font-bold text-muted-foreground">
              {usagePlanPriceLabel(usage.overview.plan, locale, intervalLabels)}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {localeNumberFormatter(locale).format(credits.subscriptionCreditsGranted)} {t("monthlyCredits")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                status === "active"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-muted text-muted-foreground dark:bg-white/[0.06]",
              )}
            >
              {status === "active" ? t("active") : t("inactive")}
            </span>
            <Link href="/organization?tab=billing">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                {t("upgradePlan")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
        <div className="space-y-7">
          <CreditProgress
            label={t("subscriptionCredits")}
            value={credits.subscriptionCreditsUsed}
            total={credits.subscriptionCreditsGranted}
            toneClassName="bg-blue-600"
            locale={locale}
          />
          <CreditProgress
            label={t("addOnCredits")}
            value={credits.addOnCreditsUsed}
            total={credits.addOnCreditsGranted}
            toneClassName="bg-emerald-500"
            locale={locale}
          />
        </div>
      </div>

      <Link href="/organization?tab=billing">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addCredits")}
        </Button>
      </Link>
    </div>
  );
}

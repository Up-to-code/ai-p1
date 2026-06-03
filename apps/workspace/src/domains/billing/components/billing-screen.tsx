"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CreditCard, Landmark, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AppPageHeader, AppPageShell, AppSection } from "@/components/shared";
import { LoadingState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAccountContext } from "@/domains/auth";
import { BILLING_PLANS, createTamaraCheckoutRequest, useBillingOverview } from "../api/billing";
import type { BillingPlanId } from "../api/billing";
import { billingDateLabel, billingPriceLabel, billingScreenCopy, subscriptionTone } from "../billing-view-model";

export function BillingScreen() {
  const locale = useLocale() as "en" | "ar";
  const searchParams = useSearchParams();
  const account = useAccountContext();
  const { toast } = useToast();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId : null;
  const overview = useBillingOverview(organizationId);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const isAr = locale === "ar";
  const requestedPlanId: BillingPlanId = searchParams.get("plan") === "saudi_yearly" ? "saudi_yearly" : "saudi_monthly";
  const selectedPlan = requestedPlanId === "saudi_yearly" ? BILLING_PLANS.saudi_yearly : overview?.plan ?? BILLING_PLANS.saudi_monthly;
  const isYearly = selectedPlan.id === "saudi_yearly";
  const copy = billingScreenCopy(locale, isYearly);

  const statusLabel = overview?.subscription?.status ?? "inactive";
  const latestPaymentLabel = overview?.latestPayment
    ? `${overview.latestPayment.status} · ${overview.latestPayment.orderReferenceId}`
    : "No payment yet";

  const price = useMemo(() => billingPriceLabel(selectedPlan, locale), [locale, selectedPlan]);

  async function startCheckout() {
    if (!organizationId || isStartingCheckout) return;
    if (!isYearly) {
      window.location.assign(`/${locale}/dashboard`);
      return;
    }
    setIsStartingCheckout(true);
    try {
      const checkout = await createTamaraCheckoutRequest({ organizationId, locale, planId: selectedPlan.id });
      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      toast({
        title: isAr ? "تعذر إنشاء الدفع" : "Checkout could not start",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        type: "error",
      });
      setIsStartingCheckout(false);
    }
  }

  if (account.workspace.status !== "ready") {
    return (
      <AppPageShell>
        <WorkspaceQueryState status={account.workspace.status} variant="dashboard" />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell contentClassName="space-y-6">
      <AppPageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        actions={<StatusPill label={statusLabel} tone={subscriptionTone(statusLabel)} />}
      />

      {!overview ? (
        <LoadingState variant="detail" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <AppSection className="overflow-hidden" contentClassName="p-0">
            <div className="grid gap-px bg-zinc-100 dark:bg-white/5 md:grid-cols-[1fr_280px]">
              <div className="bg-white p-6 dark:bg-[#0A0A0A] md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">{copy.plan}</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">{price}</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-400">{isYearly ? copy.yearly : copy.monthly}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03]">
                    <CreditCard className="h-5 w-5 text-zinc-500 dark:text-zinc-300" />
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {copy.included.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-bold leading-6 text-zinc-700 dark:text-zinc-200">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between bg-zinc-50 p-6 dark:bg-white/[0.02]">
                <div className="space-y-5">
                  <Metric label={copy.status} value={statusLabel} />
                  <Metric label={copy.activeUntil} value={billingDateLabel(overview.subscription?.currentPeriodEndAt, locale)} />
                  <Metric label={copy.latest} value={latestPaymentLabel} />
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="mt-8 w-full rounded-xl text-xs font-black uppercase tracking-widest"
                  onClick={startCheckout}
                  disabled={isStartingCheckout}
                >
                  {isStartingCheckout ? copy.starting : copy.pay}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          </AppSection>

          <AppSection title="Tamara" tone="muted">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-white/[0.04]">
                <Landmark className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <p className="text-sm font-semibold leading-7 text-zinc-500 dark:text-zinc-400">{copy.secure}</p>
            </div>
          </AppSection>
        </div>
      )}
    </AppPageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-1 break-words text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">{value}</p>
    </div>
  );
}

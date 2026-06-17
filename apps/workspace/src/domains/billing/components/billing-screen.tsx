"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CreditCard, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AppPageHeader, AppPageShell, AppSection } from "@/components/shared";
import { LoadingState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAccountContext } from "@/domains/auth";
import {
  BILLING_PLANS,
  normalizePlanId,
  isYearlyPlan,
  isContactSales,
  useBillingOverview,
} from "../api/billing";
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

  const requestedPlanId: BillingPlanId = normalizePlanId(searchParams.get("plan"));
  const selectedPlan = BILLING_PLANS[requestedPlanId];
  const yearly = isYearlyPlan(requestedPlanId);
  const contactSales = isContactSales(requestedPlanId);
  const copy = billingScreenCopy(locale, requestedPlanId);

  const statusLabel = overview?.subscription?.status ?? "inactive";
  const latestPaymentLabel = overview?.latestPayment
    ? `${overview.latestPayment.status} · ${overview.latestPayment.orderId}`
    : "No payment yet";

  const price = useMemo(() => billingPriceLabel(selectedPlan, locale), [locale, selectedPlan]);

  async function startCheckout() {
    if (!organizationId || isStartingCheckout) return;

    if (contactSales) {
      window.location.assign(`/${locale}/contact`);
      return;
    }

    setIsStartingCheckout(true);
    try {
      // Use the billing API to create checkout and get the URL
      const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organizationId)}/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: requestedPlanId,
          locale,
          returnUrl: window.location.origin + `/${locale}/billing?plan=${requestedPlanId}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Checkout request failed");
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        // For custom plans or if no checkout URL, show contact sales
        window.location.assign(`/${locale}/contact`);
      }
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
            <div className="grid gap-px bg-muted dark:bg-white/5 md:grid-cols-[1fr_280px]">
              <div className="bg-card p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-300">{copy.plan}</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">{price}</h2>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">{yearly ? copy.yearly : copy.monthly}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted">
                    <CreditCard className="h-5 w-5 text-muted-foreground dark:text-muted-foreground/40" />
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {copy.included.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-muted/60 p-4">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-bold leading-6 text-foreground dark:text-muted-foreground/30">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between bg-muted p-6">
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
        </div>
      )}
    </AppPageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-black uppercase tracking-tight text-foreground">{value}</p>
    </div>
  );
}

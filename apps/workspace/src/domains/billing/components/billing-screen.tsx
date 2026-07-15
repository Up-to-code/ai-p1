"use client";

import { useMemo, useState } from "react";
import { Check, CircleAlert, CreditCard, ExternalLink, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { useOrganizationContext } from "@/domains/auth/organization-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BILLING_PLANS, type BillingPlanId } from "../config/plans.config";
import { useBillingUsage, useOrganizationEntitlements } from "../api/billing";
import { useBillingCheckout } from "../hooks/use-billing-checkout";

type Locale = "en" | "ar";
type Cycle = "monthly" | "yearly";

const copy = {
  en: {
    title: "Billing and plan access",
    subtitle: "Plans, seats, usage, invoices, and AI credits for your organization.",
    monthly: "Monthly",
    yearly: "Yearly — save 2 months",
    current: "Current plan",
    choose: "Choose plan",
    contact: "Contact sales",
    owner: "Only the organization owner can change plans or buy AI credits.",
    included: "Includes 3 members",
    extra: "Each additional member is billed at the same plan price.",
    ai: "AI credits / month",
    projects: "Projects",
    automations: "Automations / month",
    usage: "Usage and AI credits",
    purchased: "Purchased credits",
    subscription: "Subscription credits",
    reserved: "Reserved for active runs",
    returnOk: "Checkout returned. Access activates after the signed provider event is verified.",
    grace: "Payment renewal is in its seven-day grace period.",
    free: "Free",
    unlimited: "Unlimited",
    business: "Business",
    enterprise: "Enterprise",
    forever: "forever",
    month: "month",
    year: "year",
    buyCredits: "Buy AI credits",
    buyCreditsHelp: "Purchased credits never expire. Subscription credits are used first.",
    customAmount: "Custom whole-dollar amount ($1–$1,000)",
    portal: "Payment methods, invoices & cancellation",
    cancel: "Cancel at period end",
    undoCancel: "Keep subscription",
    scheduledCancel: "Cancellation is scheduled for the end of the current billing period.",
    scheduledPlan: "A plan change is scheduled for the next billing period.",
    undoPlan: "Undo plan change",
  },
  ar: {
    title: "الفوترة وصلاحيات الخطة",
    subtitle: "الخطط والمقاعد والاستخدام والفواتير ورصيد الذكاء الاصطناعي للمؤسسة.",
    monthly: "شهري",
    yearly: "سنوي — وفر شهرين",
    current: "الخطة الحالية",
    choose: "اختيار الخطة",
    contact: "تواصل مع المبيعات",
    owner: "مالك المؤسسة فقط يمكنه تغيير الخطط أو شراء رصيد الذكاء الاصطناعي.",
    included: "تشمل 3 أعضاء",
    extra: "كل عضو إضافي يُحاسب بسعر الخطة نفسه.",
    ai: "رصيد ذكاء اصطناعي / شهر",
    projects: "المشاريع",
    automations: "عمليات الأتمتة / شهر",
    usage: "الاستخدام ورصيد الذكاء الاصطناعي",
    purchased: "الرصيد المشترى",
    subscription: "رصيد الاشتراك",
    reserved: "محجوز للعمليات النشطة",
    returnOk: "تمت العودة من الدفع. تتفعل الصلاحيات بعد التحقق من حدث مزود الدفع الموقع.",
    grace: "تجديد الدفع ضمن مهلة السماح البالغة سبعة أيام.",
    free: "مجانية",
    unlimited: "غير محدودة",
    business: "أعمال",
    enterprise: "مؤسسات",
    forever: "دائماً",
    month: "شهر",
    year: "سنة",
    buyCredits: "شراء رصيد ذكاء اصطناعي",
    buyCreditsHelp: "الرصيد المشترى لا تنتهي صلاحيته، ويُستخدم رصيد الاشتراك أولاً.",
    customAmount: "مبلغ مخصص بالدولار الكامل (1–1,000 دولار)",
    portal: "وسائل الدفع والفواتير والإلغاء",
    cancel: "الإلغاء في نهاية الفترة",
    undoCancel: "الاحتفاظ بالاشتراك",
    scheduledCancel: "تمت جدولة الإلغاء لنهاية فترة الفوترة الحالية.",
    scheduledPlan: "تمت جدولة تغيير الخطة لفترة الفوترة التالية.",
    undoPlan: "إلغاء تغيير الخطة",
  },
} as const;

function planKey(name: string) {
  if (name.startsWith("Unlimited")) return "unlimited";
  if (name.startsWith("Business")) return "business";
  if (name.startsWith("Enterprise")) return "enterprise";
  return "free";
}

export function BillingScreen({ locale, initialPlan, initialCycle, returnState }: {
  locale: Locale;
  initialPlan?: string;
  initialCycle?: string;
  returnState?: string;
}) {
  const t = copy[locale];
  const organization = useOrganizationContext();
  const [cycle, setCycle] = useState<Cycle>(initialCycle === "yearly" ? "yearly" : "monthly");
  const [creditDollars, setCreditDollars] = useState(5);
  const [creditCheckoutBusy, setCreditCheckoutBusy] = useState(false);
  const entitlements = useOrganizationEntitlements(organization.id);
  const usage = useBillingUsage(organization.id);
  const selectedPlan = initialPlan?.startsWith("better") || initialPlan === "business"
    ? "better"
    : initialPlan?.startsWith("custom") || initialPlan === "enterprise"
      ? "custom"
      : initialPlan === "free"
        ? "free"
        : "good";
  const planIds = useMemo<BillingPlanId[]>(() => [
    "free",
    cycle === "monthly" ? "good_monthly" : "good_yearly",
    cycle === "monthly" ? "better_monthly" : "better_yearly",
    cycle === "monthly" ? "custom_monthly" : "custom_yearly",
  ], [cycle]);
  const checkout = useBillingCheckout({ organizationId: organization.id, effectiveSeats: Math.max(3, entitlements?.usage.members ?? 3), locale });
  const currentPlan = entitlements?.entitlements.configuredPlanId ?? "free";

  async function buyCredits(dollars: number) {
    if (!organization.id || !entitlements?.canManageBilling || creditCheckoutBusy) return;
    setCreditCheckoutBusy(true);
    try {
      const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organization.id)}/billing/credits/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dollars, locale, returnUrl: `${window.location.origin}/${locale}/billing?return=credits` }),
      });
      const result = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "AI credit checkout failed.");
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setCreditCheckoutBusy(false);
      window.alert(error instanceof Error ? error.message : "AI credit checkout failed.");
    }
  }

  async function openCustomerPortal() {
    if (!organization.id || !entitlements?.canManageBilling) return;
    const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organization.id)}/billing/customer-portal`, { method: "POST" });
    const result = await response.json() as { portalUrl?: string; error?: string };
    if (response.ok && result.portalUrl) window.location.assign(result.portalUrl);
    else window.alert(result.error || "Customer portal request failed.");
  }

  async function changeCancellation(cancelAtPeriodEnd: boolean) {
    if (!organization.id || !entitlements?.canManageBilling) return;
    if (cancelAtPeriodEnd && !window.confirm(t.cancel)) return;
    const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organization.id)}/billing/cancellation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cancelAtPeriodEnd }),
    });
    if (!response.ok) {
      const result = await response.json() as { error?: string };
      window.alert(result.error || "Subscription cancellation request failed.");
    } else window.location.reload();
  }

  async function schedulePlan(planId: BillingPlanId | null) {
    if (!organization.id || !entitlements?.canManageBilling) return;
    const response = await fetch(`/api/v1/organizations/${encodeURIComponent(organization.id)}/billing/scheduled-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (!response.ok) {
      const result = await response.json() as { error?: string };
      window.alert(result.error || "Scheduled plan request failed.");
    } else window.location.reload();
  }

  function choosePlan(id: BillingPlanId) {
    const target = BILLING_PLANS[id];
    if (currentPlan === "better" && target.planId === "good") return schedulePlan(id);
    return checkout.startCheckout(id);
  }

  return (
    <main dir={locale === "ar" ? "rtl" : "ltr"} className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1>
          <p className="mt-2 text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end"><div className="flex rounded-lg border bg-muted p-1" role="group" aria-label="Billing cycle">
          {(["monthly", "yearly"] as const).map((value) => (
            <Button key={value} size="sm" variant={cycle === value ? "secondary" : "ghost"} onClick={() => setCycle(value)}>
              {value === "monthly" ? t.monthly : t.yearly}
            </Button>
          ))}
        </div>{currentPlan !== "free" && <Button variant="outline" size="sm" disabled={!entitlements?.canManageBilling} onClick={openCustomerPortal}>{t.portal}<ExternalLink className="size-4" /></Button>}</div>
      </div>

      {returnState && <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"><ShieldCheck className="mt-0.5 size-4" />{t.returnOk}</div>}
      {entitlements?.entitlements.status === "past_due" && <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm"><CircleAlert className="mt-0.5 size-4" />{t.grace}</div>}
      {usage.status === "ready" && usage.data.overview.subscription?.cancelAtPeriodEnd && <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm"><span>{t.scheduledCancel}</span><Button size="sm" variant="outline" onClick={() => changeCancellation(false)}>{t.undoCancel}</Button></div>}
      {usage.status === "ready" && usage.data.overview.subscription?.scheduledPlanId && <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm"><span>{t.scheduledPlan} {BILLING_PLANS[usage.data.overview.subscription.scheduledPlanId].name}</span><Button size="sm" variant="outline" onClick={() => schedulePlan(null)}>{t.undoPlan}</Button></div>}
      {entitlements && !entitlements.canManageBilling && <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">{t.owner}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {planIds.map((id) => {
          const plan = BILLING_PLANS[id];
          const key = planKey(plan.name) as keyof typeof t;
          const planId = plan.planId;
          const isCurrent = currentPlan === planId;
          const highlighted = selectedPlan === planId;
          return (
            <Card key={id} className={highlighted ? "border-primary shadow-sm" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{t[key]}</CardTitle>
                  {isCurrent && <Badge>{t.current}</Badge>}
                </div>
                <CardDescription className="min-h-12">
                  {plan.amount === null ? t.contact : plan.amount === 0 ? `$0 / ${t.forever}` : `$${plan.amount} / ${cycle === "monthly" ? t.month : t.year}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><Check className="size-4 text-primary" />{t.included}</li>
                  <li className="flex gap-2"><Check className="size-4 text-primary" />{plan.access.projectLimit ?? "∞"} {t.projects}</li>
                  <li className="flex gap-2"><Sparkles className="size-4 text-primary" />{plan.access.aiCreditLimit.toLocaleString(locale)} {t.ai}</li>
                  <li className="flex gap-2"><Check className="size-4 text-primary" />{plan.access.automationRuns.toLocaleString(locale)} {t.automations}</li>
                </ul>
                {plan.amount !== null && plan.amount > 0 && <p className="text-xs text-muted-foreground">{t.extra}</p>}
                {plan.checkoutMode === "contact_sales" && plan.planId === "custom" ? (
                  <Button className="w-full" variant="outline" render={<a href="mailto:sales@qentrah.com" />}>{t.contact}<ExternalLink className="size-4" /></Button>
                ) : plan.planId !== "free" ? (
                  <Button className="w-full" disabled={isCurrent || !entitlements?.canManageBilling || checkout.isStartingCheckout} onClick={() => choosePlan(id)}>{isCurrent ? t.current : t.choose}</Button>
                ) : <Button className="w-full" disabled variant="outline">{isCurrent ? t.current : t.free}</Button>}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t.usage}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {([
            [t.subscription, usage.status === "ready" ? usage.data.credits.subscriptionCreditsRemaining : 0, Sparkles],
            [t.purchased, usage.status === "ready" ? usage.data.credits.addOnCreditsRemaining : 0, CreditCard],
            [t.reserved, usage.status === "ready" ? usage.data.credits.reservedCredits ?? 0 : 0, ShieldCheck],
          ] satisfies Array<readonly [string, number, LucideIcon]>).map(([label, value, Icon]) => (
            <Card key={String(label)}><CardContent className="flex items-center gap-3 p-5"><Icon className="size-5 text-primary" /><div><p className="text-sm text-muted-foreground">{label as string}</p><p className="text-2xl font-semibold">{Number(value).toLocaleString(locale)}</p></div></CardContent></Card>
          ))}
        </div>
      </section>

      {entitlements?.entitlements.canPurchaseCredits && (
        <section className="space-y-4">
          <div><h2 className="text-xl font-semibold">{t.buyCredits}</h2><p className="text-sm text-muted-foreground">{t.buyCreditsHelp}</p></div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[5, 15, 50].map((dollars) => <Button key={dollars} variant="outline" disabled={!entitlements.canManageBilling || creditCheckoutBusy} onClick={() => buyCredits(dollars)}>${dollars} · {(dollars * 1_000).toLocaleString(locale)} credits</Button>)}
          </div>
          <Card><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end"><label className="flex-1 space-y-2"><span className="text-sm font-medium">{t.customAmount}</span><Input type="number" min={1} max={1000} step={1} value={creditDollars} onChange={(event) => setCreditDollars(Math.max(1, Math.min(1_000, Math.floor(Number(event.target.value) || 1))))} /></label><Button disabled={!entitlements.canManageBilling || creditCheckoutBusy} onClick={() => buyCredits(creditDollars)}>{t.buyCredits}</Button></CardContent></Card>
        </section>
      )}
      {currentPlan !== "free" && entitlements?.canManageBilling && usage.status === "ready" && !usage.data.overview.subscription?.cancelAtPeriodEnd && <div className="border-t pt-6"><Button variant="destructive" onClick={() => changeCancellation(true)}>{t.cancel}</Button></div>}
    </main>
  );
}

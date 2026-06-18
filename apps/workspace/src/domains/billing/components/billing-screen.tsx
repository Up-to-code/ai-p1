"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { useLocale } from "next-intl";
import { AppPageShell } from "@/components/shared";
import { LoadingState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAccountContext } from "@/domains/auth";
import {
  QENTRAH_PLAN,
  PRICE_PER_SEAT,
  useBillingOverview,
} from "../api/billing";
import {
  billingDateLabel,
  billingScreenCopy,
  seatTotalLabel,
  subscriptionTone,
} from "../billing-view-model";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { listOrganizationMembers } from "@/domains/organization/api/clerk-organization-api";

export function BillingScreen() {
  const locale = useLocale() as "en" | "ar";
  const searchParams = useSearchParams();
  const account = useAccountContext();
  const { toast } = useToast();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId : null;
  const overview = useBillingOverview(organizationId);
  const isAr = locale === "ar";
  const copy = billingScreenCopy(locale);

  // ── Seat count from URL (?seats=N) or member count ─────────────────────────
  const seatsFromUrl = searchParams.get("seats");
  const urlSeats = seatsFromUrl ? Math.max(1, parseInt(seatsFromUrl, 10) || 1) : null;

  // ── Fetch current member count to pre-fill seat count ──────────────────────
  const membersQuery = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId!),
    enabled: Boolean(organizationId),
  });
  const currentMemberCount = Math.max(1, membersQuery.data?.length ?? 1);

  // ── Seat counter: URL param > member count ─────────────────────────────────
  // Initialise once from URL; user can adjust freely after that
  const [seats, setSeats] = useState<number | null>(urlSeats);
  const effectiveSeats = seats ?? currentMemberCount;
  const totalPerMonth = useMemo(
    () => seatTotalLabel(effectiveSeats, locale),
    [effectiveSeats, locale],
  );
  const pricePerSeat = useMemo(
    () =>
      new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", {
        style: "currency",
        currency: QENTRAH_PLAN.currency,
        maximumFractionDigits: 2,
      }).format(PRICE_PER_SEAT),
    [isAr],
  );

  function incrementSeats() {
    setSeats((s) => (s ?? currentMemberCount) + 1);
  }
  function decrementSeats() {
    setSeats((s) => Math.max(1, (s ?? currentMemberCount) - 1));
  }

  // ── Subscription state ─────────────────────────────────────────────────────
  const status = overview?.subscription?.status ?? "inactive";
  const isActive = status === "active";

  // ── Checkout ───────────────────────────────────────────────────────────────
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  async function startCheckout() {
    if (!organizationId || isStartingCheckout) return;
    setIsStartingCheckout(true);
    try {
      const response = await fetch(
        `/api/v1/organizations/${encodeURIComponent(organizationId)}/billing/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: "qentrah_workspace",
            seats: effectiveSeats,
            locale,
            returnUrl:
              window.location.origin +
              `/${locale}/billing`,
          }),
        },
      );
      if (!response.ok) throw new Error("Checkout request failed");
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        toast({
          title: isAr ? "لم يتم إنشاء رابط الدفع" : "No checkout URL returned",
          description: isAr
            ? "حاول مرة أخرى أو تواصل مع الدعم."
            : "Try again or contact support.",
          type: "error",
        });
        setIsStartingCheckout(false);
      }
    } catch (error) {
      toast({
        title: isAr ? "تعذر إنشاء الدفع" : "Checkout could not start",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
        type: "error",
      });
      setIsStartingCheckout(false);
    }
  }

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (account.workspace.status !== "ready") {
    return (
      <AppPageShell>
        <WorkspaceQueryState status={account.workspace.status} variant="dashboard" />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell>
      <div className="mx-auto max-w-xl space-y-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-accent)]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {copy.ownerNote}
          </p>
        </div>

        {/* ── Org badge ───────────────────────────────────────── */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--q-accent)]/10">
            <Users className="h-4 w-4 text-[var(--q-accent)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-foreground">
              {account.organization.name}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {isAr ? "المؤسسة التي ستُفوتَّر" : "Organization being billed"}
            </p>
          </div>
          {overview && (
            <StatusPill label={status} tone={subscriptionTone(status)} />
          )}
        </div>

        {/* ── Plan card ───────────────────────────────────────── */}
        {!overview ? (
          <LoadingState variant="detail" />
        ) : (
          <div className="overflow-hidden rounded-2xl border-2 border-[var(--q-accent)] bg-card shadow-lg">
            <div className="h-1.5 bg-[var(--q-accent)]" />

            <div className="space-y-6 p-6 md:p-8">
              {/* Plan name + per-seat price */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--q-accent)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--q-accent)]">
                    <Zap className="h-3 w-3" />
                    {copy.plan}
                  </span>
                  <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                    <span className="text-4xl font-black tracking-tight text-foreground">
                      {pricePerSeat}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {copy.perSeat}
                    </span>
                  </div>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--q-accent)]/10">
                  <CreditCard className="h-6 w-6 text-[var(--q-accent)]" />
                </div>
              </div>

              {/* ── Seat counter ──────────────────────────────── */}
              <div className="rounded-xl border border-[var(--q-accent)]/25 bg-[var(--q-accent)]/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--q-accent)]">
                  {copy.seats}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  {/* Decrement */}
                  <button
                    type="button"
                    onClick={decrementSeats}
                    disabled={effectiveSeats <= 1}
                    aria-label="Remove seat"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-[var(--q-accent)] hover:text-[var(--q-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  {/* Seat display — editable number input */}
                  <div className="flex flex-1 flex-col items-center gap-0.5">
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={effectiveSeats}
                      onChange={(e) => {
                        const v = Math.max(1, Math.min(9999, Number(e.target.value) || 1));
                        setSeats(v);
                      }}
                      className="w-24 rounded-xl border border-[var(--q-accent)]/30 bg-card px-2 py-1.5 text-center text-3xl font-black tabular-nums text-foreground focus:border-[var(--q-accent)] focus:outline-none"
                      aria-label={isAr ? "عدد المقاعد" : "Number of seats"}
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {isAr ? "مستخدم" : effectiveSeats === 1 ? "user" : "users"}
                    </p>
                  </div>

                  {/* Increment */}
                  <button
                    type="button"
                    onClick={incrementSeats}
                    aria-label="Add seat"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-[var(--q-accent)] hover:text-[var(--q-accent)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Total */}
                <div className="mt-4 flex items-center justify-between border-t border-[var(--q-accent)]/15 pt-3">
                  <span className="text-sm font-bold text-muted-foreground">
                    {copy.total}
                  </span>
                  <span className="text-lg font-black text-[var(--q-accent)]">
                    {totalPerMonth}
                    <span className="ms-1 text-xs font-bold text-muted-foreground">
                      / {isAr ? "شهر" : "month"}
                    </span>
                  </span>
                </div>

                {/* Member count hint */}
                {membersQuery.data && membersQuery.data.length > 0 && (
                  <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                    {isAr
                      ? `لديك حالياً ${currentMemberCount} ${currentMemberCount === 1 ? "عضو" : "أعضاء"} في المؤسسة`
                      : `You currently have ${currentMemberCount} ${currentMemberCount === 1 ? "member" : "members"} in your organization`}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="grid gap-2 sm:grid-cols-2">
                {copy.included.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--q-accent)]" />
                    <span className="text-sm font-medium text-foreground">{feat}</span>
                  </div>
                ))}
              </div>

              {/* Active subscription info */}
              {isActive && overview.subscription && (
                <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <MetricPill
                    icon={CalendarDays}
                    label={copy.activeUntil}
                    value={billingDateLabel(
                      overview.subscription.currentPeriodEndAt,
                      locale,
                    )}
                  />
                  <MetricPill
                    icon={ShieldCheck}
                    label={copy.status}
                    value={status}
                  />
                  {overview.latestPayment && (
                    <MetricPill
                      icon={CreditCard}
                      label={copy.latest}
                      value={overview.latestPayment.status}
                    />
                  )}
                </div>
              )}

              {/* CTA */}
              {isActive ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 py-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {isAr ? "اشتراكك نشط" : "Your subscription is active"}
                  </span>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full rounded-2xl bg-[var(--q-accent)] text-sm font-black uppercase tracking-widest text-white hover:bg-[var(--q-accent)]/90 disabled:opacity-60"
                  onClick={startCheckout}
                  disabled={isStartingCheckout}
                >
                  {isStartingCheckout ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {copy.starting}
                    </>
                  ) : (
                    <>
                      {copy.pay}
                      <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              )}

              <p className="text-center text-[10px] font-bold text-muted-foreground">
                {copy.guarantee}
              </p>
            </div>
          </div>
        )}

        {/* ── Back link ───────────────────────────────────────── */}
        <div className="text-center">
          <Link href="/settings/organization?tab=billing">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {isAr ? "← عودة إلى إعدادات المؤسسة" : "← Back to organization settings"}
            </Button>
          </Link>
        </div>
      </div>
    </AppPageShell>
  );
}

function MetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}:
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
        {value}
      </span>
    </div>
  );
}

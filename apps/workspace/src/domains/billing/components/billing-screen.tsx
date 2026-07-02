"use client";

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
import { useLocale, useTranslations } from "next-intl";
import { AppPageShell } from "@/components/shared";
import { LoadingState, StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/domains/auth";
import { listOrganizationMembers } from "@/domains/organization/api/clerk-organization-api";
import { Link } from "@/i18n/routing";
import { useBillingOverview } from "../api/billing";
import {
  billingDateLabel,
  billingPricePerSeatLabel,
  seatTotalLabel,
  subscriptionTone,
  type BillingLocale,
} from "../billing-view-model";
import { BillingMetricPill } from "./billing-metric-pill";
import { useBillingCheckout } from "../hooks/use-billing-checkout";

export function BillingScreen() {
  const t = useTranslations("Billing");
  const locale = useLocale() as BillingLocale;
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId : null;
  const overview = useBillingOverview(organizationId);

  const seatsFromUrl = searchParams.get("seats");
  const urlSeats = seatsFromUrl ? Math.max(1, parseInt(seatsFromUrl, 10) || 1) : null;

  const membersQuery = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId!),
    enabled: Boolean(organizationId),
  });
  const currentMemberCount = Math.max(1, membersQuery.data?.length ?? 1);

  const [seats, setSeats] = useState<number | null>(urlSeats);
  const effectiveSeats = seats ?? currentMemberCount;
  const totalPerMonth = useMemo(() => seatTotalLabel(effectiveSeats, locale), [effectiveSeats, locale]);
  const pricePerSeat = useMemo(() => billingPricePerSeatLabel(locale), [locale]);
  const included = t.raw("included") as string[];

  const { isStartingCheckout, startCheckout } = useBillingCheckout({
    organizationId,
    effectiveSeats,
    locale,
  });

  function incrementSeats() {
    setSeats((s) => (s ?? currentMemberCount) + 1);
  }

  function decrementSeats() {
    setSeats((s) => Math.max(1, (s ?? currentMemberCount) - 1));
  }

  const status = overview?.subscription?.status ?? "inactive";
  const isActive = status === "active";

  if (session.workspace.status !== "ready") {
    return (
      <AppPageShell>
        <WorkspaceQueryState status={session.workspace.status} variant="dashboard" />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {t("ownerNote")}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--q-accent)]/10">
            <Users className="h-4 w-4 text-[var(--q-accent)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-foreground">
              {session.organization.name}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("orgBeingBilled")}
            </p>
          </div>
          {overview && <StatusPill label={status} tone={subscriptionTone(status)} />}
        </div>

        {!overview ? (
          <LoadingState variant="detail" />
        ) : (
          <div className="overflow-hidden rounded-2xl border-2 border-[var(--q-accent)] bg-card shadow-lg">
            <div className="h-1.5 bg-[var(--q-accent)]" />

            <div className="space-y-6 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--q-accent)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--q-accent)]">
                    <Zap className="h-3 w-3" />
                    {t("plan")}
                  </span>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tight text-foreground">
                      {pricePerSeat}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">
                      {t("perSeat")}
                    </span>
                  </div>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--q-accent)]/10">
                  <CreditCard className="h-6 w-6 text-[var(--q-accent)]" />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--q-accent)]/25 bg-[var(--q-accent)]/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--q-accent)]">
                  {t("seats")}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={decrementSeats}
                    disabled={effectiveSeats <= 1}
                    aria-label={t("removeSeat")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-[var(--q-accent)] hover:text-[var(--q-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

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
                      aria-label={t("seatsInput")}
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {t("seatUnit", { count: effectiveSeats })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={incrementSeats}
                    aria-label={t("addSeat")}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-[var(--q-accent)] hover:text-[var(--q-accent)]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--q-accent)]/15 pt-3">
                  <span className="text-sm font-bold text-muted-foreground">
                    {t("total")}
                  </span>
                  <span className="text-lg font-black text-[var(--q-accent)]">
                    {totalPerMonth}
                    <span className="ms-1 text-xs font-bold text-muted-foreground">
                      / {t("month")}
                    </span>
                  </span>
                </div>

                {membersQuery.data && membersQuery.data.length > 0 && (
                  <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                    {t("memberCountHint", { count: currentMemberCount })}
                  </p>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {included.map((feat) => (
                  <div
                    key={feat}
                    className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--q-accent)]" />
                    <span className="text-sm font-medium text-foreground">{feat}</span>
                  </div>
                ))}
              </div>

              {isActive && overview.subscription && (
                <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <BillingMetricPill
                    icon={CalendarDays}
                    label={t("activeUntil")}
                    value={billingDateLabel(
                      overview.subscription.currentPeriodEndAt,
                      locale,
                      t("notActiveYet"),
                    )}
                  />
                  <BillingMetricPill icon={ShieldCheck} label={t("status")} value={status} />
                  {overview.latestPayment && (
                    <BillingMetricPill
                      icon={CreditCard}
                      label={t("latest")}
                      value={overview.latestPayment.status}
                    />
                  )}
                </div>
              )}

              {isActive ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 py-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {t("subscriptionActive")}
                  </span>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full rounded-2xl bg-[var(--q-accent)] text-sm font-black uppercase tracking-widest text-[var(--q-bg)] hover:bg-[var(--q-accent)]/90 disabled:opacity-60"
                  onClick={startCheckout}
                  disabled={isStartingCheckout}
                >
                  {isStartingCheckout ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t("starting")}
                    </>
                  ) : (
                    <>
                      {t("pay")}
                      <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              )}

              <p className="text-center text-[10px] font-bold text-muted-foreground">
                {t("guarantee")}
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/settings/organization?tab=billing">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {t("backToOrgSettings")}
            </Button>
          </Link>
        </div>
      </div>
    </AppPageShell>
  );
}

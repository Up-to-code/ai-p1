"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, RotateCcw, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AppPageHeader, AppPageShell, AppSection } from "@/components/shared";
import { StatusPill, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Link } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import { getTamaraOrderStatusRequest, useBillingOverview } from "../api/billing";
import type { TamaraPayment } from "../api/billing";
import { tamaraReturnCopy, tamaraReturnText, tamaraReturnTone, type TamaraReturnStatus } from "../billing-view-model";

export function TamaraReturnScreen({ status }: { status: TamaraReturnStatus }) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const account = useAccountContext();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId : null;
  const overview = useBillingOverview(organizationId);
  const [polledPayment, setPolledPayment] = useState<TamaraPayment | null>(null);
  const payment = polledPayment ?? overview?.latestPayment;
  const isCaptured = payment?.status === "captured" || overview?.subscription?.status === "active";
  const reference = searchParams.get("reference") || payment?.orderReferenceId || "";
  const orderId = searchParams.get("orderId") || searchParams.get("paymentId") || reference;

  useEffect(() => {
    if (!organizationId || !orderId || isCaptured) return;
    let isCurrent = true;
    const pollOrganizationId = organizationId;
    const pollOrderId = orderId;

    async function pollOrder() {
      try {
        const result = await getTamaraOrderStatusRequest({ organizationId: pollOrganizationId, orderId: pollOrderId });
        if (isCurrent && result.payment) setPolledPayment(result.payment);
      } catch {
        // The webhook remains the source of truth; return-page polling is best-effort.
      }
    }

    void pollOrder();
    const timer = window.setInterval(() => void pollOrder(), 3000);
    return () => {
      isCurrent = false;
      window.clearInterval(timer);
    };
  }, [isCaptured, orderId, organizationId]);

  const copy = tamaraReturnCopy(locale, isCaptured);
  const Icon = status === "success" ? (isCaptured ? CheckCircle2 : Clock3) : status === "cancel" ? RotateCcw : XCircle;
  const { title, description } = tamaraReturnText(status, copy);

  if (account.workspace.status !== "ready") {
    return (
      <AppPageShell>
        <WorkspaceQueryState status={account.workspace.status} variant="detail" />
      </AppPageShell>
    );
  }

  return (
    <AppPageShell contentClassName="space-y-6">
      <AppPageHeader
        eyebrow={copy.eyebrow}
        title={title}
        subtitle={description}
        actions={<StatusPill label={payment?.status ?? (status === "success" ? "pending" : status)} tone={tamaraReturnTone(status, payment?.status)} />}
      />

      <AppSection>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03]">
              <Icon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{copy.reference}</p>
              <p className="mt-1 break-all font-mono text-xs font-bold text-zinc-900 dark:text-white">{reference || "pending"}</p>
              <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">{copy.payment}</p>
              <p className="mt-1 text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">{payment?.status ?? "pending"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/billing" className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-100 bg-white px-5 text-xs font-black uppercase tracking-widest text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
              {copy.retry}
            </Link>
            <Link href="/dashboard" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
              {copy.dashboard}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </AppSection>
    </AppPageShell>
  );
}

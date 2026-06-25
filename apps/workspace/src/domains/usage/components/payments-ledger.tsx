import type React from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Payment } from "@/domains/billing/api/billing";
import { cn } from "@/lib/utils";
import { type UsageLocale, usageDateLabel, usageMoneyLabel } from "../lib/usage-formatters";

export function PaymentsLedger({
  locale,
  payments,
}: {
  locale: UsageLocale;
  payments: Payment[];
}) {
  const t = useTranslations("Usage");

  return (
    <div className="max-w-5xl overflow-hidden rounded-2xl border border-border bg-white dark:border-white/[0.06] dark:bg-[#111]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 dark:border-white/5 dark:bg-white/[0.02]">
              <LedgerHead>{t("table.invoice")}</LedgerHead>
              <LedgerHead>{t("table.date")}</LedgerHead>
              <LedgerHead>{t("table.description")}</LedgerHead>
              <LedgerHead align="end">{t("table.amount")}</LedgerHead>
              <LedgerHead align="end">{t("table.status")}</LedgerHead>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm font-bold text-muted-foreground">
                  {t("noPayments")}
                </td>
              </tr>
            ) : (
              payments.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0 dark:border-white/[0.03]">
                  <td className="px-5 py-4 font-bold text-foreground">{row.orderId}</td>
                  <td className="px-5 py-4 tabular-nums text-muted-foreground">
                    {usageDateLabel(row.updatedAt, locale)}
                  </td>
                  <td className="px-5 py-4 text-foreground/40">{t("paymentDescription")}</td>
                  <td className="px-5 py-4 text-end font-bold tabular-nums text-foreground">
                    {usageMoneyLabel(row.amount, row.currency, locale)}
                  </td>
                  <td className="px-5 py-4 text-end">
                    <PaymentStatus status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentStatus({ status }: { status: Payment["status"] }) {
  const t = useTranslations("Usage");
  const paid = status === "succeeded";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
        paid
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-muted text-muted-foreground dark:bg-white/[0.06]",
      )}
    >
      {paid && <CheckCircle2 className="h-3 w-3" />}
      {paid ? t("statusPaid") : status}
    </span>
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
    <th
      className={cn(
        "px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground",
        align === "end" ? "text-end" : "text-start",
      )}
    >
      {children}
    </th>
  );
}

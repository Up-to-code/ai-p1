import type React from "react";
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
    <div className="max-w-5xl overflow-x-auto border-t border-border dark:border-white/[0.06]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border dark:border-white/5">
              <LedgerHead>{t("table.invoice")}</LedgerHead>
              <LedgerHead>{t("table.date")}</LedgerHead>
              <LedgerHead>{t("table.description")}</LedgerHead>
              <LedgerHead align="end">{t("table.amount")}</LedgerHead>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm font-bold text-muted-foreground">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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

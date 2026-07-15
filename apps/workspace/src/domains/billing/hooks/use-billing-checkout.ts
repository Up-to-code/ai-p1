import { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";
import { QENTRAH_PLAN_ID, type BillingPlanId } from "../config/plans.config";

async function checkoutErrorMessage(response: Response) {
  const fallback = "Checkout request failed";
  try {
    const data = await response.json() as { error?: unknown };
    return typeof data.error === "string" && data.error.trim() ? data.error : fallback;
  } catch {
    return fallback;
  }
}

export function useBillingCheckout({
  organizationId,
  planId = QENTRAH_PLAN_ID,
  effectiveSeats,
  locale,
}: {
  organizationId: string | null;
  planId?: BillingPlanId;
  effectiveSeats: number;
  locale: string;
}) {
  const t = useTranslations("Billing.checkout");
  const { toast } = useToast();
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  async function startCheckout(nextPlanId: BillingPlanId = planId) {
    if (!organizationId || isStartingCheckout) return;
    setIsStartingCheckout(true);
    try {
      const response = await fetch(
        `/api/v1/organizations/${encodeURIComponent(organizationId)}/billing/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: nextPlanId,
            seats: effectiveSeats,
            locale,
            returnUrl: window.location.origin + `/${locale}/billing?return=checkout&order=pending`,
          }),
        },
      );
      if (!response.ok) throw new Error(await checkoutErrorMessage(response));
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        toast({
          title: t("noUrlTitle"),
          description: t("noUrlDesc"),
          type: "error",
        });
        setIsStartingCheckout(false);
      }
    } catch (error) {
      toast({
        title: t("errorTitle"),
        description: error instanceof Error ? error.message : t("errorDesc"),
        type: "error",
      });
      setIsStartingCheckout(false);
    }
  }

  return { isStartingCheckout, startCheckout };
}

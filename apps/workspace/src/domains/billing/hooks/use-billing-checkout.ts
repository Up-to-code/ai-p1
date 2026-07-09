import { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";

export function useBillingCheckout({
  organizationId,
  effectiveSeats,
  locale,
}: {
  organizationId: string | null;
  effectiveSeats: number;
  locale: string;
}) {
  const t = useTranslations("Billing.checkout");
  const { toast } = useToast();
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
            returnUrl: window.location.origin + `/${locale}/settings/billing`,
          }),
        },
      );
      if (!response.ok) throw new Error("Checkout request failed");
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

import { CreditCard, Gauge, type LucideIcon } from "lucide-react";

export type UsageTab = "usage" | "payments";

export const USAGE_TABS: { id: UsageTab; labelKey: "tabs.usage" | "tabs.payments"; icon: LucideIcon }[] = [
  { id: "usage", labelKey: "tabs.usage", icon: Gauge },
  { id: "payments", labelKey: "tabs.payments", icon: CreditCard },
];

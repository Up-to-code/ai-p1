export type BillingCycle = "monthly" | "annually";

export type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number | null;
  annuallyPrice: number | null;
  label: string | null;
  cta: string;
  ctaHref: string;
  highlight: boolean;
  contactSales: boolean;
};

export type FeatureRow = {
  label: string;
  values: (string | boolean)[];
};

export type FeatureSection = {
  category: string;
  rows: FeatureRow[];
};

export type PricingPageLocale = {
  badge: string;
  title: string;
  subtitle: string;
  monthly: string;
  annually: string;
  footer: string;
};

import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing/pricing-page";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "التسعير | Qentrah" : "Pricing | Qentrah",
    description: isAr
      ? "تسعير شفاف ومرن لمنصة كانترا — قارن الخطط جنباً إلى جنب واختر ما يناسب فريقك."
      : "Transparent and flexible pricing for Qentrah — compare plans side by side and pick the one that fits your team.",
    openGraph: {
      title: isAr ? "التسعير | Qentrah" : "Pricing | Qentrah",
      description: isAr
        ? "تسعير شفاف ومرن لمنصة كانترا — قارن الخطط جنباً إلى جنب واختر ما يناسب فريقك."
        : "Transparent and flexible pricing for Qentrah — compare plans side by side and pick the one that fits your team.",
    },
  };
}

export default function PricingPageRoute() {
  return <PricingPage />;
}

import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";
import { PricingPage } from "@/components/pricing/pricing-page";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? pageMetadata(locale as Locale, "pricing") : {};
}

export default function PricingPageRoute() {
  return <PricingPage />;
}

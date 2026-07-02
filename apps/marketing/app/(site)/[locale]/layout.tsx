import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";

import Footer from "@/components/footer";
import { Navbar } from "@/components/landing/navbar";
import { LocaleDocumentAttributes } from "@/components/marketing/locale-document-attributes";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getDirection, getMarketingMessages, isLocale, type Locale } from "@/lib/content";
import { localizedMarketingMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }, { locale: "fr" }];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const locale: Locale = localeParam;

  return localizedMarketingMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale: Locale = localeParam;
  const messages = getMarketingMessages(locale);

  return (
    <div dir={getDirection(locale)} lang={locale}>
      <LocaleDocumentAttributes locale={locale} />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </NextIntlClientProvider>
    </div>
  );
}

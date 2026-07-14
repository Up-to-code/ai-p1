import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import { NextIntlClientProvider } from "next-intl";

import Footer from "@/components/footer";
import { Navbar } from "@/components/landing/navbar";
import { LocaleDocumentAttributes } from "@/components/marketing/locale-document-attributes";
import { MarketingContentProvider } from "@/components/marketing/marketing-content-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getDirection, isLocale, type Locale } from "@/lib/content";
import { getMarketingContent } from "@/lib/contentful";
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
  const content = await getMarketingContent(locale);

  return (
    <div
      dir={getDirection(locale)}
      lang={locale}
      style={{ "--q-info": content.presentation.brand.accentColor } as CSSProperties}
    >
      <LocaleDocumentAttributes locale={locale} />
      <NextIntlClientProvider locale={locale} messages={content.messages}>
        <MarketingContentProvider value={content.presentation}>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </MarketingContentProvider>
      </NextIntlClientProvider>
    </div>
  );
}

import { TooltipProvider } from "@/components/ui/tooltip";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { LocaleDocumentAttrs } from "@/components/i18n/locale-document-attrs";
import { UiLocalizer } from '@/components/i18n/ui-localizer';
import { BackendProviders } from "@/components/providers/backend-providers";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { metadata, isLocale, type Locale } from "./seo/metadata";

export type { Locale };

export { metadata };

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <BackendProviders>
        <ThemeProvider>
          <TooltipProvider>
            <ToastProvider>
              <LocaleDocumentAttrs locale={locale} />
              <UiLocalizer />
              {children}
            </ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </BackendProviders>
    </NextIntlClientProvider>
  );
}

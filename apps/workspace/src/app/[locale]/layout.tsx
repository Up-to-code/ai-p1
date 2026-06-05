import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { LocaleDocumentAttrs } from "@/components/i18n/locale-document-attrs";
import { UiLocalizer } from '@/components/i18n/ui-localizer';
import { BackendProviders } from "@/components/providers/backend-providers";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/theme-provider";

type Locale = (typeof routing.locales)[number];

function isLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

export const metadata: Metadata = {
  metadataBase: new URL(brandDomainUrl("workspace")),
  applicationName: brandProductName("workspace", "en"),
  title: {
    default: brandProductName("platform", "en"),
    template: `%s | ${brandProductName("workspace", "en")}`,
  },
  description: "Saudi Arabia central real estate workspace for projects, clients, units, and partner authorization.",
  keywords: [
    "Qentrah",
    "real estate workspace",
    "Saudi real estate",
    "property CRM",
    "partner authorization",
  ],
  authors: [{ name: brandLabel("en") }],
  creator: brandLabel("en"),
  publisher: brandLabel("en"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/mask-icon.svg", color: "#011B5A" }],
  },
  appleWebApp: {
    capable: true,
    title: brandProductName("workspace", "en"),
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brandProductName("workspace", "en"),
    title: brandProductName("platform", "en"),
    description: "Manage Qentrah real estate operations, client workflows, units, and partner access.",
    images: [
      {
        url: "/app-icon-512.png",
        width: 512,
        height: 512,
        alt: `${brandLabel("en")} Workspace icon`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: brandProductName("platform", "en"),
    description: "Qentrah workspace for real estate operations and partner authorization.",
    images: ["/app-icon-512.png"],
  },
};

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
    <ClerkProvider>
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
    </ClerkProvider>
  );
}

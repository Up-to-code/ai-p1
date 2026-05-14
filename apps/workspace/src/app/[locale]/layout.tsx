import type { Metadata } from "next";
import { brandIdentity, brandProductName } from "@qentrah/brand-identity";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "../globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { UiLocalizer } from '@/components/i18n/ui-localizer';
import { BackendProviders } from "@/components/providers/backend-providers";
import { getToken } from "@/server/auth/better-auth/server";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/theme-provider";

type Locale = (typeof routing.locales)[number];

function isLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const themeInitScript = `
(() => {
  try {
    const theme = window.localStorage.getItem("${brandIdentity.themeStorageKey}") === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export const metadata: Metadata = {
  title: brandProductName("platform", "en"),
  description: "Saudi Arabia Central Real Estate Data Workspace",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!isLocale(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const initialToken = await getToken().catch(() => undefined);

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`h-full flex flex-col bg-background text-text-primary ${locale === 'ar' ? 'font-cairo' : ''}`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <NextIntlClientProvider messages={messages}>
          <BackendProviders initialToken={initialToken}>
            <ThemeProvider>
              <TooltipProvider>
                <ToastProvider>
                  <UiLocalizer />
                  {children}
                </ToastProvider>
              </TooltipProvider>
            </ThemeProvider>
          </BackendProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

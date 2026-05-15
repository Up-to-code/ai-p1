import type { Metadata } from "next";
import { brandDomainUrl, brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";
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

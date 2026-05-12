import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getAlternateLocale, type Locale } from "@/lib/content";

type NavCopy = {
  brand: string;
  products: string;
  privacy: string;
  terms: string;
  workspace: string;
  language: string;
};

export function SiteHeader({ locale, nav }: { locale: Locale; nav: NavCopy }) {
  const alternateLocale = getAlternateLocale(locale);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-6">
      <div className="flex w-full max-w-7xl items-center justify-between rounded-full bg-white/70 px-4 py-2 shadow-none backdrop-blur-3xl dark:bg-zinc-950/65">
        <Link aria-label={nav.brand} className="flex items-center gap-3 font-bold" href={`/${locale}`}>
          <span className="flex size-9 items-center justify-center rounded-full bg-zinc-950 text-sm text-white dark:bg-white dark:text-zinc-950">A</span>
          <span>{nav.brand}</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-300">
          <a href="#products" className="hover:text-zinc-950 dark:hover:text-white">
            {nav.products}
          </a>
          <Link href={`/${locale}/privacy`} className="hover:text-zinc-950 dark:hover:text-white">
            {nav.privacy}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-zinc-950 dark:hover:text-white">
            {nav.terms}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`/${alternateLocale}`}
            className="hidden h-9 items-center rounded-full px-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 sm:inline-flex dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {nav.language}
          </Link>
          <a
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            href={process.env.NEXT_PUBLIC_WORKSPACE_URL ?? "https://app.anan.sa"}
          >
            {nav.workspace}
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ locale, nav }: { locale: Locale; nav: NavCopy }) {
  return (
    <footer className="border-t border-zinc-200 bg-white/55 dark:border-white/10 dark:bg-zinc-950/50">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-bold">{nav.brand}</div>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {locale === "ar" ? "منصة عامة لمنتجات أنان العقارية ومساحات العمل والتكاملات." : "The public home for Anan real estate workspace and partner products."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link href={`/${locale}`}>{nav.products}</Link>
            <Link href={`/${locale}/privacy`}>{nav.privacy}</Link>
            <Link href={`/${locale}/terms`}>{nav.terms}</Link>
          </div>
        </div>
        <div className="my-8 h-px w-full bg-zinc-200 dark:bg-white/10" />
        <p className="text-xs text-zinc-400">© {new Date().getFullYear()} {nav.brand}</p>
      </div>
    </footer>
  );
}

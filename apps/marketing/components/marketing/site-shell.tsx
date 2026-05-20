"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { brandLabel } from "@qentrah/brand-identity";

import { getAlternateLocale, productUrls, type Locale } from "@/lib/content";

const workspaceUrl = productUrls.workspace;
const partnersUrl = productUrls.partners;

type NavCopy = {
  brand: string;
  products: string;
  privacy: string;
  terms: string;
  workspace: string;
  partners: string;
  language: string;
};

export function SiteHeader({ locale, nav }: { locale: Locale; nav: NavCopy }) {
  const alternateLocale = getAlternateLocale(locale);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { label: nav.products, href: `/${locale}#products` },
    { label: nav.privacy, href: `/${locale}/privacy` },
    { label: nav.terms, href: `/${locale}/terms` },
  ];

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
      <div className="w-full max-w-7xl rounded-[28px] border border-zinc-200/70 bg-white/80 px-4 py-2 shadow-none backdrop-blur-3xl dark:border-white/10 dark:bg-zinc-950/70 md:rounded-full">
        <div className="flex items-center justify-between">
        <Link aria-label={nav.brand} className="flex items-center gap-3 font-bold" href={`/${locale}`}>
          <span className="flex size-9 items-center justify-center rounded-full bg-zinc-950 text-sm text-white dark:bg-white dark:text-zinc-950">A</span>
          <span>{nav.brand}</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-300">
          {navItems.map((item) => (
            <Link href={item.href} className="hover:text-zinc-950 dark:hover:text-white" key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={`/${alternateLocale}`}
            className="hidden h-9 items-center rounded-full px-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 sm:inline-flex dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {nav.language}
          </Link>
          <a
            className="inline-flex size-9 items-center justify-center gap-1.5 rounded-full bg-black text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:w-auto sm:px-4"
            href={workspaceUrl}
          >
            <span className="hidden sm:inline">{nav.workspace}</span>
            <ArrowUpRight className="size-3.5" />
          </a>
          <a
            className="hidden h-9 items-center justify-center gap-1.5 rounded-full border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 lg:inline-flex dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
            href={partnersUrl}
          >
            {nav.partners}
            <ArrowUpRight className="size-3.5" />
          </a>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 md:hidden dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
        </div>
        {isMenuOpen ? (
          <nav aria-label="Mobile navigation" className="mt-3 grid gap-2 border-t border-zinc-200/80 pt-3 text-sm font-bold text-zinc-700 md:hidden dark:border-white/10 dark:text-zinc-200">
            {navItems.map((item) => (
              <Link
                href={item.href}
                className="rounded-2xl px-4 py-3 transition hover:bg-zinc-100 dark:hover:bg-white/10"
                key={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={workspaceUrl}
              className="rounded-2xl bg-zinc-950 px-4 py-3 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {nav.workspace}
            </a>
            <a
              href={partnersUrl}
              className="rounded-2xl border border-zinc-200 px-4 py-3 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              {nav.partners}
            </a>
            <Link
              href={`/${alternateLocale}`}
              className="rounded-2xl px-4 py-3 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              {nav.language}
            </Link>
          </nav>
        ) : null}
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
              {locale === "ar"
                ? `منصة عامة لمنتجات ${brandLabel("ar")} العقارية ومساحات العمل والتكاملات.`
                : `The public home for ${brandLabel("en")} real estate workspace and partner products.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link href={`/${locale}#products`}>{nav.products}</Link>
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

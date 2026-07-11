"use client";

import { ArrowUpRight } from "lucide-react";
import { useLocale } from "next-intl";

import { Link } from "@/i18n/routing";
import { BrandMark } from "@/components/logo";
import { publicSeoLinks } from "@/lib/public-links";
import { marketingFooter, isLocale } from "@/lib/content";

const footerGroups = [
  {
    title: "platform",
    links: publicSeoLinks,
  },
  {
    title: "workspace",
    links: [
      { href: "/dashboard", label: "dashboard" },
    ],
  },
  {
    title: "legal",
    links: [
      { href: "/privacy", label: "privacy" },
      { href: "/terms", label: "terms" },
      { href: "/legal", label: "legal" },
    ],
  },
] as const;

export default function Footer() {
  const localeRaw = useLocale();
  const locale = isLocale(localeRaw) ? localeRaw : "en";
  const footer = marketingFooter[locale];

  return (
    <footer className="border-t bg-[var(--marketing-section)]/95" style={{ borderColor: "var(--q-border)" }}>
      <div className="mx-auto max-w-(--breakpoint-xl)">
        <div className="flex flex-col items-start justify-between gap-x-10 gap-y-10 px-6 py-12 sm:flex-row xl:px-0">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandMark className="h-5 w-5" />
              <span>
                <span className="block text-lg font-black tracking-tight text-[var(--q-text-primary)]">qentrah</span>
                <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--q-text-secondary)]">
                  {footer.tagline}
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--q-text-secondary)]">
              {footer.description}
            </p>
          </div>

          <div className="grid w-full gap-8 sm:grid-cols-3 lg:max-w-2xl">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.26em] text-[var(--q-text-secondary)]">
                  {group.title === "platform" ? footer.platform : group.title === "workspace" ? footer.workspace : footer.legal}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--q-text-primary)] transition hover:text-[var(--q-accent)]"
                        href={link.href}
                      >
                        {"labels" in link ? link.labels[locale] : footer[link.label as keyof typeof footer]}
                        <ArrowUpRight className="h-3 w-3 opacity-45 rtl:-rotate-90" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--q-accent)] px-6 text-sm font-bold text-background transition hover:bg-[var(--q-accent-hover)] sm:w-auto"
            href="/contact"
          >
            {footer.contact}
            <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
          </Link>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t px-6 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-text-secondary)] sm:flex-row sm:items-center xl:px-0" style={{ borderColor: "var(--q-border)" }}>
          <span>{footer.copyright}</span>
          <div className="flex flex-wrap gap-4">
            <Link className="transition hover:text-[var(--q-text-primary)]" href="/privacy">
              {footer.privacy}
            </Link>
            <Link className="transition hover:text-[var(--q-text-primary)]" href="/terms">
              {footer.terms}
            </Link>
            <Link className="transition hover:text-[var(--q-text-primary)]" href="/legal">
              {footer.legal}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

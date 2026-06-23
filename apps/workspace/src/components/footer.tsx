"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { BrandMark } from "@/components/logo";

const footerGroups = [
  {
    title: "platform",
    links: [
      { href: "/about", label: "about" },
      { href: "/mcp-docs", label: "documentation" },
    ],
  },
  {
    title: "workspace",
    links: [
      { href: "/dashboard", label: "dashboard" },
      { href: "/contact", label: "contact" },
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
  const t = useTranslations("Landing.footer");

  return (
    <footer className="border-t border-[var(--q-border)] bg-[var(--q-card)]">
      <div className="mx-auto max-w-(--breakpoint-xl)">
        <div className="flex flex-col items-start justify-between gap-x-10 gap-y-10 px-6 py-12 sm:flex-row xl:px-0">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[var(--q-card-hover)] ring-1 ring-[var(--q-border)]">
                <BrandMark className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-lg font-black tracking-tight text-[var(--q-text-primary)]">qentrah</span>
                <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {t("tagline")}
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[var(--q-text-muted)]">
              {t("description")}
            </p>
          </div>

          <div className="grid w-full gap-8 sm:grid-cols-3 lg:max-w-2xl">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.26em] text-[var(--q-text-muted)]">
                  {t(group.title)}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--q-text-secondary)] transition hover:text-[var(--q-text-primary)]"
                        href={link.href}
                      >
                        {t(link.label)}
                        <ArrowUpRight className="h-3 w-3 opacity-45 rtl:-rotate-90" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--q-text-primary)] px-6 text-sm font-bold text-background transition hover:opacity-90 dark:bg-white dark:text-background sm:w-auto"
            href="/contact"
          >
            {t("contact")}
            <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
          </Link>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-[var(--q-border)] px-6 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-text-muted)] sm:flex-row sm:items-center xl:px-0">
          <span>{t("copyright")}</span>
          <div className="flex flex-wrap gap-4">
            <Link className="transition hover:text-[var(--q-text-primary)]" href="/privacy">
              {t("privacy")}
            </Link>
            <Link className="transition hover:text-[var(--q-text-primary)]" href="/terms">
              {t("terms")}
            </Link>
            <Link className="transition hover:text-[var(--q-text-primary)]" href="/legal">
              {t("legal")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

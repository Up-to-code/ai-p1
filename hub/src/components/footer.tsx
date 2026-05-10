"use client";

import Image from "next/image";
import { ArrowUpRight, Mail, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

const linkGroups = [
  {
    key: "platform",
    links: [
      { href: "/developer", key: "developers" },
      { href: "/broker", key: "brokers" },
      { href: "/about", key: "about" },
      { href: "/docs", key: "documentation" },
    ],
  },
  {
    key: "workspace",
    links: [
      { href: "/dashboard", key: "dashboard" },
      { href: "/contact", key: "contact" },
      { href: "/team-public", key: "team" },
    ],
  },
  {
    key: "legal",
    links: [
      { href: "/privacy", key: "privacy" },
      { href: "/terms", key: "terms" },
      { href: "/legal", key: "legal" },
    ],
  },
] as const;

export default function Footer() {
  const t = useTranslations("Landing.footer");

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/70 px-4 py-8 dark:border-white/10 dark:bg-zinc-950 sm:px-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_1.45fr_0.9fr]">
          <div className="border-b border-zinc-200 p-6 dark:border-white/10 lg:border-b-0 lg:border-e">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-zinc-950 dark:bg-white">
                <Image src="/brand-logo.svg" alt="Anan" width={26} height={26} className="h-6 w-6 invert dark:invert-0" />
              </span>
              <span>
                <span className="block text-xl font-black tracking-tight text-zinc-950 dark:text-white">anan</span>
                <span className="block max-w-64 text-[9px] font-black uppercase leading-relaxed tracking-[0.2em] text-zinc-400">{t("tagline")}</span>
              </span>
            </Link>

            <p className="mt-7 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {t("description")}
            </p>

            <ul className="mt-7 grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: t("developerReady"), icon: ShieldCheck },
                { label: t("verifiedOps"), icon: ShieldCheck },
                { label: t("aiNative"), icon: ShieldCheck },
              ].map(({ label, icon: Icon }) => (
                <li className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400" key={label}>
                  <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-8 border-b border-zinc-200 p-6 dark:border-white/10 sm:grid-cols-3 lg:border-b-0">
            {linkGroups.map((group) => (
              <div key={group.key}>
                <h3 className="mb-5 text-[10px] font-black uppercase tracking-[0.28em] text-zinc-400">{t(group.key)}</h3>
                <ul className="space-y-3">
                  {group.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
                        {t(item.key)}
                        <ArrowUpRight className="h-3 w-3 opacity-45 transition group-hover:translate-x-0.5 group-hover:opacity-100 rtl:-rotate-90 rtl:group-hover:-translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-zinc-950 p-6 text-white dark:bg-white dark:text-zinc-950">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white dark:bg-zinc-950/10 dark:text-zinc-950">
              <Mail className="h-4 w-4" />
            </div>
            <h3 className="mt-6 text-2xl font-bold tracking-tight">{t("contact")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65 dark:text-zinc-600">{t("description")}</p>
            <Button render={<Link href="/contact" />} className="mt-7 w-full rounded-full bg-white text-zinc-950 hover:bg-zinc-200 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800">
              {t("contact")}
              <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-5 border-t border-zinc-200 px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:border-white/10 sm:flex-row sm:items-center">
          <span>{t("copyright")}</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition hover:text-zinc-950 dark:hover:text-white">{t("privacy")}</Link>
            <Link href="/terms" className="transition hover:text-zinc-950 dark:hover:text-white">{t("terms")}</Link>
            <Link href="/legal" className="transition hover:text-zinc-950 dark:hover:text-white">{t("legal")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

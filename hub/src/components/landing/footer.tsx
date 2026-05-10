import Image from "next/image";
import { ArrowUpRight, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("Landing.footer");

  const groups = [
    {
      title: t("platform"),
      links: [
        { href: "/developer", label: t("developers") },
        { href: "/broker", label: t("brokers") },
        { href: "/about", label: t("about") },
        { href: "/docs", label: t("documentation") },
      ],
    },
    {
      title: t("workspace"),
      links: [
        { href: "/dashboard", label: t("dashboard") },
        { href: "/contact", label: t("contact") },
        { href: "/team-public", label: t("team") },
      ],
    },
    {
      title: t("legal"),
      links: [
        { href: "/privacy", label: t("privacy") },
        { href: "/terms", label: t("terms") },
        { href: "/legal", label: t("legal") },
      ],
    },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/70 px-4 dark:border-white/10 dark:bg-zinc-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-x-10 gap-y-12 py-14 lg:flex-row">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10">
                <Image src="/brand-logo.svg" alt="Anan" width={28} height={28} className="h-7 w-7" />
              </div>
              <div>
                <span className="block text-lg font-bold lowercase tracking-tight text-zinc-900 dark:text-white">anan</span>
                <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">{t("tagline")}</span>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
              {t("description")}
            </p>

            <ul className="mt-7 flex flex-wrap gap-2">
              {[t("developerReady"), t("verifiedOps"), t("aiNative")].map((label) => (
                <li key={label} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid w-full gap-10 sm:grid-cols-3 lg:max-w-2xl">
            {groups.map((group) => (
              <div key={group.title} className="space-y-5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">{group.title}</h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-50 rtl:-rotate-90" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="w-full rounded-[1.5rem] border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] lg:max-w-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Mail className="h-4 w-4" />
            </div>
            <h3 className="mt-5 text-base font-bold text-zinc-950 dark:text-white">{t("contact")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{t("description")}</p>
            <Button render={<Link href="/contact" />} className="mt-5 w-full rounded-full">
              {t("contact")}
              <ArrowUpRight className="h-4 w-4 rtl:-rotate-90" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col-reverse items-start justify-between gap-4 py-8 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600 sm:flex-row sm:items-center">
          <span>{t("copyright")}</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition hover:text-zinc-900 dark:hover:text-white">{t("privacy")}</Link>
            <Link href="/terms" className="transition hover:text-zinc-900 dark:hover:text-white">{t("terms")}</Link>
            <Link href="/legal" className="transition hover:text-zinc-900 dark:hover:text-white">{t("legal")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

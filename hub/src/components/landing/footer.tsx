import Image from "next/image";
import { ArrowUpRight, Bot, Building2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

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
    <footer className="border-t border-white/10 bg-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white">
              <Image src="/brand-logo.svg" alt="Anan" width={30} height={30} className="h-8 w-8" />
            </span>
            <span>
              <span className="block text-base font-black lowercase tracking-tight text-white">anan</span>
              <span className="block text-[9px] font-black uppercase tracking-[0.28em] text-zinc-400">{t("tagline")}</span>
            </span>
          </Link>
          <p className="max-w-md text-sm font-medium leading-relaxed text-zinc-400">{t("description")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-white">
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 rtl:-rotate-90" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500 lg:col-span-2">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}

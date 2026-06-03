import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";
import { BrandMark } from "@/components/logo";

const footerGroups = [
  {
    title: "platform",
    links: [
      { href: "/developer", label: "developers" },
      { href: "/broker", label: "brokers" },
      { href: "/about", label: "about" },
      { href: "/docs", label: "documentation" },
      { href: "/blog", label: "blog" },
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

export default async function Footer() {
  const t = await getTranslations("Landing.footer");

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto max-w-(--breakpoint-xl)">
        <div className="flex flex-col items-start justify-between gap-x-10 gap-y-10 px-6 py-12 sm:flex-row xl:px-0">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-white/10">
                <BrandMark className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-lg font-black tracking-tight text-zinc-950 dark:text-white">qentrah</span>
                <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  {t("tagline")}
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {t("description")}
            </p>
          </div>

          <div className="grid w-full gap-8 sm:grid-cols-3 lg:max-w-2xl">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.26em] text-zinc-400">
                  {t(group.title)}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                        href={link.href}
                      >
                        {t(link.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:w-auto"
            href="/contact"
          >
            {t("contact")}
          </Link>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-zinc-200 px-6 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:border-white/10 sm:flex-row sm:items-center xl:px-0">
          <span>{t("copyright")}</span>
          <div className="flex flex-wrap gap-4">
            <Link className="transition hover:text-zinc-950 dark:hover:text-white" href="/privacy">
              {t("privacy")}
            </Link>
            <Link className="transition hover:text-zinc-950 dark:hover:text-white" href="/terms">
              {t("terms")}
            </Link>
            <Link className="transition hover:text-zinc-950 dark:hover:text-white" href="/legal">
              {t("legal")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

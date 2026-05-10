"use client";

import { useState } from "react";
import Image from "next/image";
import { Bot, LayoutDashboard, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "home" },
  { href: "/developer", key: "developers" },
  { href: "/broker", key: "brokers" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Navbar() {
  const t = useTranslations("Landing.nav");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900/15">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white">
            <Image src="/brand-logo.svg" alt="Anan" width={28} height={28} className="h-7 w-7" priority />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black lowercase tracking-tight text-white">anan</span>
            <span className="block truncate text-[9px] font-black uppercase tracking-[0.24em] text-zinc-400">{t("workspaceSystem")}</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition hover:text-white"
            >
              {t(item.key)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[10px] font-black uppercase tracking-widest text-zinc-950">
              <LayoutDashboard className="h-3.5 w-3.5" />
              {t("work")}
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <Bot className="h-3.5 w-3.5" />
              {t("ai")}
            </span>
          </div>
          <LanguageSwitcher className="opacity-70 hover:opacity-100" />
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-5 text-[10px] font-black uppercase tracking-widest text-zinc-950 transition hover:bg-zinc-200 active:scale-[0.98]"
          >
            {t("dashboard")}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-label={isOpen ? t("closeMenu") : t("openMenu")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition hover:text-white md:hidden"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </nav>

      <div className={cn("border-t border-white/10 bg-black px-4 py-4 shadow-none md:hidden", !isOpen && "hidden")}>
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="grid gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-3 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 pt-4">
            <LanguageSwitcher className="h-10 flex-1 justify-center opacity-80" />
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-white px-5 text-[10px] font-black uppercase tracking-widest text-zinc-950"
            >
              {t("dashboard")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link } from "@/i18n/routing";
import { Menu, X } from "lucide-react";

const mobileNavItems = [
  { key: "solutions", href: "/#solutions" },
  { key: "pricing", href: "/#pricing" },
  { key: "resources", href: "/#resources" },
  { key: "company", href: "/about" },
] as const;

export function Navbar() {
  const t = useTranslations("Landing.nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-all duration-700 ease-in-out sm:px-6",
      isScrolled ? "top-2" : "top-4"
    )}>
      <div className={cn("relative w-full max-w-7xl transition-all duration-700", isScrolled && "max-w-5xl")}>
        <nav className={cn(
          "flex items-center justify-between rounded-full px-3 py-2 ring-1 ring-zinc-950/5 transition-all duration-700 dark:ring-white/10",
          "bg-white/80 backdrop-blur-3xl dark:bg-zinc-950/80"
        )}>
          <Logo />
          <NavMenu className="hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="hidden h-10 items-center gap-1 rounded-full bg-zinc-950/5 p-1 dark:bg-white/10 sm:flex">
              <ThemeToggle className="h-8 w-8 rounded-full border-none bg-white/80 shadow-none hover:bg-white dark:bg-white/10 dark:hover:bg-white/15" />
              <LanguageSwitcher className="h-8 min-w-24 rounded-full border-none bg-transparent px-3 text-[10px] font-black opacity-70 hover:bg-white/70 hover:opacity-100 dark:hover:bg-white/10" />
            </div>
            <Link href="/dashboard" className="hidden h-10 items-center justify-center rounded-full bg-zinc-950 px-6 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 md:inline-flex">
              {t("dashboard")}
            </Link>
            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/80 text-zinc-800 transition hover:bg-white md:hidden dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
        {isMenuOpen ? (
          <div className="absolute inset-x-0 top-full mt-2 rounded-[24px] border border-zinc-200 bg-background p-3 shadow-[0_22px_80px_rgba(15,23,42,0.16)] md:hidden dark:border-white/10">
            <nav className="grid gap-1" aria-label={t("home")}>
              {mobileNavItems.map((item) => (
                <Link
                  className="flex h-10 w-full items-center rounded-2xl px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 focus:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:text-zinc-100 dark:hover:bg-white/10 dark:focus:bg-white/10"
                  href={item.href}
                  key={item.key}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <div className="mt-2 grid gap-2">
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-5 text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("dashboard")}
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle className="h-9 w-9 rounded-full border border-zinc-200 bg-white shadow-none dark:border-white/10 dark:bg-white/10" />
                <LanguageSwitcher className="h-9 flex-1 rounded-full border border-zinc-200 bg-white px-3 text-[10px] font-black opacity-80 hover:opacity-100 dark:border-white/10 dark:bg-white/10" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

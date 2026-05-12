"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link } from "@/i18n/routing";

export function Navbar() {
  const t = useTranslations("Landing.nav");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed inset-x-0 top-4 z-50 flex justify-center px-6 transition-all duration-700 ease-in-out",
      isScrolled ? "top-2" : "top-4"
    )}>
      <nav className={cn(
        "flex w-full max-w-7xl items-center justify-between rounded-full px-3 py-2 transition-all duration-700",
        "bg-white/60 backdrop-blur-3xl ring-1 ring-zinc-950/5",
        "dark:bg-zinc-900/55 dark:ring-white/10",
        isScrolled && "max-w-5xl bg-white/80 dark:bg-zinc-950/80"
      )}>
        <Logo />
        <NavMenu className="hidden md:block" />
        <div className="flex items-center gap-2">
          <div className="hidden h-10 items-center gap-1 rounded-full bg-zinc-950/5 p-1 dark:bg-white/10 sm:flex">
            <ThemeToggle className="h-8 w-8 rounded-full border-none bg-white/80 shadow-none hover:bg-white dark:bg-white/10 dark:hover:bg-white/15" />
            <LanguageSwitcher className="h-8 min-w-24 rounded-full border-none bg-transparent px-3 text-[10px] font-black opacity-70 hover:bg-white/70 hover:opacity-100 dark:hover:bg-white/10" />
          </div>
          <Link href="/dashboard" className="hidden h-10 items-center justify-center rounded-full bg-zinc-950 px-6 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:inline-flex">
            {t("dashboard")}
          </Link>
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </nav>
    </header>
  );
}

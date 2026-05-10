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
        "flex w-full max-w-7xl items-center justify-between rounded-full border px-4 py-2 transition-all duration-700",
        "border-zinc-200/50 bg-white/40 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] backdrop-blur-3xl",
        "dark:border-white/10 dark:bg-zinc-900/40 dark:shadow-none",
        isScrolled && "max-w-5xl bg-white/70 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:bg-zinc-950/70"
      )}>
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center rounded-full bg-zinc-950/5 p-0.5 dark:bg-white/10">
              <ThemeToggle className="h-8 w-8 border-none bg-transparent shadow-none hover:bg-zinc-950/5 dark:hover:bg-white/5" />
              <div className="mx-0.5 h-3 w-px bg-zinc-200 dark:bg-white/10" />
              <LanguageSwitcher className="h-8 border-none bg-transparent px-3 text-[10px] font-black opacity-60 hover:opacity-100" />
            </div>
            
            <Link
              href="/dashboard"
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-6 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              )}
            >
              {t("dashboard")}
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </nav>
    </header>
  );
}

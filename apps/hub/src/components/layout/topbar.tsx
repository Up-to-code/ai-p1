"use client";

import { Bell, Bot, LayoutDashboard, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from "@/components/providers/theme-provider";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { motion } from "framer-motion";

export function Topbar() {
  const t = useTranslations('Topbar');
  const tWorkspace = useTranslations('Workspace');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { isDark, setTheme } = useTheme();
  const { mode, setMode } = useWorkspaceStore();
  const activeToggleClassName = "text-zinc-900 dark:text-zinc-900";
  const inactiveToggleClassName = "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white";

  return (
    <header className={cn(
      "flex h-[var(--topbar-height)] items-center gap-4 border-b border-zinc-100 bg-white/70 px-8 backdrop-blur-md transition-all duration-300 dark:border-white/5 dark:bg-[#0A0A0A]/70",
      isRtl && "font-cairo"
    )}>

      <div className="flex flex-1 items-center gap-6">
        <button className="group flex items-center gap-2 rounded-lg px-3 py-1.5 text-zinc-400 transition-all hover:bg-zinc-50 dark:hover:bg-white/5">
          <Search className="h-4 w-4 group-hover:text-zinc-900 dark:group-hover:text-white" />
          <span className="hidden text-sm font-medium group-hover:text-zinc-900 dark:group-hover:text-white md:inline-block">{tWorkspace('searchAnything')}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="hidden items-center rounded-full border border-zinc-100 bg-zinc-100 p-1 dark:border-white/10 dark:bg-white/5 md:flex">
            <button
              type="button"
              onClick={() => setMode("ws")}
              aria-pressed={mode === "ws"}
              className={cn(
                "relative flex h-8 items-center gap-1.5 overflow-hidden rounded-full px-3 text-[10px] font-black uppercase tracking-widest transition-colors",
                mode === "ws" ? activeToggleClassName : inactiveToggleClassName,
              )}
            >
              {mode === "ws" && <ToggleHighlight layoutId="workspace-mode-highlight" />}
              <motion.span
                className="relative z-10 inline-flex items-center gap-1.5"
                animate={{ y: mode === "ws" ? 0 : 1, scale: mode === "ws" ? 1 : 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {locale === "ar" ? "العمل" : "Work"}
              </motion.span>
            </button>
            <button
              type="button"
              onClick={() => setMode("ai")}
              aria-pressed={mode === "ai"}
              className={cn(
                "relative flex h-8 items-center gap-1.5 overflow-hidden rounded-full px-3 text-[10px] font-black uppercase tracking-widest transition-colors",
                mode === "ai" ? activeToggleClassName : inactiveToggleClassName,
              )}
            >
              {mode === "ai" && <ToggleHighlight layoutId="workspace-mode-highlight" />}
              <motion.span
                className="relative z-10 inline-flex items-center gap-1.5"
                animate={{ y: mode === "ai" ? 0 : 1, scale: mode === "ai" ? 1 : 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              >
                <Bot className="h-3.5 w-3.5" />
                {locale === "ar" ? "الذكاء" : "AI"}
              </motion.span>
            </button>
          </div>
          <div className="flex items-center rounded-full border border-zinc-100 bg-zinc-100 p-1 dark:border-white/10 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-label={locale === "ar" ? "تفعيل الوضع الفاتح" : "Use light mode"}
              aria-pressed={!isDark}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full transition-colors",
                !isDark ? activeToggleClassName : inactiveToggleClassName,
              )}
            >
              {!isDark && <ToggleHighlight layoutId="theme-highlight" />}
              <motion.span
                className="relative z-10"
                animate={{ rotate: !isDark ? 0 : -18, scale: !isDark ? 1 : 0.9 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              >
                <Sun className="h-4 w-4" />
              </motion.span>
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-label={locale === "ar" ? "تفعيل الوضع الداكن" : "Use dark mode"}
              aria-pressed={isDark}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full transition-colors",
                isDark ? activeToggleClassName : inactiveToggleClassName,
              )}
            >
              {isDark && <ToggleHighlight layoutId="theme-highlight" />}
              <motion.span
                className="relative z-10"
                animate={{ rotate: isDark ? 0 : 18, scale: isDark ? 1 : 0.9 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              >
                <Moon className="h-4 w-4" />
              </motion.span>
            </button>
          </div>
          <LanguageSwitcher className="hidden sm:inline-flex opacity-70 hover:opacity-100" />
          
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-zinc-400 shadow-none transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="sr-only">{t('live')}</span>
          </Button>
        </div>

        <div className="ms-2 border-l border-zinc-100 ps-4 dark:border-white/10">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

function ToggleHighlight({ layoutId }: { layoutId: string }) {
  return (
    <motion.span
      layoutId={layoutId}
      className="absolute inset-0 rounded-full bg-white shadow-none dark:bg-white"
      transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
    />
  );
}

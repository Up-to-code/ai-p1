"use client";

import { Bell, Bot, BriefcaseBusiness, ChevronDown, LayoutDashboard, Moon, Package, Plus, Sun, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { WorkspaceGlobalSearch } from "@/components/layout/workspace-global-search";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { BrandMark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from "@/components/providers/theme-provider";
import { parseWorkspaceMode, useWorkspaceStore, workspaceModeHref, type WorkspaceMode } from "@/domains/dashboard/store/dashboard.store";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function Topbar() {
  const t = useTranslations('Topbar');
  const tWorkspace = useTranslations('Workspace');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark, setTheme } = useTheme();
  const storedMode = useWorkspaceStore((state) => state.mode);
  const activeAiThreadId = useWorkspaceStore((state) => state.activeAiThreadId);
  const setActiveAiThreadId = useWorkspaceStore((state) => state.setActiveAiThreadId);
  const setMode = useWorkspaceStore((state) => state.setMode);
  const mode = pathname === "/dashboard" ? parseWorkspaceMode(searchParams.get("mode")) : storedMode;
  const activeToggleClassName = "text-background";
  const inactiveToggleClassName = "text-text-muted hover:text-text-primary";
  const createActions = [
    { label: tWorkspace("createClient"), href: "/clients/create", icon: UserPlus },
    { label: tWorkspace("createProject"), href: "/projects/create", icon: BriefcaseBusiness },
    { label: tWorkspace("createAsset"), href: "/assets/create", icon: Package },
  ];

  useEffect(() => {
    const threadId = searchParams.get("threadId")?.trim();
    if (threadId) setActiveAiThreadId(threadId);
  }, [searchParams, setActiveAiThreadId]);

  function selectMode(nextMode: WorkspaceMode) {
    setMode(nextMode);
    router.push(workspaceModeHref(nextMode, nextMode === "ai" ? activeAiThreadId : undefined));
  }

  return (
    <header className={cn(
      "flex h-[var(--topbar-height)] items-center gap-4 border-b border-[var(--color-divider)] bg-background/95 px-8 transition-all duration-300",
      isRtl && "font-cairo"
    )}>

      <div className="flex flex-1 items-center gap-6">
        {mode === "ai" && (
          <div className="flex items-center gap-2 text-zinc-950 dark:text-white">
            <BrandMark className="h-6 w-6" priority />
            <span className="hidden text-sm font-black md:inline-block">qentrah</span>
          </div>
        )}
        <WorkspaceGlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-text-primary px-3 text-[11px] font-black uppercase tracking-wider text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:px-4"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{tWorkspace("create")}</span>
                  <ChevronDown className="hidden h-3.5 w-3.5 opacity-70 sm:block" />
                </button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-48 rounded-2xl border-[var(--color-divider)] p-1.5">
              {createActions.map((action) => (
                <DropdownMenuItem
                  key={action.href}
                  onClick={() => router.push(action.href)}
                  className="cursor-pointer rounded-xl px-2.5 py-2 text-sm font-bold"
                >
                  <action.icon className="h-4 w-4 text-text-muted" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="hidden items-center rounded-full border border-[var(--color-divider)] bg-transparent p-1 md:flex">
            <button
              type="button"
              onClick={() => selectMode("ws")}
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
                {tWorkspace("modeWs")}
              </motion.span>
            </button>
            <button
              type="button"
              onClick={() => selectMode("ai")}
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
          <div className="flex items-center rounded-full border border-[var(--color-divider)] bg-transparent p-1">
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
          
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-transparent text-text-muted shadow-none transition-all hover:border-[var(--color-divider)] hover:bg-transparent hover:text-text-primary">
            <Bell className="h-5 w-5" />
            <span className="sr-only">{t('live')}</span>
          </Button>
        </div>

        <div className="ms-2 border-l border-[var(--color-divider)] ps-4">
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
      className="absolute inset-0 rounded-full bg-text-primary shadow-none"
      transition={{ type: "spring", stiffness: 500, damping: 38, mass: 0.7 }}
    />
  );
}

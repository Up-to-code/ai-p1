"use client";

import { Bell, BriefcaseBusiness, ChevronDown, KanbanSquare, ListTodo, Moon, PanelLeft, Plus, Sun, UserPlus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/routing";

import { ProfileMenu } from "@/components/layout/profile-menu";
import { WorkspaceGlobalSearch } from "@/components/layout/workspace-global-search";
import { ProjectSwitcher } from "@/components/layout/project-switcher";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from "@/components/providers/theme-provider";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function Topbar() {
  const t = useTranslations('Topbar');
  const tWorkspace = useTranslations('Workspace');
  const tSidebar = useTranslations('Sidebar');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark, setTheme } = useTheme();
  const { isOpen, toggleSidebar } = useSidebar();
  const setActiveAiThreadId = useWorkspaceStore((state) => state.setActiveAiThreadId);
  const activeToggleClassName = "text-background";
  const inactiveToggleClassName = "text-text-muted hover:text-text-primary";

  const createActions = [
    { label: tSidebar("tasks"), href: "/tasks?new=true", icon: ListTodo },
    { label: tSidebar("opportunities"), href: "/opportunities?new=true", icon: KanbanSquare },
    { label: tWorkspace("createClient"), href: "/clients/create", icon: UserPlus },
    { label: tWorkspace("createProject"), href: "/projects/create", icon: BriefcaseBusiness },
    { label: tSidebar("team"), href: "/settings/organization/members?new=true", icon: UsersRound },
  ];


  useEffect(() => {
    const threadId = searchParams.get("threadId")?.trim();
    if (threadId) setActiveAiThreadId(threadId);
  }, [searchParams, setActiveAiThreadId]);

  return (
    <header className={cn(
      "flex h-[var(--topbar-height)] items-center gap-4 border-b border-[var(--color-divider)] bg-background/95 px-8 transition-all duration-300",
      isRtl && "font-cairo"
    )}>

      <div className="flex flex-1 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-text-muted hover:bg-[var(--color-divider)] hover:text-text-primary"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <ProjectSwitcher />
        <WorkspaceGlobalSearch />
      </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 me-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button className="h-8 rounded-lg bg-primary hover:bg-primary/90 text-white px-3 text-xs font-semibold flex items-center gap-1.5 shadow-none border-0">
                    <Plus className="h-4 w-4" />
                    <span>{tSidebar("tasks")}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-70 ms-0.5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-56 rounded-2xl border-[var(--color-divider)] p-1">
                <div className="flex items-center justify-between px-3 py-2 text-xs">
                  <span className="font-semibold text-text-muted">Create</span>
                  <Link href="/settings/workspace" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    Manage
                  </Link>
                </div>
                <div className="mb-1 h-px w-full bg-[var(--color-divider)]" />
                <div className="space-y-0.5 p-1">
                  {createActions.map((action) => (
                    <DropdownMenuItem
                      key={action.href}
                      onClick={() => router.push(action.href)}
                      className="cursor-pointer rounded-xl px-2.5 py-2 text-sm font-semibold hover:bg-muted dark:hover:bg-muted"
                    >
                      <action.icon className="me-2 h-4 w-4 text-text-muted" strokeWidth={2} />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
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

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-transparent text-text-muted shadow-none transition-all hover:border-[var(--color-divider)] hover:bg-transparent hover:text-text-primary">
            <Bell className="h-4 w-4" />
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

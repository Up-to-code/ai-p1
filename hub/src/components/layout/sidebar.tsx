"use client";
import { Link, usePathname } from "@/i18n/routing";
import Image from "next/image";
import {
  Building2,
  House,
  UserRound,
  Landmark,
  Plug,
  History as HistoryIcon,
  Building,
  CalendarDays,
  Sun,
  Moon,
  MoreHorizontal,
  Menu,
  Mail,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations, useLocale } from 'next-intl';
import { useSidebar } from "./sidebar-context";
import { useState } from "react";

const navigationGroups = [
  {
    label: "workspace",
    items: [
      { name: "dashboard", href: "/dashboard", icon: House },
      { name: "activity", href: "/activity", icon: HistoryIcon },
    ],
  },
  {
    label: "operations",
    items: [
      { name: "projects", href: "/projects", icon: Building2 },
      { name: "units", href: "/properties", icon: Building },
      { name: "clients", href: "/clients", icon: UserRound },
      { name: "calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    label: "administration",
    items: [
      { name: "organization", href: "/organization", icon: Landmark },
      { name: "integrations", href: "/integrations", icon: Plug },
    ],
  },
];

const accountContext = {
  organization: "Acme Corporation",
  status: "Approved workspace",
  name: "Ahmed Mansour",
  role: "Organization Owner",
  email: "ahmed@acme.com",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop",
};

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode as per request

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 relative shrink-0 overflow-hidden border-e shadow-none",
        isDarkMode 
          ? "bg-[#0F0F0F] border-white/5" 
          : "bg-white border-zinc-200",
        isCollapsed ? "w-[var(--sidebar-width-collapsed)]" : "w-[var(--sidebar-width-expanded)]",
        isRtl && "font-cairo"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-14 items-center px-4 gap-4 border-b shrink-0",
        isDarkMode ? "border-white/5" : "border-zinc-100"
      )}>
        <button 
          onClick={toggleCollapsed}
          className={cn(
            "p-2 rounded-full transition-all",
            isDarkMode ? "text-zinc-400 hover:text-white hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          )}
        >
          <Menu className="h-5 w-5" />
        </button>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center">
               <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
            </div>
            <span className={cn(
              "font-black text-lg tracking-tight lowercase",
              isDarkMode ? "text-white" : "text-zinc-900"
            )}>anan</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-none">
        {navigationGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!isCollapsed && (
              <h4 className={cn(
                "px-3 text-[10px] font-black uppercase tracking-[0.2em] mb-2",
                isDarkMode ? "text-zinc-600" : "text-zinc-400"
              )}>{t(`groups.${group.label}`)}</h4>
            )}
            {group.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const itemName = t(item.name);

              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-10 items-center rounded-xl px-3 transition-all duration-200 group relative",
                          isActive
                            ? (isDarkMode ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-900")
                            : (isDarkMode ? "text-zinc-500 hover:text-white hover:bg-white/5" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"),
                          isCollapsed && "justify-center px-0 mx-auto w-10"
                        )}
                      >
                        <item.icon className={cn(
                          "h-[18px] w-[18px] transition-all",
                          isActive ? (isDarkMode ? "text-white" : "text-zinc-900") : "group-hover:text-zinc-900 dark:group-hover:text-white"
                        )} />
                        {!isCollapsed && (
                          <span className={cn(
                            "ms-4 text-[13px] transition-all flex-1 font-bold tracking-tight"
                          )}>
                            {itemName}
                          </span>
                        )}
                      </Link>
                    }
                  />
                  {isCollapsed && (
                    <TooltipContent side={isRtl ? "left" : "right"} className={cn(
                      "text-white border-white/10",
                      isDarkMode ? "bg-zinc-900" : "bg-zinc-950 shadow-none"
                    )}>
                      {itemName}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Pinned Section */}
      <div className={cn(
        "mt-auto border-t bg-inherit",
        isDarkMode ? "border-white/5" : "border-zinc-100"
      )}>

        <div className="p-3 pt-0 space-y-3">
          <div className={cn(
            "flex items-center border rounded-full p-1",
            isDarkMode ? "bg-zinc-900/50 border-white/10" : "bg-zinc-100 border-zinc-200",
            isCollapsed ? "flex-col gap-1 w-10 mx-auto" : "justify-between px-1"
          )}>
            <button onClick={() => setIsDarkMode(false)} className={cn("h-8 flex items-center justify-center rounded-full transition-all", !isDarkMode ? "bg-white text-zinc-900 shadow-none" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white", isCollapsed ? "w-8" : "flex-1")}>
              <Sun className="h-4 w-4" />
            </button>
            <button onClick={() => setIsDarkMode(true)} className={cn("h-8 flex items-center justify-center rounded-full transition-all", isDarkMode ? "bg-white text-zinc-900 shadow-none" : "text-zinc-500 hover:text-white", isCollapsed ? "w-8" : "flex-1")}>
              <Moon className="h-4 w-4" />
            </button>
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/profile/settings"
                  className={cn(
                    "group block rounded-2xl transition-all",
                    isDarkMode ? "hover:bg-white/5" : "hover:bg-zinc-50",
                    isCollapsed && "mx-auto flex h-10 w-10 items-center justify-center rounded-full"
                  )}
                >
                  {!isCollapsed && (
                    <div className={cn(
                      "mb-2 rounded-2xl border p-3",
                      isDarkMode ? "border-white/10 bg-zinc-900/40" : "border-zinc-200 bg-white"
                    )}>
                      <div className="flex items-start gap-2.5">
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                          isDarkMode ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-900"
                        )}>
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "truncate text-[13px] font-black tracking-tight",
                            isDarkMode ? "text-white" : "text-zinc-900"
                          )}>
                            {accountContext.organization}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                            <span className={cn(
                              "truncate text-[10px] font-bold uppercase tracking-wider",
                              isDarkMode ? "text-zinc-500" : "text-zinc-400"
                            )}>
                              {accountContext.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "flex items-center gap-3 transition-all",
                    isCollapsed ? "justify-center" : "px-1.5 py-1.5"
                  )}>
                    <div className={cn(
                      "relative h-9 w-9 shrink-0 overflow-hidden rounded-full border",
                      isDarkMode ? "border-white/10" : "border-zinc-200"
                    )}>
                      <Image src={accountContext.image} alt={accountContext.name} fill className="object-cover" />
                    </div>
                    {!isCollapsed && (
                      <>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className={cn(
                              "truncate text-sm font-black leading-tight",
                              isDarkMode ? "text-white" : "text-zinc-900"
                            )}>
                              {accountContext.name}
                            </p>
                            <span className={cn(
                              "hidden shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider sm:inline-flex",
                              isDarkMode ? "bg-white/10 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                            )}>
                              {accountContext.role}
                            </span>
                          </div>
                          <div className="mt-1 flex min-w-0 items-center gap-1.5">
                            <Mail className={cn(
                              "h-3 w-3 shrink-0",
                              isDarkMode ? "text-zinc-600" : "text-zinc-400"
                            )} />
                            <p className={cn(
                              "truncate text-[11px] font-semibold",
                              isDarkMode ? "text-zinc-500" : "text-zinc-500"
                            )}>
                              {accountContext.email}
                            </p>
                          </div>
                        </div>
                        <MoreHorizontal className="me-1 h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white" />
                      </>
                    )}
                  </div>
                </Link>
              }
            />
            {isCollapsed && (
              <TooltipContent side={isRtl ? "left" : "right"} className={cn(
                "max-w-56 text-white border-white/10",
                isDarkMode ? "bg-zinc-900" : "bg-zinc-950 shadow-none"
              )}>
                <div className="space-y-1">
                  <p className="text-xs font-bold">{accountContext.name}</p>
                  <p className="text-[11px] text-zinc-400">{accountContext.email}</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">{accountContext.organization}</p>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}

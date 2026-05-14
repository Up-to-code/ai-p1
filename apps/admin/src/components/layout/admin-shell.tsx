"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { LockKeyhole, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, X } from "lucide-react";
import { brandLabel } from "@qentrah/brand-identity";
import { getAdminPrimaryNav } from "@/lib/admin-sections";
import { cn } from "@/lib/utils";
import { LanguageToggle } from "@/components/language-toggle";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AdminIdentity } from "@/lib/admin-auth";
import { adminRoleLabel } from "@/lib/admin-roles";

type AdminLocale = "en" | "ar";

const shellCopy = {
  en: {
    adminNavigation: "Admin navigation",
    admin: "Admin",
    platform: "Platform",
    platformSecurity: "Platform security",
    serverConsole: "Server-side admin console",
    noBrowserSecrets: "No browser secrets",
    signedIn: "Signed in",
    signOut: "Sign out",
    trustBoundary: "Trust boundary",
    platformAdmin: "Work map",
    securityReviewer: "Review",
    supportOperator: "Operations",
    auditViewer: "Evidence",
    language: {
      english: "English",
      arabic: "Arabic",
      switchToEnglish: "Switch to English",
      switchToArabic: "Switch to Arabic",
    },
  },
  ar: {
    adminNavigation: "تنقل الإدارة",
    admin: "الإدارة",
    platform: "المنصة",
    platformSecurity: "أمان المنصة",
    serverConsole: "لوحة إدارة من جهة الخادم",
    noBrowserSecrets: "لا أسرار في المتصفح",
    signedIn: "تم تسجيل الدخول",
    signOut: "خروج",
    trustBoundary: "حدود الثقة",
    platformAdmin: "خريطة العمل",
    securityReviewer: "المراجعة",
    supportOperator: "العمليات",
    auditViewer: "الأدلة",
    language: {
      english: "English",
      arabic: "العربية",
      switchToEnglish: "التبديل إلى الإنجليزية",
      switchToArabic: "التبديل إلى العربية",
    },
  },
} as const;

export function AdminShell({ children, locale, identity }: { children: React.ReactNode; locale: AdminLocale; identity: AdminIdentity }) {
  return (
    <ThemeProvider>
      <AdminChrome locale={locale} identity={identity}>{children}</AdminChrome>
    </ThemeProvider>
  );
}

function AdminChrome({ children, locale, identity }: { children: React.ReactNode; locale: AdminLocale; identity: AdminIdentity }) {
  const pathname = usePathname();
  const navItems = getAdminPrimaryNav(locale);
  const t = shellCopy[locale];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const groupedNav = useMemo(() => {
    const has = (role: string) => identity.roles.includes(role as never);
    const item = (href: string) => navItems.find((candidate) => candidate.href === href);
    const platform = navItems;
    const security = ["/", "/security", "/apps", "/oauth-clients", "/api-keys", "/mcp-connections", "/webhooks", "/ai-activity", "/audit-logs"].map(item).filter(Boolean) as typeof navItems;
    const support = ["/", "/organizations", "/users", "/workspace-data", "/ai-activity"].map(item).filter(Boolean) as typeof navItems;
    const audit = ["/", "/security", "/audit-logs"].map(item).filter(Boolean) as typeof navItems;
    if (has("platform_admin")) return [{ label: t.platformAdmin, items: platform }];
    return [
      has("security_reviewer") ? { label: t.securityReviewer, items: security } : null,
      has("support_operator") ? { label: t.supportOperator, items: support } : null,
      has("audit_viewer") ? { label: t.auditViewer, items: audit } : null,
    ].filter(Boolean) as Array<{ label: string; items: typeof navItems }>;
  }, [identity.roles, navItems, t.auditViewer, t.platformAdmin, t.securityReviewer, t.supportOperator]);

  const sidebar = (
    <aside data-testid="admin-sidebar" data-collapsed={collapsed ? "true" : "false"} className={cn(
      "flex h-full shrink-0 flex-col overflow-hidden border-e border-zinc-200 bg-white shadow-none transition-[width] duration-200 dark:border-white/5 dark:bg-[#0F0F0F]",
      collapsed ? "w-[76px]" : "w-[var(--sidebar-width-expanded)]",
    )}>
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-100 px-4 dark:border-white/5">
        <button
          type="button"
          className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
          aria-label={t.adminNavigation}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
        {!collapsed ? (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white ring-1 ring-blue-400/30">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">{brandLabel(locale)}</p>
              <p className="truncate text-sm font-black tracking-tight text-zinc-950 dark:text-white">{t.admin}</p>
            </div>
          </div>
        ) : null}
      </div>

      <nav className="scrollbar-none flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groupedNav.map((group) => (
          <div key={group.label} className="space-y-0.5">
            {!collapsed ? (
              <h4 className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {group.label}
              </h4>
            ) : null}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={`${group.label}-${item.href}`}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex h-10 items-center rounded-xl px-3 text-[13px] font-bold tracking-tight transition-all duration-200",
                    collapsed && "justify-center",
                    active
                      ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-white",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed ? <span className="ms-4 flex-1 truncate">{item.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed ? (
        <div className="border-t border-zinc-100 p-4 dark:border-white/5">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t.trustBoundary}</p>
            <p className="mt-3 break-all text-xs font-black text-zinc-950 dark:text-white">app.qentrah.com</p>
            <p className="mt-1 break-all text-xs font-black text-zinc-500 dark:text-zinc-400">admin.qentrah.com</p>
            <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t.signedIn}</p>
              <p className="mt-2 truncate text-xs font-black text-zinc-950 dark:text-white">{identity.email}</p>
              <p className="mt-1 text-xs font-black text-blue-600 dark:text-blue-300">
                {identity.roles.map((role) => adminRoleLabel(role, locale)).join(", ")}
              </p>
              <AdminLogoutButton label={t.signOut} />
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-text-primary">
      <div className="hidden lg:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-zinc-950/40 lg:hidden">
          <div className="absolute inset-y-0 start-0 flex max-w-[88vw]">
            {sidebar}
            <button type="button" aria-label="Close navigation" className="m-3 h-10 w-10 rounded-full bg-white text-zinc-950" onClick={() => setMobileOpen(false)}>
              <X className="mx-auto h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#0A0A0A]">
        <header className="flex h-[var(--topbar-height)] shrink-0 items-center gap-4 border-b border-zinc-100 bg-white/70 px-4 backdrop-blur-md transition-all duration-300 dark:border-white/5 dark:bg-[#0A0A0A]/70 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 lg:hidden">
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t.platformSecurity}</p>
              <p className="text-sm font-black text-zinc-950 dark:text-white">{t.serverConsole}</p>
            </div>
          </div>
          <ThemeToggle />
          <LanguageToggle locale={locale} labels={t.language} />
          <div className="hidden items-center gap-2 rounded-full border border-zinc-100 bg-zinc-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 md:flex">
            <LockKeyhole className="h-3.5 w-3.5" />
            {t.noBrowserSecrets}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto outline-none">{children}</main>
      </div>
    </div>
  );
}

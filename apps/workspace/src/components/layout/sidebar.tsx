"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/routing";
import {
  Building2,
  House,
  UserRound,
  Landmark,
  Plug,
  History as HistoryIcon,
  Building,
  CalendarDays,
  MessageSquareText,
  MoreHorizontal,
  Menu,
  Mail,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from 'next-intl';
import { useSidebar } from "./sidebar-context";
import { useAccountContext } from "@/domains/auth";
import { useTheme } from "@/components/providers/theme-provider";
import { authClient } from "@/lib/auth-client";
import { selectExistingOrganization, type AuthResult } from "@/domains/auth/organization-selection";
import { writeAuthHandoff } from "@/domains/auth";
import { useAgentThreadsQuery } from "@/domains/agents";
import { workspaceModeHref } from "@/domains/dashboard/store/dashboard.store";

type BetterAuthOrganization = {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
};

type SidebarAuthClient = typeof authClient & {
  organization: {
    setActive: (input: { organizationId: string }) => Promise<AuthResult<BetterAuthOrganization | null>>;
  };
};

const organizationApi = authClient as SidebarAuthClient;

const navigationGroups = [
  {
    label: "workspace",
    items: [
      { name: "dashboard", href: "/dashboard", icon: House },
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
      { name: "organization", href: "/settings/organization", icon: Landmark },
      { name: "billing", href: "/billing", icon: CreditCard },
      { name: "activity", href: "/activity", icon: HistoryIcon },
      { name: "integrations", href: "/web-apps", icon: Plug },
    ],
  },
];

function isGeneratedOrganizationName(value: string) {
  const normalized = value.trim();

  return (
    normalized.length > 18 &&
    /^[a-z0-9_-]+$/i.test(normalized) &&
    /[0-9]/.test(normalized)
  );
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AN";
}

export function Sidebar() {
  const t = useTranslations('Sidebar');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeThreadId = searchParams.get("threadId")?.trim();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const { isDark: isDarkMode } = useTheme();
  const account = useAccountContext();
  const workspaceOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : null;
  const queriedAgentThreads = useAgentThreadsQuery(workspaceOrganizationId, {
    enabled: Boolean(workspaceOrganizationId),
    limit: 50,
  });
  const agentThreads = useMemo(() => queriedAgentThreads ?? [], [queriedAgentThreads]);
  const visibleAgentThreads = agentThreads.slice(0, 3);
  const hasMoreAgentThreads = agentThreads.length > visibleAgentThreads.length;
  const organizationsQuery = authClient.useListOrganizations();
  const organizations = useMemo(
    () => ((organizationsQuery.data ?? []) as BetterAuthOrganization[])
      .filter((organization) => organization.id)
      .slice(0, 4),
    [organizationsQuery.data],
  );
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null);
  const [threadHistoryOpen, setThreadHistoryOpen] = useState(false);
  const [threadSearch, setThreadSearch] = useState("");
  const organizationDisplayName =
    account.organization.legalName?.trim() ||
    (!isGeneratedOrganizationName(account.organization.name) ? account.organization.name : locale === "ar" ? "المؤسسة" : "Organization");
  const organizationsLabel = locale === "ar" ? "مساحات العمل" : "Workspaces";
  const currentLabel = locale === "ar" ? "الحالية" : "Current";
  const threadsLabel = locale === "ar" ? "المحادثات" : "Threads";
  const newThreadLabel = locale === "ar" ? "جديد" : "New";
  const historyLabel = locale === "ar" ? "السجل" : "History";
  const threadHistoryTitle = locale === "ar" ? "سجل المحادثات" : "Thread history";
  const threadHistoryDescription = locale === "ar"
    ? "ابحث في محادثات الذكاء لهذه المساحة."
    : "Search AI threads for this workspace.";
  const threadSearchPlaceholder = locale === "ar" ? "ابحث في المحادثات..." : "Search threads...";
  const emptyThreadsLabel = locale === "ar" ? "لا توجد محادثات بعد" : "No threads yet";
  const filteredAgentThreads = useMemo(() => {
    const query = threadSearch.trim().toLowerCase();
    if (!query) return agentThreads;
    return agentThreads.filter((thread) => thread.title.toLowerCase().includes(query));
  }, [agentThreads, threadSearch]);

  async function switchOrganization(organizationId: string) {
    if (organizationId === account.organization.id || switchingOrganizationId) return;

    setSwitchingOrganizationId(organizationId);
    try {
      await selectExistingOrganization({
        organizationId,
        setActive: organizationApi.organization.setActive,
        navigate: (href, selectedOrganizationId) => {
          writeAuthHandoff(selectedOrganizationId);
          window.location.replace(href);
        },
        nextHref: `/${locale}${pathname}`,
      });
    } catch {
      setSwitchingOrganizationId(null);
    }
  }

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
            <div className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1",
              isDarkMode ? "bg-white/10 ring-white/10" : "bg-white ring-zinc-200"
            )}>
              <Image
                src={isDarkMode ? "/brand-logo-white.svg" : "/brand-logo-dark-blue.svg"}
                alt="Qentrah"
                width={20}
                height={24}
                className="h-5 w-5"
                priority
              />
            </div>
            <span className={cn(
              "font-black text-lg tracking-tight lowercase",
              isDarkMode ? "text-white" : "text-zinc-900"
            )}>qentrah</span>
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
              const itemHref = item.href === "/dashboard" ? workspaceModeHref("ws") : item.href;
              const isActive = pathname.startsWith(item.href);
              const itemName = t(item.name);

              return (
                <Link
                  key={item.name}
                  href={itemHref}
                  aria-label={isCollapsed ? itemName : undefined}
                  title={isCollapsed ? itemName : undefined}
                  className={cn(
                    "group relative flex h-10 items-center rounded-xl px-3 transition-all duration-200",
                    isActive
                      ? (isDarkMode ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-900")
                      : (isDarkMode ? "text-zinc-500 hover:bg-white/5 hover:text-white" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"),
                    isCollapsed && "mx-auto w-10 justify-center px-0"
                  )}
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px] transition-all",
                    isActive ? (isDarkMode ? "text-white" : "text-zinc-900") : "group-hover:text-zinc-900 dark:group-hover:text-white"
                  )} />
                  {!isCollapsed && (
                    <span className="ms-4 flex-1 text-[13px] font-bold tracking-tight transition-all">
                      {itemName}
                    </span>
                  )}
                </Link>
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

        <div className="space-y-3 p-3 pt-3">
          {!isCollapsed && organizations.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  isDarkMode ? "text-zinc-600" : "text-zinc-400"
                )}>
                  {organizationsLabel}
                </p>
              </div>
              <div className="space-y-1">
                {organizations.map((organization) => {
                  const isActive = organization.id === account.organization.id;
                  const isSwitching = switchingOrganizationId === organization.id;
                  const organizationName = organization.name?.trim() || (locale === "ar" ? "مؤسسة" : "Organization");

                  return (
                    <button
                      key={organization.id}
                      type="button"
                      onClick={() => switchOrganization(organization.id)}
                      disabled={isActive || Boolean(switchingOrganizationId)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-start transition-all",
                        isActive
                          ? isDarkMode ? "bg-white/[0.08] text-white" : "bg-zinc-100 text-zinc-950"
                          : isDarkMode ? "text-zinc-500 hover:bg-white/5 hover:text-white" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
                        "disabled:cursor-default disabled:opacity-100"
                      )}
                      title={organizationName}
                    >
                      <span className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[9px] font-black uppercase",
                        isActive
                          ? isDarkMode ? "bg-white/15 text-white" : "bg-white text-zinc-950"
                          : isDarkMode ? "bg-white/10 text-zinc-300" : "bg-zinc-100 text-zinc-600"
                      )}>
                        {organization.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={organization.logo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          getInitials(organizationName)
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-black leading-tight">{organizationName}</span>
                        <span className={cn(
                          "mt-0.5 block truncate text-[9px] font-bold uppercase tracking-wider",
                          isActive ? "text-emerald-500" : isDarkMode ? "text-zinc-600" : "text-zinc-400"
                        )}>
                          {isActive ? currentLabel : organization.slug || organization.id}
                        </span>
                      </span>
                      {isSwitching && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isCollapsed && workspaceOrganizationId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  isDarkMode ? "text-zinc-600" : "text-zinc-400"
                )}>
                  {threadsLabel}
                </p>
                <Link
                  href={workspaceModeHref("ai")}
                  className={cn(
                    "inline-flex h-6 items-center gap-1 rounded-full px-2 text-[9px] font-black uppercase tracking-wider transition-all",
                    isDarkMode ? "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                  )}
                >
                  <Plus className="h-3 w-3" />
                  {newThreadLabel}
                </Link>
              </div>
              <div className="space-y-1">
                {visibleAgentThreads.length > 0 ? (
                  visibleAgentThreads.map((thread) => {
                    const isActive = activeThreadId === thread.id;

                    return (
                      <Link
                        key={thread.id}
                        href={workspaceModeHref("ai", thread.id)}
                        className={cn(
                          "flex min-h-9 items-center gap-2 rounded-xl px-2.5 py-2 text-start transition-all",
                          isActive
                            ? isDarkMode ? "bg-primary/20 text-white" : "bg-primary/10 text-zinc-950"
                            : isDarkMode ? "text-zinc-500 hover:bg-white/5 hover:text-white" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                        )}
                        title={thread.title}
                      >
                        <MessageSquareText className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isActive ? "text-primary" : isDarkMode ? "text-zinc-600" : "text-zinc-400"
                        )} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-black leading-tight">{thread.title}</span>
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <p className={cn(
                    "rounded-xl px-2.5 py-2 text-[11px] font-semibold",
                    isDarkMode ? "text-zinc-600" : "text-zinc-400"
                  )}>
                    {emptyThreadsLabel}
                  </p>
                )}
                {hasMoreAgentThreads && (
                  <button
                    type="button"
                    onClick={() => setThreadHistoryOpen(true)}
                    className={cn(
                      "flex h-8 w-full items-center justify-center gap-2 rounded-xl px-2 text-[10px] font-black uppercase tracking-wider transition-all",
                      isDarkMode ? "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                    )}
                  >
                    <HistoryIcon className="h-3.5 w-3.5" />
                    {historyLabel}
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            className={cn(
              "block rounded-2xl transition-all",
              isCollapsed && "mx-auto flex h-10 w-10 items-center justify-center rounded-full"
            )}
          >
            {!isCollapsed && (
              <Link
                href="/settings/organization"
                className={cn(
                  "mb-2 block rounded-2xl border p-3 transition-all",
                  isDarkMode ? "border-white/10 bg-zinc-900/40 hover:bg-white/5" : "border-zinc-200 bg-white hover:bg-zinc-50"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[10px] font-black uppercase",
                    isDarkMode ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-900"
                  )}>
                    {account.organization.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={account.organization.logo}
                        alt={organizationDisplayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      account.organization.initials || <Building2 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-[13px] font-black tracking-tight",
                        isDarkMode ? "text-white" : "text-zinc-900"
                      )}
                      title={organizationDisplayName}
                    >
                      {organizationDisplayName}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                      <span
                        className={cn(
                          "truncate text-[10px] font-bold uppercase tracking-wider",
                          isDarkMode ? "text-zinc-500" : "text-zinc-400"
                        )}
                        title={locale === "ar" ? "إعدادات المؤسسة" : "Organization settings"}
                      >
                        {locale === "ar" ? "إعدادات المؤسسة" : "Organization settings"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <Link
              href="/profile/settings"
              aria-label={isCollapsed ? account.user.name : undefined}
              title={isCollapsed ? account.user.name : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-2xl transition-all",
                isDarkMode ? "hover:bg-white/5" : "hover:bg-zinc-50",
                isCollapsed ? "justify-center" : "px-1.5 py-1.5"
              )}
            >
              <IdentityAvatar
                image={account.user.image}
                initials={account.user.initials}
                name={account.user.name}
                isDarkMode={isDarkMode}
              />
              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={cn(
                        "max-w-[9.5rem] truncate text-sm font-black leading-tight",
                        isDarkMode ? "text-white" : "text-zinc-900"
                      )} title={account.user.name}>
                        {account.user.name}
                      </p>
                      <span className={cn(
                        "hidden max-w-[6.5rem] shrink-0 truncate rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider sm:inline-flex",
                        isDarkMode ? "bg-white/10 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                      )} title={organizationDisplayName}>
                        {locale === "ar" ? "فريق" : "Team"}
                      </span>
                    </div>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5">
                      <Mail className={cn(
                        "h-3 w-3 shrink-0",
                        isDarkMode ? "text-zinc-600" : "text-zinc-400"
                      )} />
                      <p className={cn(
                        "max-w-[14rem] truncate text-[11px] font-semibold",
                        isDarkMode ? "text-zinc-500" : "text-zinc-500"
                      )} title={account.user.email}>
                        {account.user.email}
                      </p>
                    </div>
                  </div>
                  <MoreHorizontal className="me-1 h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-900 dark:group-hover:text-white" />
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
      <Dialog open={threadHistoryOpen} onOpenChange={setThreadHistoryOpen}>
        <DialogContent className="max-w-lg gap-4 rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle>{threadHistoryTitle}</DialogTitle>
            <DialogDescription>{threadHistoryDescription}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={threadSearch}
              onChange={(event) => setThreadSearch(event.target.value)}
              placeholder={threadSearchPlaceholder}
              className="rounded-xl ps-9"
            />
          </div>
          <div className="max-h-[420px] space-y-1 overflow-y-auto pe-1">
            {filteredAgentThreads.length > 0 ? (
              filteredAgentThreads.map((thread) => {
                const isActive = activeThreadId === thread.id;

                return (
                  <Link
                    key={thread.id}
                    href={workspaceModeHref("ai", thread.id)}
                    onClick={() => setThreadHistoryOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-start transition-all",
                      isActive
                        ? "bg-primary/10 text-zinc-950 dark:bg-primary/20 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                    title={thread.title}
                  >
                    <MessageSquareText className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-zinc-400")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black leading-tight">{thread.title}</span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {new Date(thread.lastMessageAt).toLocaleDateString(locale, { month: "short", day: "numeric" })}
                      </span>
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="rounded-xl bg-zinc-50 px-3 py-6 text-center text-sm font-semibold text-zinc-400 dark:bg-white/5">
                {emptyThreadsLabel}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

function IdentityAvatar({
  image,
  initials,
  name,
  isDarkMode,
}: {
  image: string | null;
  initials: string;
  name: string;
  isDarkMode: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border text-[11px] font-black uppercase",
        isDarkMode ? "border-white/10 bg-white/10 text-white" : "border-zinc-200 bg-zinc-100 text-zinc-700"
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

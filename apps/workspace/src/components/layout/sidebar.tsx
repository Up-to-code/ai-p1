"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/routing";
import {
  BriefcaseBusiness,
  UserRound,
  Plug,
  History as HistoryIcon,
  CalendarDays,
  KanbanSquare,
  ListTodo,
  MessageSquareText,
  Loader2,
  Plus,
  Workflow,
  Search,
  Settings,
  Trash2,
  Bot,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useTranslations, useLocale } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import { useTheme } from "@/components/providers/theme-provider";
import { authClient } from "@/lib/auth-client";
import { selectExistingOrganization, type AuthResult } from "@/domains/auth/organization-selection";
import { writeAuthHandoff } from "@/domains/auth";
import { deleteAgentThreadRequest, useAgentThreadsQuery } from "@/domains/agents";
import { useSidebar } from "./sidebar-context";
import { workspaceModeHref } from "@/domains/dashboard/store/dashboard.store";
import { useRouter } from "@/i18n/routing";
import { agentThreadUrl } from "@/domains/agents/conversation-runtime";

type BetterAuthOrganization = {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
};

type AgentThread = {
  id: string;
  title: string;
  lastMessageAt: number;
};

type SidebarAuthClient = typeof authClient & {
  organization: {
    setActive: (input: { organizationId: string }) => Promise<AuthResult<BetterAuthOrganization | null>>;
  };
};

const organizationApi = authClient as SidebarAuthClient;

// Primary nav items
const primaryNav = [
  { name: "dashboard", href: "/dashboard", icon: Bot, label: "AI Assistant" },
  { name: "clients", href: "/clients", icon: UserRound, label: "Clients" },
  { name: "opportunities", href: "/opportunities", icon: KanbanSquare, label: "Opportunities" },

  { name: "tasks", href: "/tasks", icon: ListTodo, label: "Tasks" },
  { name: "calendar", href: "/calendar", icon: CalendarDays, label: "Calendar" },
];

// Secondary/bottom nav
const secondaryNav = [
  { name: "automations", href: "/automations", icon: Workflow, label: "Automations" },
  { name: "integrations", href: "/web-apps", icon: Plug, label: "Integrations" },
  { name: "organization", href: "/settings/organization", icon: Settings, label: "Settings" },
];

function getInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AN"
  );
}

function isGeneratedOrganizationName(value: string) {
  const normalized = value.trim();
  return normalized.length > 18 && /^[a-z0-9_-]+$/i.test(normalized) && /[0-9]/.test(normalized);
}

function NavTooltip({ label, disabled, children }: { label: string; disabled?: boolean; children: React.ReactNode }) {
  if (disabled || !label) return <>{children}</>;
  return (
    <div className="group/tip relative flex items-center">
      {children}
      <div className="pointer-events-none absolute start-full ms-3 z-50 hidden min-w-max rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-bold shadow-lg group-hover/tip:flex">
        {label}
      </div>
    </div>
  );
}

export function Sidebar() {
  const t = useTranslations("Sidebar");
  const tWorkspace = useTranslations("Workspace");
  const { toast } = useToast();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen } = useSidebar();
  const activeThreadId = searchParams.get("threadId")?.trim();
  const { isDark: isDarkMode } = useTheme();
  const account = useAccountContext();
  const workspaceOrganizationId =
    account.workspace.status === "ready" ? account.workspace.organizationId : null;
  const queriedAgentThreads = useAgentThreadsQuery(workspaceOrganizationId, {
    enabled: Boolean(workspaceOrganizationId),
    limit: 50,
  });
  const agentThreads = useMemo(() => queriedAgentThreads ?? [], [queriedAgentThreads]);
  const visibleAgentThreads = agentThreads.slice(0, 5);
  const hasMoreAgentThreads = agentThreads.length > visibleAgentThreads.length;
  const organizationsQuery = authClient.useListOrganizations();
  const organizations = useMemo(
    () =>
      ((organizationsQuery.data ?? []) as BetterAuthOrganization[])
        .filter((o) => o.id)
        .slice(0, 4),
    [organizationsQuery.data],
  );
  
  const [threadHistoryOpen, setThreadHistoryOpen] = useState(false);
  const [threadSearch, setThreadSearch] = useState("");
  const [threadPendingDelete, setThreadPendingDelete] = useState<AgentThread | null>(null);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null);
  const organizationDisplayName =
    account.organization.legalName?.trim() ||
    (!isGeneratedOrganizationName(account.organization.name)
      ? account.organization.name
      : locale === "ar"
        ? "المؤسسة"
        : "Organization");

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

  async function deleteSelectedThread() {
    if (!workspaceOrganizationId || !threadPendingDelete || deletingThreadId) return;
    const thread = threadPendingDelete;
    setDeletingThreadId(thread.id);
    try {
      await deleteAgentThreadRequest(workspaceOrganizationId, thread.id);
      setThreadPendingDelete(null);
      setThreadHistoryOpen(false);
      toast({
        title: locale === "ar" ? "تم حذف المحادثة" : "Conversation deleted",
        type: "success",
      });
      if (activeThreadId === thread.id) {
        window.history.replaceState(
          null,
          "",
          agentThreadUrl(window.location.pathname, window.location.search),
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      toast({
        title: locale === "ar" ? "تعذر حذف المحادثة" : "Delete failed",
        description: message,
        type: "error",
      });
    } finally {
      setDeletingThreadId(null);
    }
  }

  return (
    <>
      <aside
        className={cn(
          "relative flex h-screen shrink-0 flex-col overflow-hidden bg-background transition-all duration-300 ease-in-out border-e",
          isOpen ? "w-64" : "w-14",
          isDarkMode ? "border-white/[0.06]" : "border-black/[0.07]",
          isRtl && "font-cairo",
        )}
      >
        {/* Logo / Org Avatar */}
        <div className={cn("flex h-14 shrink-0 items-center border-b border-inherit", isOpen ? "px-4" : "justify-center")}>
          <NavTooltip label={organizationDisplayName} disabled={isOpen}>
            <Link
              href={workspaceModeHref("ws")}
              className={cn(
                "flex items-center rounded-xl transition-opacity hover:opacity-80 min-w-0",
                isOpen ? "gap-2.5 w-full" : "justify-center",
                isDarkMode ? "text-white" : "text-zinc-950",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[10px] font-black uppercase",
                  isDarkMode ? "bg-white text-zinc-950" : "bg-zinc-950 text-white",
                )}
              >
                {account.organization.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.organization.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  account.organization.initials || getInitials(organizationDisplayName)
                )}
              </div>
              {isOpen && (
                <span className="truncate text-sm font-black leading-tight flex-1 text-start">
                  {organizationDisplayName}
                </span>
              )}
            </Link>
          </NavTooltip>
        </div>

        <nav className={cn("flex flex-1 flex-col overflow-y-auto py-3 scrollbar-none", isOpen ? "px-3 gap-1" : "items-center gap-1")}>

          {primaryNav.map((item) => {

            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/dashboard")
                : pathname.startsWith(item.href);
            const label = item.name === "dashboard" ? "AI Assistant" : t(item.name);
            const itemHref = item.href === "/dashboard" ? workspaceModeHref("ws") : item.href;

            return (
              <NavTooltip key={item.name} label={label} disabled={isOpen}>
                <Link
                  href={itemHref}
                  aria-label={label}
                  className={cn(
                    "flex items-center rounded-xl transition-all",
                    isOpen ? "h-9 w-full px-3 gap-3" : "h-9 w-9 justify-center",
                    isActive
                      ? isDarkMode
                        ? "bg-white/10 text-white"
                        : "bg-zinc-100 text-zinc-950"
                      : isDarkMode
                        ? "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                  {isOpen && <span className="truncate text-sm font-semibold">{label}</span>}
                </Link>
              </NavTooltip>
            );
          })}

          {/* Divider */}
          <div className={cn("my-2 h-px shrink-0", isOpen ? "w-full" : "w-6 self-center", isDarkMode ? "bg-white/[0.08]" : "bg-black/[0.08]")} />

          {/* AI Threads */}
          {workspaceOrganizationId && (
            <>
              {isOpen && (
                <div className="px-3 pb-1 pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                    {locale === "ar" ? "المحادثات" : "Threads"}
                  </span>
                  <Link
                    href={workspaceModeHref("ai")}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </Link>
                </div>
              )}
              
              {!isOpen && (
                <NavTooltip label={locale === "ar" ? "محادثة جديدة" : "New thread"}>
                  <Link
                    href={workspaceModeHref("ai")}
                    aria-label={locale === "ar" ? "محادثة جديدة" : "New thread"}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                      isDarkMode
                        ? "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900",
                    )}
                  >
                    <Plus className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </Link>
                </NavTooltip>
              )}

              {visibleAgentThreads.map((thread) => {
                const isActive = activeThreadId === thread.id;
                const isDeleting = deletingThreadId === thread.id;

                return (
                  <NavTooltip key={thread.id} label={thread.title} disabled={isOpen}>
                    <div className={cn("group/thread relative flex items-center min-w-0", isOpen && "w-full")}>
                      <Link
                        href={workspaceModeHref("ai", thread.id)}
                        aria-label={thread.title}
                        className={cn(
                          "flex items-center rounded-xl transition-all min-w-0",
                          isOpen ? "h-9 w-full px-3 gap-3" : "h-9 w-9 justify-center",
                          isActive
                            ? isDarkMode
                              ? "bg-white/10 text-white"
                              : "bg-zinc-100 text-zinc-950"
                            : isDarkMode
                              ? "text-zinc-600 hover:bg-white/[0.06] hover:text-white"
                              : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900",
                        )}
                      >
                        {isDeleting && !isOpen ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <MessageSquareText className="h-[16px] w-[16px] shrink-0" strokeWidth={1.8} />
                        )}
                        {isOpen && <span className="truncate text-[13px] font-semibold">{thread.title}</span>}
                      </Link>
                      
                      {/* delete on hover */}
                      <button
                        type="button"
                        onClick={() => setThreadPendingDelete(thread)}
                        aria-label={`Delete: ${thread.title}`}
                        className={cn(
                          "items-center justify-center transition-all",
                          isOpen
                            ? "absolute end-2 hidden h-6 w-6 rounded-md group-hover/thread:flex text-text-muted hover:bg-red-500/10 hover:text-red-500"
                            : "absolute -end-1 -top-1 hidden h-4 w-4 rounded-full text-[8px] group-hover/thread:flex " + (isDarkMode ? "bg-zinc-800 text-zinc-400 hover:bg-red-900 hover:text-red-300" : "bg-zinc-200 text-zinc-500 hover:bg-red-100 hover:text-red-600")
                        )}
                      >
                        {isDeleting && isOpen ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isOpen ? <Trash2 className="h-3.5 w-3.5" /> : "×"}
                      </button>
                    </div>
                  </NavTooltip>
                );
              })}

              <div className="mt-2" />
              {hasMoreAgentThreads && (
                <NavTooltip label={locale === "ar" ? "السجل" : "History"} disabled={isOpen}>
                  <button
                    type="button"
                    onClick={() => setThreadHistoryOpen(true)}
                    className={cn(
                      "flex items-center rounded-xl transition-all",
                      isOpen ? "h-9 w-full px-3 gap-3" : "h-9 w-9 justify-center",
                      isDarkMode
                        ? "text-zinc-600 hover:bg-white/[0.06] hover:text-white"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900",
                    )}
                  >
                    <HistoryIcon className="h-[16px] w-[16px] shrink-0" strokeWidth={1.8} />
                    {isOpen && <span className="text-[13px] font-semibold">{locale === "ar" ? "السجل" : "History"}</span>}
                  </button>
                </NavTooltip>
              )}
            </>
          )}
        </nav>

        {/* Bottom: secondary nav + user avatar */}
        <div className={cn("flex flex-col border-t border-inherit py-3", isOpen ? "px-3 gap-1" : "items-center gap-1")}>
          {secondaryNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const label = item.name === "organization" ? (locale === "ar" ? "الإعدادات" : "Settings") : t(item.name);

            return (
              <NavTooltip key={item.name} label={label} disabled={isOpen}>
                <Link
                  href={item.href}
                  aria-label={label}
                  className={cn(
                    "flex items-center rounded-xl transition-all",
                    isOpen ? "h-9 w-full px-3 gap-3" : "h-9 w-9 justify-center",
                    isActive
                      ? isDarkMode
                        ? "bg-white/10 text-white"
                        : "bg-zinc-100 text-zinc-950"
                      : isDarkMode
                        ? "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                  {isOpen && <span className="truncate text-sm font-semibold">{label}</span>}
                </Link>
              </NavTooltip>
            );
          })}

          {/* Multi-org switcher */}
          {organizations.length > 1 && (
            <div className={cn("mt-4 flex", isOpen ? "flex-col gap-1 px-3" : "flex-col items-center gap-2")}>
              {isOpen && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">{locale === "ar" ? "مساحات العمل" : "Workspaces"}</span>}
              {organizations.map((org) => {
                const isActive = org.id === account.organization.id;
                const isSwitching = switchingOrganizationId === org.id;
                return (
                  <NavTooltip key={org.id} label={org.name} disabled={isOpen}>
                    <button
                      type="button"
                      onClick={() => switchOrganization(org.id)}
                      disabled={isActive || Boolean(switchingOrganizationId)}
                      className={cn(
                        "flex items-center transition-all disabled:cursor-default",
                        isOpen ? "w-full gap-2 rounded-xl py-1.5 px-2 text-start" : "h-6 w-6 justify-center overflow-hidden rounded-lg",
                        isActive
                          ? isDarkMode
                            ? isOpen ? "bg-white/10 text-white" : "border border-white text-white"
                            : isOpen ? "bg-zinc-100 text-zinc-900" : "border border-zinc-900 text-zinc-900"
                          : isDarkMode
                            ? isOpen ? "text-zinc-500 hover:bg-white/[0.06] hover:text-white" : "border border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-white"
                            : isOpen ? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" : "border border-black/[0.08] text-zinc-400 hover:border-black/20 hover:text-black",
                      )}
                    >
                      <span className={cn("flex shrink-0 items-center justify-center overflow-hidden font-black uppercase", isOpen ? "h-6 w-6 rounded-lg text-[9px] border border-inherit" : "h-full w-full text-[8px]")}>
                        {isSwitching && !isOpen ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : org.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={org.logo} alt="" className="h-full w-full object-cover" />
                        ) : (
                          getInitials(org.name)
                        )}
                      </span>
                      {isOpen && (
                        <span className="min-w-0 flex-1 flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-bold">{org.name}</span>
                          {isSwitching && <Loader2 className="h-3 w-3 animate-spin text-text-muted" />}
                        </span>
                      )}
                    </button>
                  </NavTooltip>
                );
              })}
            </div>
          )}

          {/* User Avatar */}
          <NavTooltip label={account.user.name} disabled={isOpen}>
            <Link
              href="/profile/settings"
              aria-label={account.user.name}
              className={cn("mt-2 flex items-center transition-all hover:opacity-80", isOpen ? "gap-3 px-3 py-2 rounded-xl" : "")}
            >
              <IdentityAvatar
                image={account.user.image}
                initials={account.user.initials}
                name={account.user.name}
                isDarkMode={isDarkMode}
                size={isOpen ? "md" : "sm"}
              />
              {isOpen && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black leading-tight text-text-primary">{account.user.name}</p>
                  <p className="truncate text-[11px] font-semibold text-text-muted">{account.user.email}</p>
                </div>
              )}
            </Link>
          </NavTooltip>
        </div>
      </aside>

      {/* Thread History Dialog */}
      <Dialog open={threadHistoryOpen} onOpenChange={setThreadHistoryOpen}>
        <DialogContent className="max-w-lg gap-4 rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle>{locale === "ar" ? "سجل المحادثات" : "Thread history"}</DialogTitle>
            <DialogDescription>
              {locale === "ar"
                ? "ابحث في محادثات الذكاء لهذه المساحة."
                : "Search AI threads for this workspace."}
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              placeholder={locale === "ar" ? "ابحث في المحادثات..." : "Search threads..."}
              className="rounded-xl ps-9"
            />
          </div>
          <div className="max-h-[420px] space-y-1 overflow-y-auto pe-1">
            {filteredAgentThreads.length > 0 ? (
              filteredAgentThreads.map((thread) => {
                const isActive = activeThreadId === thread.id;
                const isDeleting = deletingThreadId === thread.id;
                return (
                  <div
                    key={thread.id}
                    className={cn(
                      "group/thread flex min-h-11 items-center gap-1 rounded-xl transition-all",
                      isActive
                        ? "bg-primary/10 text-zinc-950 dark:bg-primary/20 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white",
                    )}
                  >
                    <Link
                      href={workspaceModeHref("ai", thread.id)}
                      onClick={() => setThreadHistoryOpen(false)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-start"
                      title={thread.title}
                    >
                      <MessageSquareText
                        className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-zinc-400")}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black leading-tight">{thread.title}</span>
                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {new Date(thread.lastMessageAt).toLocaleDateString(locale, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Delete: ${thread.title}`}
                      disabled={isDeleting}
                      onClick={() => setThreadPendingDelete(thread)}
                      className="me-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 disabled:opacity-60 group-hover/thread:opacity-100 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl bg-zinc-50 px-3 py-6 text-center text-sm font-semibold text-zinc-400 dark:bg-white/5">
                {locale === "ar" ? "لا توجد محادثات بعد" : "No threads yet"}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Thread Alert */}
      <AlertDialog
        open={Boolean(threadPendingDelete)}
        onOpenChange={(open) => {
          if (!open && !deletingThreadId) setThreadPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === "ar" ? "حذف المحادثة؟" : "Delete this conversation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === "ar"
                ? "سيتم حذف هذه المحادثة ورسائلها وسجل تشغيل الذكاء نهائيا."
                : "This permanently deletes the conversation, messages, and agent run history."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingThreadId)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(deletingThreadId)}
              onClick={(e) => {
                e.preventDefault();
                void deleteSelectedThread();
              }}
              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/20 dark:bg-red-500 dark:text-white dark:hover:bg-red-400"
            >
              {deletingThreadId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {locale === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function IdentityAvatar({
  image,
  initials,
  name,
  isDarkMode,
  size = "sm",
}: {
  image: string | null;
  initials: string;
  name: string;
  isDarkMode: boolean;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border font-black uppercase transition-opacity",
        isDarkMode
          ? "border-white/10 bg-white/10 text-white"
          : "border-zinc-200 bg-zinc-100 text-zinc-700",
        size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"
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

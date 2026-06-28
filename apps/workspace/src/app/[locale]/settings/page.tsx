"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ChevronDown, Settings2, UserRound, Bell, Code2, Shield, Plug, Bot, FileText, FolderGit2, Tags, Zap, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const personalNav = [
  { name: "profile", label: "Profile", href: "/profile/settings" },
  { name: "preferences", label: "Preferences", href: "/settings" },
  { name: "notifications", label: "Notifications", href: "/settings/notifications" },
  { name: "codeReviews", label: "Code & reviews", href: "/settings/code-reviews" },
  { name: "security", label: "Security & access", href: "/settings/security" },
  { name: "accounts", label: "Connected accounts", href: "/settings/accounts" },
  { name: "agent", label: "Agent personalization", href: "/settings/agent" },
];

const issuesNav = [
  { name: "labels", label: "Labels", href: "/settings/labels" },
  { name: "templates", label: "Templates", href: "/settings/templates" },
  { name: "slas", label: "SLAs", href: "/settings/slas" },
];

const projectsNav = [
  { name: "labels", label: "Labels", href: "/settings/project-labels" },
  { name: "templates", label: "Templates", href: "/settings/project-templates" },
  { name: "statuses", label: "Statuses", href: "/settings/statuses" },
  { name: "updates", label: "Updates", href: "/settings/updates" },
];

const featuresNav = [
  { name: "aiAgents", label: "AI & Agents", href: "/settings/ai-agents" },
  { name: "initiatives", label: "Initiatives", href: "/settings/initiatives" },
  { name: "documents", label: "Documents", href: "/settings/documents" },
  { name: "customerRequests", label: "Customer requests", href: "/settings/customer-requests" },
  { name: "releases", label: "Releases", href: "/settings/releases" },
];

function getIconForNav(name: string) {
  const icons: Record<string, typeof UserRound> = {
    profile: UserRound,
    preferences: Settings2,
    notifications: Bell,
    codeReviews: Code2,
    security: Shield,
    accounts: Plug,
    agent: Bot,
    labels: Tags,
    templates: FileText,
    slas: Zap,
    statuses: FolderGit2,
    updates: FolderGit2,
    aiAgents: Bot,
    initiatives: FileText,
    documents: FileText,
    customerRequests: UserRound,
    releases: Zap,
  };
  return icons[name] || Settings2;
}

function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex-1 space-y-0.5 min-w-0">
        <div className="text-[13px] font-semibold text-foreground">{title}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col overflow-hidden border-e border-border bg-secondary">
        {/* Back link */}
        <div className="shrink-0 border-b border-border px-3 py-2.5">
          <Link
            href="/ws"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
            {t("backToApp", { defaultValue: "Back to app" })}
          </Link>
        </div>

        {/* Search */}
        <div className="shrink-0 px-3 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("search", { defaultValue: "Search..." })}
              className="w-full rounded-lg border border-border bg-muted px-9 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 scrollbar-none">
          <div className="space-y-5">
            {/* Personal */}
            <div>
              <h3 className="mb-2 px-2 text-[10px] font-black uppercase text-text-muted">
                {t("personal", { defaultValue: "Personal" })}
              </h3>
              <nav className="space-y-0.5">
                {personalNav.map((item) => {
                  const Icon = getIconForNav(item.name);
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Issues */}
            <div>
              <h3 className="mb-2 px-2 text-[10px] font-black uppercase text-text-muted">
                {t("issues", { defaultValue: "Issues" })}
              </h3>
              <nav className="space-y-0.5">
                {issuesNav.map((item) => {
                  const Icon = getIconForNav(item.name);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Projects */}
            <div>
              <h3 className="mb-2 px-2 text-[10px] font-black uppercase text-text-muted">
                {t("projects", { defaultValue: "Projects" })}
              </h3>
              <nav className="space-y-0.5">
                {projectsNav.map((item) => {
                  const Icon = getIconForNav(item.name);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Features */}
            <div>
              <h3 className="mb-2 px-2 text-[10px] font-black uppercase text-text-muted">
                {t("features", { defaultValue: "Features" })}
              </h3>
              <nav className="space-y-0.5">
                {featuresNav.map((item) => {
                  const Icon = getIconForNav(item.name);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-8 py-10">
          <h1 className="text-2xl font-bold text-foreground">{t("preferences", { defaultValue: "Preferences" })}</h1>

          <div className="mt-8 space-y-8">
            {/* General Section */}
              <h2 className="mb-2 text-base font-semibold text-foreground">{t("general", { defaultValue: "General" })}</h2>
            <section className="rounded-xl border border-border bg-card">
              <div className="mt-2">
                <SettingsRow
                  title={t("defaultHomeView", { defaultValue: "Default home view" })}
                  description={t("defaultHomeViewDesc", { defaultValue: "Select which view to display when launching Linear" })}
                >
                  <Select defaultValue="active">
                    <SelectTrigger className="h-9 w-36 whitespace-nowrap rounded-lg bg-secondary border-border text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active issues</SelectItem>
                      <SelectItem value="inbox">Inbox</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>

                <SettingsRow
                  title={t("displayNames", { defaultValue: "Display names" })}
                  description={t("displayNamesDesc", { defaultValue: "Select how names are displayed in the Linear interface" })}
                >
                  <Select defaultValue="full">
                    <SelectTrigger className="h-9 w-36 whitespace-nowrap rounded-lg bg-secondary border-border text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full name</SelectItem>
                      <SelectItem value="first">First name</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>

                <SettingsRow
                  title={t("firstDayOfWeek", { defaultValue: "First day of the week" })}
                  description={t("firstDayOfWeekDesc", { defaultValue: "Used for date pickers" })}
                >
                  <Select defaultValue="sunday">
                    <SelectTrigger className="h-9 w-36 whitespace-nowrap rounded-lg bg-secondary border-border text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>

                <SettingsRow
                  title={t("convertEmoticons", { defaultValue: "Convert text emoticons into emojis" })}
                  description={t("convertEmoticonsDesc", { defaultValue: "Strings like :) will be converted to 🙂" })}
                >
                  <Switch defaultChecked />
                </SettingsRow>

                <SettingsRow
                  title={t("sendCommentOn", { defaultValue: "Send comment on..." })}
                  description={t("sendCommentOnDesc", { defaultValue: "Choose which key press is used to submit a comment" })}
                >
                  <Select defaultValue="enter">
                    <SelectTrigger className="h-9 w-36 whitespace-nowrap rounded-lg bg-secondary border-border text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enter">Enter</SelectItem>
                      <SelectItem value="cmdEnter">Cmd + Enter</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>
              </div>
            </section>

            {/* Interface and theme Section */}
              <h2 className="mb-2 text-base font-semibold text-foreground">
                {t("interfaceAndTheme", { defaultValue: "Interface and theme" })}
              </h2>
            <section className="rounded-xl border border-border bg-card">
              <div className="mt-2">
                <SettingsRow
                  title={t("appSidebar", { defaultValue: "App sidebar" })}
                  description={t("appSidebarDesc", { defaultValue: "Customize sidebar item visibility, ordering, and badge style" })}
                >
                  <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent">
                    {t("customize", { defaultValue: "Customize" })}
                  </button>
                </SettingsRow>

                <SettingsRow
                  title={t("fontSize", { defaultValue: "Font size" })}
                  description={t("fontSizeDesc", { defaultValue: "Adjust the size of text across the app" })}
                >
                  <Select defaultValue="default">
                    <SelectTrigger className="h-9 w-36 whitespace-nowrap rounded-lg bg-secondary border-border text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsRow>

                <SettingsRow
                  title={t("usePointerCursors", { defaultValue: "Use pointer cursors" })}
                  description={t("usePointerCursorsDesc", { defaultValue: "Show hand cursor on clickable elements" })}
                >
                  <Switch defaultChecked />
                </SettingsRow>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}


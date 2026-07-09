"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  Laptop,
  Loader2,
  Mail,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
  Zap,
} from "lucide-react";
import { useLocale } from "next-intl";
import { StatusPill } from "@/components/shared/crud-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useBillingOverview, useBillingUsage } from "@/domains/billing/api/billing";
import { billingDateLabel, billingPricePerSeatLabel, seatTotalLabel, subscriptionTone, type BillingLocale } from "@/domains/billing/billing-view-model";
import { useBillingCheckout } from "@/domains/billing/hooks/use-billing-checkout";
import { listOrganizationMembers } from "@/domains/organization/api";
import { organizationSettingsKeys } from "@/domains/organization/settings-cache";
import { CreditProgress } from "@/domains/usage/components/credit-progress";
import { PaymentsLedger } from "@/domains/usage/components/payments-ledger";
import type { UsageLocale } from "@/domains/usage/lib/usage-formatters";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { settingsSectionTitle, type SettingsSectionId } from "../config/settings-navigation";
import { InfoCard, SettingsRow, SettingsSection } from "./settings-primitives";
import { WorkspaceSettingsShell } from "./workspace-settings-shell";

const colorOptions = [
  "bg-slate-500",
  "bg-violet-500",
  "bg-blue-500",
  "bg-sky-500",
  "bg-pink-500",
  "bg-fuchsia-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-stone-400",
  "bg-emerald-500",
];

const linearButtonClass =
  "dark:border-[#222326] dark:bg-[#222326] dark:text-[#F4F5F8] dark:hover:bg-[#2b2b30]";
const linearInputClass =
  "dark:border-[#222326] dark:bg-[#121214] dark:text-[#F4F5F8] dark:placeholder:text-[#6f6f76]";

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "W";
}

function copyValue(value: string) {
  void navigator.clipboard?.writeText(value);
}

export function WorkspaceSettingsScreen({ section }: { section: SettingsSectionId }) {
  const { data: session } = authClient.useSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();
  const fallbackOrganization = organizations?.[0] ?? null;
  const organization =
    activeOrganization ??
    organizations?.find((item) => item.id === session?.session?.activeOrganizationId) ??
    fallbackOrganization;
  const workspaceName = organization?.name?.trim() || "Workspace";
  const title = section === "general" ? "Workspace Settings" : settingsSectionTitle(section);

  return (
    <WorkspaceSettingsShell
      activeSection={section}
      title={title}
      description={section === "general" ? "Manage the workspace identity, local app behavior, and personal layout preferences." : undefined}
    >
      <SettingsSectionContent section={section} organizationId={organization?.id} workspaceName={workspaceName} workspaceLogo={organization?.logo ?? null} />
    </WorkspaceSettingsShell>
  );
}

function SettingsSectionContent({
  section,
  organizationId,
  workspaceName,
  workspaceLogo,
}: {
  section: SettingsSectionId;
  organizationId?: string | null;
  workspaceName: string;
  workspaceLogo: string | null;
}) {
  switch (section) {
    case "general":
      return <GeneralSettingsSection workspaceName={workspaceName} workspaceLogo={workspaceLogo} />;
    case "people":
      return <PeopleSettingsSection organizationId={organizationId} />;
    case "teams":
      return <TeamsSettingsSection />;
    case "billing":
      return <BillingSettingsSection organizationId={organizationId} workspaceName={workspaceName} />;
    case "ai-usage":
      return <AiUsageSettingsSection organizationId={organizationId} />;
    case "security":
      return <SecuritySettingsSection />;
    case "audit":
      return <AuditSettingsSection />;
    case "trash":
      return <TrashSettingsSection />;
    case "api":
      return <ApiSettingsSection />;
    case "custom-fields":
      return <SimpleRowsSection title="Custom Field Manager" rows={[["Workspace custom fields", "Create reusable fields for projects, tasks, clients, and deals.", "Configure"], ["Field visibility", "Choose where each field is visible across workspace surfaces.", "Coming soon"]]} />;
    case "tag-manager":
      return <SimpleRowsSection title="Tag Manager" rows={[["Workspace tags", "Standardize labels across tasks, projects, docs, and inbox channels.", "Manage tags"]]} />;
    case "templates":
      return <SimpleRowsSection title="Template Center" rows={[["Workspace templates", "Reusable project, task, document, and onboarding templates.", "Coming soon"]]} />;
    case "automations":
      return <SimpleRowsSection title="Automations Manager" rows={[["Workspace automations", "Run rules across spaces and projects when this module is enabled.", "Coming soon"]]} />;
    case "ai-notetaker":
      return <SimpleRowsSection title="AI Notetaker" rows={[["Meeting notes", "Capture summaries, decisions, and tasks from connected meeting sources.", "Coming soon"]]} />;
    case "spaces":
      return <SettingsSection title="Spaces"><SettingsRow title="Workspace spaces" description="Spaces group projects, permissions, and teams into focused operating areas." action={<Link href="/spaces" className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted">Open spaces</Link>} /></SettingsSection>;
    case "task-types":
      return <SimpleRowsSection title="Task Types" rows={[["Default task types", "Bug, task, milestone, and custom work types for your workspace.", "Manage"]]} />;
    case "work-schedule":
      return <SimpleRowsSection title="Work Schedule" rows={[["Working week", "Set working days, time zone, holidays, and capacity defaults.", "Edit schedule"]]} />;
    case "app-center":
      return <SettingsSection title="App Center"><SettingsRow title="Connected apps" description="Manage marketplace connections and OAuth integrations." action={<Link href="/web-apps" className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted">Open apps</Link>} /></SettingsSection>;
    case "imports":
      return <SimpleRowsSection title="Imports / Exports" rows={[["Import workspace data", "Bring projects, clients, tasks, or docs into Qentrah.", "Import"], ["Export workspace data", "Download a workspace archive for compliance or migration.", "Export"]]} />;
    case "email":
      return <SimpleRowsSection title="Email Integration" rows={[["Workspace email", "Connect shared inboxes and route messages into channels.", "Coming soon"]]} />;
    case "preferences":
      return <PreferencesSettingsSection />;
    case "profile":
      return <ProfileSettingsSection workspaceName={workspaceName} />;
    case "notifications":
      return <NotificationsSettingsSection />;
    case "workspaces":
      return <SettingsSection title="Workspaces"><SettingsRow title="Workspace switcher" description="Manage the workspaces available in your account." action={<Link href="/choose-org" className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted">Manage</Link>} /></SettingsSection>;
  }
}

function GeneralSettingsSection({ workspaceName, workspaceLogo }: { workspaceName: string; workspaceLogo: string | null }) {
  const initials = initialsFor(workspaceName);

  return (
    <div className="space-y-8">
      <SettingsSection title="General">
        <SettingsRow
          title="Avatar"
          action={
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-primary text-xs font-black uppercase text-primary-foreground dark:bg-[#F4F5F8] dark:text-[#222326]">
              {workspaceLogo ? <img src={workspaceLogo} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
          }
        />
        <SettingsRow title="Name" action={<Input value={workspaceName} readOnly className={cn("h-8 w-56 bg-background text-xs", linearInputClass)} />} />
      </SettingsSection>

      <SettingsSection title="Custom branding">
        <SettingsRow title="Enable custom branding" action={<Switch size="sm" />} />
        <SettingsRow title="Round logo" description="Recommended 72 x 72 PNG. Used in-app as your workspace avatar." action={<Button variant="secondary" size="xs" className={linearButtonClass}>Add</Button>} />
        <SettingsRow title="Rectangle logo" description="Recommended 232 x 48 PNG. Used in emails, login screens, and public links." action={<Button variant="secondary" size="xs" className={linearButtonClass}>Add</Button>} />
        <SettingsRow title="Social media graphic" description="Recommended 500 x 260 PNG. Used when workspace links are shared." action={<Button variant="secondary" size="xs" className={linearButtonClass}>Add</Button>} />
        <SettingsRow
          title="Color scheme"
          action={
            <div className="flex items-center gap-2">
              {colorOptions.map((color) => (
                <button key={color} type="button" className={cn("h-4 w-4 rounded-full", color)} aria-label="Select color" />
              ))}
            </div>
          }
        />
        <SettingsRow title="Custom URL" action={<div className="flex items-center gap-1 text-xs text-muted-foreground"><Input placeholder="app" className={cn("h-8 w-36 bg-background text-xs", linearInputClass)} /><span>.qentrah.com</span></div>} />
      </SettingsSection>

      <SettingsSection title="Local Data">
        <SettingsRow title="Storage usage" description="Local drafts, cached preferences, and IndexedDB workspace data." action={<span className="text-xs font-semibold text-foreground">49%</span>} />
        <SettingsRow title="Sync workspace cache" description="Refresh local workspace data from the server." action={<Button variant="outline" size="xs" className={cn("gap-1.5", linearButtonClass)}><RefreshCw className="h-3 w-3" />Sync</Button>} />
        <SettingsRow title="Clear local storage" description="Remove preferences and cached client-side settings on this device." action={<Button variant="outline" size="xs" className={cn("gap-1.5", linearButtonClass)}><Trash2 className="h-3 w-3" />Clear</Button>} />
      </SettingsSection>

      <SettingsSection title="Danger zone">
        <SettingsRow title="Delete this Workspace forever" action={<Button variant="destructive" size="xs">Delete Workspace</Button>} />
      </SettingsSection>
    </div>
  );
}

function PreferencesSettingsSection() {
  return (
    <div className="space-y-8">
      <SettingsSection title="General">
        <SettingsRow title="Default home view" description="Select which view to display when launching Qentrah." action={<Button variant="outline" size="xs" className={linearButtonClass}>Current cycle</Button>} />
        <SettingsRow title="Display names" description="Select how names are displayed in the interface." action={<Button variant="outline" size="xs" className={linearButtonClass}>Full name</Button>} />
        <SettingsRow title="First day of the week" description="Used for date pickers." action={<Button variant="outline" size="xs" className={linearButtonClass}>Sunday</Button>} />
        <SettingsRow title="Convert text emoticons into emojis" description="Strings like :) will be converted to smiling faces." action={<Switch size="sm" defaultChecked />} />
        <SettingsRow title="Send messages on..." description="Choose which key press submits comments and AI messages." action={<Button variant="outline" size="xs" className={linearButtonClass}>Enter</Button>} />
      </SettingsSection>

      <SettingsSection title="Interface and theme">
        <SettingsRow title="App sidebar" description="Customize sidebar item visibility, ordering, and badge style." action={<Button variant="outline" size="xs" className={linearButtonClass}>Customize</Button>} />
        <SettingsRow title="Font size" description="Adjust text size across the app." action={<Button variant="outline" size="xs" className={linearButtonClass}>Default</Button>} />
        <SettingsRow title="Use pointer cursors" description="Change the cursor over interactive elements." action={<Switch size="sm" />} />
      </SettingsSection>
    </div>
  );
}

function ProfileSettingsSection({ workspaceName }: { workspaceName: string }) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const displayName = user?.name || workspaceName;
  const email = user?.email || "No email";

  return (
    <div className="space-y-8">
      <SettingsSection title="Profile">
        <SettingsRow
          title="Profile picture"
          action={
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5e6ad2] text-xs font-semibold text-white">
              {initialsFor(displayName)}
            </div>
          }
        />
        <SettingsRow title="Email" action={<span className="text-sm font-medium text-foreground dark:text-[#F4F5F8]">{email}</span>} />
        <SettingsRow title="Full name" action={<Input value={displayName} readOnly className={cn("h-8 w-44 bg-background text-xs", linearInputClass)} />} />
        <SettingsRow title="Title" description="Your job title or role" action={<Input placeholder="Software engineer" className={cn("h-8 w-44 bg-background text-xs", linearInputClass)} />} />
        <SettingsRow title="Username" description="One word, like a nickname or first name" action={<Input value={email.split("@")[0] ?? ""} readOnly className={cn("h-8 w-44 bg-background text-xs", linearInputClass)} />} />
      </SettingsSection>

      <SettingsSection title="Workspace access">
        <SettingsRow title="Remove yourself from workspace" action={<Button variant="ghost" size="xs" className="dark:text-[#9b9ba1] dark:hover:bg-[#222326] dark:hover:text-[#F4F5F8]">Leave workspace</Button>} />
      </SettingsSection>
    </div>
  );
}

function NotificationsSettingsSection() {
  const channels = [
    { label: "Desktop", detail: "Disabled", enabled: false, icon: Laptop },
    { label: "Mobile", detail: "Enabled for all notifications", enabled: true, icon: Smartphone },
    { label: "Email", detail: "Enabled for all notifications", enabled: true, icon: Mail },
    { label: "Qentrah AI", detail: "Agent and workflow notifications", enabled: true, icon: Bell },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground dark:text-[#F4F5F8]">Notification channels</h2>
          <p className="mt-1 text-xs text-muted-foreground dark:text-[#9b9ba1]">
            Choose how to be notified for workspace activity. Notifications always appear in your Qentrah inbox.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card dark:border-[#222326] dark:bg-[#18181a]">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div key={channel.label} className="flex min-h-14 items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 dark:border-[#222326]">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted dark:bg-[#222326]">
                  <Icon className="h-4 w-4 text-muted-foreground dark:text-[#a1a1a8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground dark:text-[#F4F5F8]">{channel.label}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground dark:text-[#94949b]">
                    <span className={cn("h-1.5 w-1.5 rounded-full", channel.enabled ? "bg-emerald-500" : "bg-[#66666d]")} />
                    {channel.detail}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground dark:text-[#8b8b92]" />
              </div>
            );
          })}
        </div>
      </section>

      <SettingsSection title="Updates from Qentrah" eyebrow="Subscribe to product announcements and important changes from the Qentrah team.">
        <SettingsRow title="Show updates in sidebar" description="Highlight new features and improvements in the app sidebar." action={<Switch size="sm" defaultChecked />} />
        <SettingsRow title="Changelog newsletter" description="Receive an email twice a month highlighting new features and improvements." action={<Switch size="sm" />} />
      </SettingsSection>

      <SettingsSection title="Marketing">
        <SettingsRow title="Marketing and onboarding" description="Occasional updates to help you get the most out of Qentrah." action={<Switch size="sm" defaultChecked />} />
      </SettingsSection>
    </div>
  );
}

function PeopleSettingsSection({ organizationId }: { organizationId?: string | null }) {
  const membersQuery = useQuery({
    queryKey: organizationId ? organizationSettingsKeys.members(organizationId) : ["organization-members", "missing"],
    queryFn: () => listOrganizationMembers(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });
  const members = membersQuery.data ?? [];

  return (
    <SettingsSection title="People">
      <div className="grid gap-3 border-b border-border p-3 dark:border-[#222326] sm:grid-cols-3">
        <InfoCard title="Members" value={String(members.length)} description="Active workspace members" />
        <InfoCard title="Invites" value="0" description="Pending invitations" />
        <InfoCard title="Roles" value="3" description="Owner, admin, member" />
      </div>
      {membersQuery.isLoading && <div className="p-3 text-xs text-muted-foreground">Loading members...</div>}
      {!membersQuery.isLoading && members.length === 0 && <div className="p-3 text-xs text-muted-foreground">No members found for this workspace yet.</div>}
      {members.map((member) => {
        const name = member.user?.name || member.user?.email || member.userId;
        const email = member.user?.email || "No email";
        return (
          <SettingsRow
            key={member.id}
            title={name}
            description={`${email} / ${member.role}`}
            action={
              <div className="flex items-center gap-1">
                <Button variant="outline" size="xs" onClick={() => copyValue(member.userId)} className={cn("gap-1.5", linearButtonClass)}><Copy className="h-3 w-3" />User ID</Button>
                <Button variant="outline" size="xs" onClick={() => copyValue(member.id)} className={cn("gap-1.5", linearButtonClass)}><Copy className="h-3 w-3" />Member ID</Button>
              </div>
            }
          />
        );
      })}
    </SettingsSection>
  );
}

function TeamsSettingsSection() {
  return (
    <SettingsSection title="Teams">
      <div className="grid gap-3 border-b border-border p-3 dark:border-[#222326] sm:grid-cols-3">
        <InfoCard title="Teams" value="0" description="Groups for permissions and ownership" />
        <InfoCard title="Spaces" value="Linked" description="Teams can be scoped to spaces" />
        <InfoCard title="Plan" value="Per seat" description="Billing follows active members" />
      </div>
      <SettingsRow title="Create teams" description="Create groups for departments, pods, or external collaborators." action={<Button variant="outline" size="xs" className={linearButtonClass}>Create team</Button>} />
      <SettingsRow title="Space assignment" description="Connect teams to spaces so projects inherit the right visibility." action={<Button variant="outline" size="xs" className={linearButtonClass}>Manage spaces</Button>} />
    </SettingsSection>
  );
}

function BillingSettingsSection({ organizationId, workspaceName }: { organizationId?: string | null; workspaceName: string }) {
  const locale = useLocale() as BillingLocale & UsageLocale;
  const overview = useBillingOverview(organizationId);
  const usage = useBillingUsage(organizationId);
  const [seats, setSeats] = useState(1);
  const pricePerSeat = useMemo(() => billingPricePerSeatLabel(locale), [locale]);
  const totalPerMonth = useMemo(() => seatTotalLabel(seats, locale), [seats, locale]);
  const status = overview?.subscription?.status ?? "inactive";
  const { isStartingCheckout, startCheckout } = useBillingCheckout({ organizationId: organizationId ?? null, effectiveSeats: seats, locale });
  const renewalLabel = billingDateLabel(overview?.subscription?.currentPeriodEndAt, locale, "Not active yet");

  return (
    <SettingsSection title="Billing">
      <div className="grid gap-3 p-3 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-border bg-background p-4 dark:border-[#222326] dark:bg-[#141416]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary dark:text-[#F4F5F8]" /><p className="text-xs font-semibold text-foreground dark:text-[#F4F5F8]">Subscription</p></div>
              <h3 className="mt-3 truncate text-2xl font-semibold tracking-tight text-foreground dark:text-[#F4F5F8]">{overview?.plan.name ?? "Qentrah Workspace"}</h3>
              <p className="mt-1 text-xs text-muted-foreground dark:text-[#94949b]">{workspaceName} pays {pricePerSeat} per user each month.</p>
            </div>
            <StatusPill label={status} tone={subscriptionTone(status)} />
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <InfoCard title="Renewal" value={renewalLabel} />
            <InfoCard title="Seats selected" value={String(seats)} />
            <InfoCard title="Monthly total" value={`${totalPerMonth} / month`} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4 dark:border-[#222326] dark:bg-[#141416]">
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary dark:text-[#F4F5F8]" /><p className="text-xs font-semibold text-foreground dark:text-[#F4F5F8]">Manage plan</p></div>
          <div className="mt-4 flex items-center justify-between rounded-md border border-border bg-card px-2 py-2 dark:border-[#222326] dark:bg-[#1f1f23]">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={seats <= 1} onClick={() => setSeats((value) => Math.max(1, value - 1))} aria-label="Remove seat"><Minus className="h-3.5 w-3.5" /></Button>
            <div className="text-center"><div className="text-2xl font-bold tabular-nums text-foreground">{seats}</div><div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{seats === 1 ? "user" : "users"}</div></div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSeats((value) => Math.min(9999, value + 1))} aria-label="Add seat"><Plus className="h-3.5 w-3.5" /></Button>
          </div>
          <Button className="mt-3 w-full gap-2 dark:bg-[#F4F5F8] dark:text-[#222326] dark:hover:bg-white" disabled={!organizationId || isStartingCheckout} onClick={startCheckout}>
            {isStartingCheckout ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Upgrade or pay
          </Button>
        </div>
      </div>
      {usage.status === "ready" && usage.data.payments.length > 0 && <div className="border-t border-border p-3 dark:border-[#222326]"><PaymentsLedger locale={locale} payments={usage.data.payments} /></div>}
    </SettingsSection>
  );
}

function AiUsageSettingsSection({ organizationId }: { organizationId?: string | null }) {
  const locale = useLocale() as UsageLocale;
  const usage = useBillingUsage(organizationId);
  const credits = usage.status === "ready" ? usage.data.credits : null;

  return (
    <SettingsSection title="Qentrah AI usage" eyebrow="Brain credits used by chat, agents, tools, and automation.">
      {usage.status === "loading" && <div className="grid gap-4 p-3 md:grid-cols-2"><Skeleton className="h-24 rounded-lg dark:bg-[#222326]" /><Skeleton className="h-24 rounded-lg dark:bg-[#222326]" /></div>}
      {usage.status === "error" && <div className="p-3 text-xs text-destructive">Billing usage could not be loaded.</div>}
      {credits && (
        <div className="grid gap-5 p-4 md:grid-cols-2">
          <CreditProgress label="Subscription credits" value={credits.subscriptionCreditsUsed} total={credits.subscriptionCreditsGranted} toneClassName="bg-primary" locale={locale} />
          <CreditProgress label="Add-on credits" value={credits.addOnCreditsUsed} total={credits.addOnCreditsGranted} toneClassName="bg-emerald-500" locale={locale} />
        </div>
      )}
      {usage.status === "ready" && (
        <div className="border-t border-border p-3 dark:border-[#222326]">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Payment history</div>
          <PaymentsLedger locale={locale} payments={usage.data.payments} />
        </div>
      )}
    </SettingsSection>
  );
}

function SecuritySettingsSection() {
  return (
    <SettingsSection title="Security & Permissions">
      <SettingsRow title="Role permissions" description="Manage owner, admin, member, and custom role permissions." action={<Button variant="outline" size="xs" className={linearButtonClass}>Open roles</Button>} />
      <SettingsRow title="API access" description="Control API keys, MCP links, and external app access." action={<Switch size="sm" />} />
      <SettingsRow title="Member enforcement" description="Require explicit workspace membership before data access." action={<Switch size="sm" defaultChecked />} />
    </SettingsSection>
  );
}

function AuditSettingsSection() {
  return (
    <SettingsSection title="Audit Logs">
      {["Membership updated", "Authorization event", "Workspace setting changed"].map((title) => (
        <SettingsRow key={title} title={title} description="Events will appear here as workspace auditing is enabled." action={<span className="text-[11px] text-muted-foreground">Waiting</span>} />
      ))}
    </SettingsSection>
  );
}

function TrashSettingsSection() {
  return (
    <SettingsSection title="Trash">
      <div className="p-3">
        <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center dark:border-[#222326] dark:bg-[#141416]">
          <Trash2 className="mx-auto h-6 w-6 text-muted-foreground" />
          <div className="mt-3 text-sm font-semibold text-foreground">No deleted items</div>
          <div className="mt-1 text-xs text-muted-foreground">Soft-deleted projects, tasks, spaces, and records will appear here.</div>
        </div>
      </div>
    </SettingsSection>
  );
}

function ApiSettingsSection() {
  return (
    <SettingsSection title="Qentrah API">
      <SettingsRow title="API keys" description="Create scoped keys for workspace integrations." action={<Button variant="outline" size="xs" className={linearButtonClass}>Create key</Button>} />
      <SettingsRow title="MCP endpoint" description="Connect agents to controlled workspace tools." action={<Button variant="outline" size="xs" className={linearButtonClass}>Manage MCP</Button>} />
      <SettingsRow title="Webhooks" description="Send workspace events to external systems." action={<span className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">Coming soon</span>} />
    </SettingsSection>
  );
}

function SimpleRowsSection({ title, rows }: { title: string; rows: Array<[string, string, string]> }) {
  return (
    <SettingsSection title={title}>
      {rows.map(([rowTitle, description, action]) => (
        <SettingsRow
          key={rowTitle}
          title={rowTitle}
          description={description}
          action={action === "Coming soon" ? <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground dark:bg-[#222326] dark:text-[#9b9ba1]">Coming soon</span> : <Button variant="outline" size="xs" className={linearButtonClass}>{action}</Button>}
        />
      ))}
    </SettingsSection>
  );
}

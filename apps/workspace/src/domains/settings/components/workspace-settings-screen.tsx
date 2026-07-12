"use client";

import type React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  Copy,
  CreditCard,
  Laptop,
  Loader2,
  Mail,
  RefreshCw,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { BILLING_PLANS, useBillingOverview, useBillingUsage, type BillingPlan, type BillingPlanId } from "@/domains/billing/api/billing";
import { useBillingCheckout } from "@/domains/billing/hooks/use-billing-checkout";
import { billableMemberUnits, subscriptionTotalForMembers } from "@/domains/billing/lib/billing-helpers";
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

const membershipPlans = [
  BILLING_PLANS.good_monthly,
  BILLING_PLANS.better_monthly,
  BILLING_PLANS.custom_monthly,
] as const;

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
      return <BillingSettingsSection organizationId={organizationId} />;
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
      return <SimpleRowsSection title="Automations Manager" rows={[["Workspace automations", "Build visual trigger-and-action workflows from the Automations page.", "Available"]]} />;
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

function BillingSettingsSection({ organizationId }: { organizationId?: string | null }) {
  const locale = useLocale() as UsageLocale;
  const membersQuery = useQuery({
    queryKey: organizationId ? organizationSettingsKeys.members(organizationId) : ["organization-members", "missing"],
    queryFn: () => listOrganizationMembers(organizationId ?? ""),
    enabled: Boolean(organizationId),
  });
  const overview = useBillingOverview(organizationId);
  const subscription = overview?.subscription ?? null;
  const memberCount = Math.max(1, membersQuery.data?.length ?? 1);
  const currentPlan = overview?.plan ?? BILLING_PLANS.good_monthly;
  const isSubscribed = subscription?.status === "active" || subscription?.status === "past_due";
  const { isStartingCheckout, startCheckout } = useBillingCheckout({
    organizationId: organizationId ?? null,
    effectiveSeats: memberCount,
    locale,
  });

  if (!organizationId) {
    return <SettingsSection title="Billing"><div className="p-4 text-sm text-muted-foreground">Choose an organization to view billing.</div></SettingsSection>;
  }

  const upgradePlans = membershipPlans.filter((plan) => plan.id !== currentPlan.id);

  return (
    <div className="max-w-5xl space-y-6">
      {!isSubscribed ? (
        <SettingsSection title="Choose a membership plan" eyebrow="Start the workspace subscription. The current offer includes 1-3 members in the first billing unit, then adds one billing unit for each extra member.">
          <div className="grid gap-3 p-3 md:grid-cols-2">
            {membershipPlans.map((plan) => (
              <MembershipPlanCard
                key={plan.id}
                plan={plan}
                memberCount={memberCount}
                isStartingCheckout={isStartingCheckout}
                onCheckout={startCheckout}
              />
            ))}
          </div>
        </SettingsSection>
      ) : (
        <>
          <SettingsSection title="Memberships" eyebrow={`${memberCount} active ${memberCount === 1 ? "member" : "members"} on ${currentPlan.name}.`}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground dark:border-[#222326]">
                  <tr>
                    <th className="px-4 py-3 text-left font-black">Member</th>
                    <th className="px-4 py-3 text-left font-black">Role</th>
                    <th className="px-4 py-3 text-left font-black">Billing</th>
                  </tr>
                </thead>
                <tbody>
                  {(membersQuery.data ?? []).map((member, index) => {
                    const name = member.user?.name || member.user?.email || member.userId;
                    const email = member.user?.email || "No email";
                    const billingLabel = index < currentPlan.includedMemberCount ? "Included" : "Additional";
                    return (
                      <tr key={member.id} className="border-b border-border last:border-b-0 dark:border-[#222326]">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{name}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">{email}</div>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold capitalize text-muted-foreground">{member.role}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-foreground">{billingLabel}</td>
                      </tr>
                    );
                  })}
                  {!membersQuery.isLoading && (membersQuery.data ?? []).length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-xs text-muted-foreground" colSpan={3}>No members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 border-t border-border p-3 dark:border-[#222326] sm:grid-cols-3">
              <InfoCard title="Current plan" value={currentPlan.name} description={subscription?.status ?? "active"} />
              <InfoCard title="Billing units" value={String(billableMemberUnits(currentPlan, memberCount))} description={`$${subscriptionTotalForMembers(currentPlan, memberCount)}/${currentPlan.periodDays >= 365 ? "year" : "month"}`} />
              <InfoCard title="Trial" value={`${currentPlan.trialDays} days`} description="Configured in Dodo" />
            </div>
          </SettingsSection>

          <SettingsSection title="Upgrade plan" eyebrow="Available plan changes for this workspace.">
            <div className="grid gap-3 p-3 md:grid-cols-2">
              {upgradePlans.map((plan) => (
                <MembershipPlanCard
                  key={plan.id}
                  plan={plan}
                  memberCount={memberCount}
                  currentPlanId={currentPlan.id}
                  isStartingCheckout={isStartingCheckout}
                  onCheckout={startCheckout}
                />
              ))}
            </div>
          </SettingsSection>
        </>
      )}
    </div>
  );
}

function MembershipPlanCard({
  plan,
  memberCount,
  currentPlanId,
  isStartingCheckout,
  onCheckout,
}: {
  plan: BillingPlan;
  memberCount: number;
  currentPlanId?: BillingPlanId;
  isStartingCheckout: boolean;
  onCheckout: (planId?: BillingPlanId) => void;
}) {
  const isCustom = plan.checkoutMode === "contact_sales";
  const isCurrent = currentPlanId === plan.id;
  const periodLabel = plan.periodDays >= 365 ? "year" : "month";
  const total = subscriptionTotalForMembers(plan, memberCount);

  return (
    <div className={cn(
      "flex min-h-56 flex-col justify-between rounded-lg border bg-background p-4 dark:bg-[#141416]",
      isCustom ? "border-red-200 dark:border-red-950" : "border-border dark:border-[#222326]",
      isCustom && "md:col-span-2",
    )}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={cn("text-[10px] font-black uppercase tracking-wider", isCustom ? "text-red-500" : "text-muted-foreground")}>
              {isCustom ? "Custom" : "Plan"}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{plan.name}</h3>
          </div>
          {isCurrent && <span className="rounded-full bg-muted px-2 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Current</span>}
        </div>
        <div className="mt-4 text-2xl font-black text-foreground">
          {plan.amount === null ? "Custom" : `$${plan.amount}`}
          {plan.amount !== null && <span className="ml-1 text-xs font-semibold text-muted-foreground">/{periodLabel}</span>}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {plan.amount === null
            ? "Sales-led plan for advanced governance and support."
            : `Includes ${plan.includedMemberCount} members. ${memberCount} members = $${total}/${periodLabel}.`}
        </div>
        <div className="mt-4 grid gap-2 text-xs">
          <div className="flex justify-between rounded-md bg-muted/40 px-3 py-2"><span className="text-muted-foreground">AI credits</span><span className="font-semibold">{plan.access.aiCreditLimit.toLocaleString()}/month</span></div>
          <div className="flex justify-between rounded-md bg-muted/40 px-3 py-2"><span className="text-muted-foreground">AI cards</span><span className="font-semibold">{plan.access.aiCardLimit}</span></div>
          <div className="flex justify-between rounded-md bg-muted/40 px-3 py-2"><span className="text-muted-foreground">Support</span><span className="font-semibold capitalize">{plan.access.support}</span></div>
        </div>
      </div>
      {isCustom ? (
        <Link
          href="/contact"
          className={cn(
            "mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-red-200 px-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:border-red-950 dark:text-red-400 dark:hover:bg-red-950/20",
            linearButtonClass,
          )}
        >
          Contact sales
        </Link>
      ) : (
        <Button disabled={isCurrent || isStartingCheckout} onClick={() => onCheckout(plan.id)} className="mt-4 h-9 gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
          {isStartingCheckout ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
          {isCurrent ? "Current plan" : "Start plan"}
        </Button>
      )}
    </div>
  );
}

function AiUsageSettingsSection({ organizationId }: { organizationId?: string | null }) {
  const locale = useLocale() as UsageLocale;
  const usage = useBillingUsage(organizationId);
  const credits = usage.status === "ready" ? usage.data.credits : null;
  const plan = usage.status === "ready" ? usage.data.overview.plan : BILLING_PLANS.good_monthly;
  const usedCredits = credits?.subscriptionCreditsUsed ?? 0;
  const grantedCredits = credits?.subscriptionCreditsGranted ?? plan.access.aiCreditLimit;
  const usagePercent = grantedCredits > 0 ? Math.round((usedCredits / grantedCredits) * 100) : 0;

  return (
    <div className="max-w-5xl space-y-8">
      <PlainSettingsSection title="AI Super Credits" eyebrow="For agents, AI cards, fields, task assistance, and image generation. Credits are shared by the organization.">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">Credits usage</div>
          <div className="mt-3 text-3xl font-black text-foreground">{usagePercent}%</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {usedCredits.toLocaleString()} used out of {grantedCredits.toLocaleString()}
          </div>
          {credits && (
            <div className="mt-5 grid gap-5">
              <CreditProgress label="Organization credits" value={credits.subscriptionCreditsUsed} total={credits.subscriptionCreditsGranted} toneClassName="bg-primary" locale={locale} />
              {credits.addOnCreditsGranted > 0 && (
                <CreditProgress label="Add-on credits" value={credits.addOnCreditsUsed} total={credits.addOnCreditsGranted} toneClassName="bg-emerald-500" locale={locale} />
              )}
            </div>
          )}
        </div>
        {usage.status === "loading" && <div className="mt-5 grid gap-4 md:grid-cols-2"><Skeleton className="h-24 rounded-lg dark:bg-[#222326]" /><Skeleton className="h-24 rounded-lg dark:bg-[#222326]" /></div>}
        {usage.status === "error" && <div className="mt-5 text-xs text-destructive">Billing usage could not be loaded: {usage.error.message}</div>}
        {credits && (
          <div className="mt-6 grid gap-4 border-t border-border pt-5 dark:border-[#222326] sm:grid-cols-3">
            <SimpleMetric title="Credits left" value={(credits.subscriptionCreditsRemaining + credits.addOnCreditsRemaining).toLocaleString()} description="Available to the organization" />
            <SimpleMetric title="Plan limit" value={plan.access.aiCreditLimit.toLocaleString()} description={`${plan.name} included credits`} />
            <SimpleMetric title="Default member limit" value="Unlimited" description="Members share organization credits" />
          </div>
        )}
      </PlainSettingsSection>

      {credits && (
        <PlainSettingsSection title="Credit ledger" eyebrow="Backed by the current organization billing balance.">
          <div className="grid gap-4 md:grid-cols-3">
            <SimpleMetric title="Subscription used" value={credits.subscriptionCreditsUsed.toLocaleString()} description={`${credits.subscriptionCreditsRemaining.toLocaleString()} remaining`} />
            <SimpleMetric title="Subscription granted" value={credits.subscriptionCreditsGranted.toLocaleString()} description={plan.name} />
            <SimpleMetric title="Add-on balance" value={credits.addOnCreditsRemaining.toLocaleString()} description={`${credits.addOnCreditsUsed.toLocaleString()} used of ${credits.addOnCreditsGranted.toLocaleString()}`} />
          </div>
        </PlainSettingsSection>
      )}

      {usage.status === "ready" && (
        <PlainSettingsSection title="Payment history">
          <PaymentsLedger locale={locale} payments={usage.data.payments} />
        </PlainSettingsSection>
      )}
    </div>
  );
}

function PlainSettingsSection({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground dark:text-[#F4F5F8]">{title}</h2>
        {eyebrow && <p className="text-xs leading-5 text-muted-foreground dark:text-[#9b9ba1]">{eyebrow}</p>}
      </div>
      {children}
    </section>
  );
}

function SimpleMetric({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground dark:text-[#85858c]">{title}</div>
      <div className="mt-2 text-lg font-semibold text-foreground dark:text-[#F4F5F8]">{value}</div>
      {description && <div className="mt-1 text-[11px] leading-4 text-muted-foreground dark:text-[#909098]">{description}</div>}
    </div>
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

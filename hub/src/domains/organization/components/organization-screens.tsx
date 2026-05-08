"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LucideIcon } from "lucide-react";
import { Building2, Check, Code, Globe, KeyRound, Mail, Phone, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { AppDataTable, AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid, AppTabsList, type AppDataTableColumn } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useOrganizationStore } from "@/domains/organization";
import type { ApiKey, TeamMember } from "../store/organization.types";
import { apiKeySchema, teamMemberSchema, type ApiKeyFormValues, type TeamMemberFormValues } from "../validation/organization.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { ChoiceGrid, DeleteRecordDialog, FormErrorSummary, StatusPill, TextInput } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";

const roles: TeamMember["role"][] = ["Owner", "Admin", "Manager", "Editor", "Viewer"];
const apiScopes = ["Read", "Write", "Sync"] as const;

export function OrganizationScreen() {
  const t = useTranslations('Organization');
  const { organization, team, apiKeys, apps, updateMember, deleteMember, deleteApiKey } = useOrganizationStore();
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [deletingKey, setDeletingKey] = useState<ApiKey | null>(null);
  const memberDeleteOperation = useOperationState({ errorMessage: "Team member removal failed." });
  const keyDeleteOperation = useOperationState({ errorMessage: "API key delete failed." });

  const teamColumns: AppDataTableColumn<TeamMember>[] = [
    { key: "name", header: t('team.memberCol'), render: (member) => <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 font-black dark:bg-white/5">{member.name.charAt(0)}</div><div><p className="text-xs font-black uppercase text-zinc-900 dark:text-white">{member.name}</p><p className="mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-400">{member.email}</p></div></div> },
    { key: "role", header: t('team.roleCol'), render: (member) => <select aria-label={`Role for ${member.name}`} value={member.role} onChange={(event) => updateMember(member.id, { role: event.target.value as TeamMember["role"] })} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/5 dark:bg-white/[0.02]">{roles.map((role) => <option key={role} value={role}>{t(`roles.${role}`)}</option>)}</select> },
    { key: "status", header: t('team.statusCol'), render: (member) => <StatusPill label={member.status} tone={member.status === "Active" ? "success" : "warning"} /> },
    { key: "actions", header: "", align: "end", render: (member) => <button type="button" aria-label={`Remove ${member.name}`} onClick={() => setDeletingMember(member)} className="p-2 text-zinc-300 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button> },
  ];

  const keyColumns: AppDataTableColumn<ApiKey>[] = [
    { key: "name", header: t('api.keyCol') },
    { key: "token", header: t('api.tokenCol') },
    { key: "scopes", header: t('api.scopesCol'), render: (key) => <div className="flex flex-wrap gap-2">{key.scopes.map((scope) => <StatusPill key={scope} label={t(`api.scopes.${scope.toLowerCase()}`)} tone="info" />)}</div> },
    { key: "created", header: t('api.createdCol') },
    { key: "actions", header: "", align: "end", render: (key) => <button type="button" aria-label={`Delete ${key.name}`} onClick={() => setDeletingKey(key)} className="p-2 text-zinc-300 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button> },
  ];

  return (
    <AppPageShell maxWidth="default">
      <AppPageHeader eyebrow={t('eyebrow')} title={t('title') + "."} context={<StatusPill label={organization.name} tone="info" />} />
      <AppStatsGrid stats={[
        { label: t('stats.members'), value: team.length, icon: Users },
        { label: t('stats.keys'), value: apiKeys.length, icon: KeyRound },
        { label: t('stats.apps'), value: apps.length, icon: Code },
        { label: t('stats.status'), value: t('stats.verified'), icon: ShieldCheck },
      ]} />
      <Tabs defaultValue="info" className="space-y-10">
        <AppTabsList tabs={[
          { value: "info", label: t('tabs.info') }, 
          { value: "team", label: t('tabs.team') }, 
          { value: "apps", label: t('tabs.apps') }, 
          { value: "api", label: t('tabs.api') }
        ]} />
        <TabsContent value="info">
          <div className="grid gap-6 lg:grid-cols-2">
            <AppSection title={t('sections.legal')}>
              <div className="space-y-5">
                {[
                  { label: t('labels.legalName'), value: organization.legalName, icon: Building2 },
                  { label: t('labels.displayName'), value: organization.name, icon: Building2 },
                  { label: t('labels.type'), value: organization.type, icon: ShieldCheck },
                  { label: t('labels.address'), value: organization.address, icon: Globe },
                ].map((item) => <InfoRow key={item.label} label={item.label} value={item.value} icon={item.icon} />)}
              </div>
            </AppSection>
            <AppSection title={t('sections.contact')}>
              <div className="space-y-5">
                <InfoRow label={t('labels.email')} value={organization.email} icon={Mail} />
                <InfoRow label={t('labels.phone')} value={organization.phone} icon={Phone} />
                <InfoRow label={t('labels.website')} value={organization.website} icon={Globe} />
              </div>
            </AppSection>
          </div>
        </TabsContent>
        <TabsContent value="team" className="space-y-6">
          <div className="flex justify-end"><InviteMemberDialog /></div>
          <AppDataTable columns={teamColumns} data={team} getRowKey={(member) => member.id} />
        </TabsContent>
        <TabsContent value="apps">
          <div className="grid gap-4 md:grid-cols-2">
            {apps.map((app) => (
              <AppSection key={app.id} title={app.name} description={`${app.type} / ${app.date}`}>
                <StatusPill label={app.status} tone="success" />
              </AppSection>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="api" className="space-y-6">
          <div className="flex justify-end"><CreateApiKeyDialog /></div>
          <AppDataTable columns={keyColumns} data={apiKeys} getRowKey={(key) => key.id} />
        </TabsContent>
      </Tabs>
      <DeleteRecordDialog
        open={Boolean(deletingMember)}
        onOpenChange={(open) => {
          if (!open) {
            memberDeleteOperation.clearError();
            setDeletingMember(null);
          }
        }}
        title={t('team.removeTitle')}
        description={t('team.removeDesc', { name: deletingMember?.name ?? "..." })}
        isDeleting={memberDeleteOperation.isRunning}
        error={memberDeleteOperation.error}
        onConfirm={() => memberDeleteOperation.run(() => {
          if (!deletingMember || !team.some((member) => member.id === deletingMember.id)) throw new Error("This member is no longer available.");
          deleteMember(deletingMember.id);
        }, { successMessage: "Team member removed.", onSuccess: () => setDeletingMember(null) })}
      />
      <DeleteRecordDialog
        open={Boolean(deletingKey)}
        onOpenChange={(open) => {
          if (!open) {
            keyDeleteOperation.clearError();
            setDeletingKey(null);
          }
        }}
        title={t('api.deleteTitle')}
        description={t('api.deleteDesc', { name: deletingKey?.name ?? "..." })}
        isDeleting={keyDeleteOperation.isRunning}
        error={keyDeleteOperation.error}
        onConfirm={() => keyDeleteOperation.run(() => {
          if (!deletingKey || !apiKeys.some((key) => key.id === deletingKey.id)) throw new Error("This API key is no longer available.");
          deleteApiKey(deletingKey.id);
        }, { successMessage: "API key deleted.", onSuccess: () => setDeletingKey(null) })}
      />
    </AppPageShell>
  );
}

export function TeamScreen() {
  return <OrganizationScreen />;
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-100 p-5 dark:border-white/5">
      <Icon className="h-4 w-4 text-zinc-300" />
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
        <p className="mt-1 text-sm font-black uppercase text-zinc-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function InviteMemberDialog() {
  const t = useTranslations('Organization');
  const createMember = useOrganizationStore((state) => state.createMember);
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: { name: "", email: "", role: "Editor" },
  });
  const form = useWatch({ control }) as TeamMemberFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof TeamMemberFormValues, string | undefined>;
  const inviteOperation = useOperationState({ errorMessage: "Member invite failed." });

  function updateField<TKey extends keyof TeamMemberFormValues>(key: TKey, value: TeamMemberFormValues[TKey]) {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    inviteOperation.clearError();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      inviteOperation.clearError();
    }
  }
  const onSubmit = handleSubmit((data) => {
    inviteOperation.run(() => createMember(data), {
      successMessage: "Team member invited.",
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<AppPrimaryButton><UserPlus className="me-2 h-3.5 w-3.5" />{t('team.invite')}</AppPrimaryButton>} />
      <DialogContent className="max-w-md rounded-[32px] border-zinc-100 bg-white p-8 shadow-none dark:border-white/5 dark:bg-[#0A0A0A]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">{t('team.inviteTitle')}</DialogTitle>
          <DialogDescription>{t('team.inviteDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <FormErrorSummary errors={fieldErrors} />
          <TextInput name="name" label={t('team.nameLabel')} value={form.name} onChange={(value) => updateField("name", value)} placeholder="Sara Al-Rashid…" autoComplete="name" error={fieldErrors.name} />
          <TextInput name="email" label={t('team.emailLabel')} type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="member@acme.com…" autoComplete="email" error={fieldErrors.email} />
          <ChoiceGrid id="role" label={t('team.roleLabel')} value={form.role} onChange={(value) => updateField("role", value as TeamMember["role"])} columns="grid-cols-2" options={roles.map((item) => ({ value: item, label: t(`roles.${item}`) }))} error={fieldErrors.role} />
        </div>
        <DialogFooter>
          <AppPrimaryButton 
            onClick={onSubmit} 
            disabled={inviteOperation.isRunning || isSubmitting}
          >
            {t('team.inviteBtn')}
          </AppPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateApiKeyDialog() {
  const t = useTranslations('Organization');
  const createApiKey = useOrganizationStore((state) => state.createApiKey);
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { name: "", scopes: ["Read"] },
  });
  const form = useWatch({ control }) as ApiKeyFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ApiKeyFormValues, string | undefined>;
  const keyOperation = useOperationState({ errorMessage: "API key generation failed." });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
      keyOperation.clearError();
    }
  }
  const onSubmit = handleSubmit((data) => {
    keyOperation.run(() => createApiKey(data.name, data.scopes), {
      successMessage: "API key generated.",
      onSuccess: () => setOpen(false),
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<AppPrimaryButton><KeyRound className="me-2 h-3.5 w-3.5" />{t('api.generate')}</AppPrimaryButton>} />
      <DialogContent className="max-w-md rounded-[32px] border-zinc-100 bg-white p-8 shadow-none dark:border-white/5 dark:bg-[#0A0A0A]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">{t('api.generateTitle')}</DialogTitle>
          <DialogDescription>{t('api.generateDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <FormErrorSummary errors={fieldErrors} />
          <TextInput name="name" label={t('api.keyNameLabel')} value={form.name} onChange={(value) => { setValue("name", value, { shouldDirty: true, shouldValidate: Boolean(fieldErrors.name) }); keyOperation.clearError(); }} placeholder="Production Access Key…" error={fieldErrors.name} />
          <div className="grid grid-cols-3 gap-2">
            {apiScopes.map((scope) => {
              const active = form.scopes.includes(scope);
              return (
                <button 
                  key={scope} 
                  type="button" 
                  aria-pressed={active} 
                  onClick={() => { 
                    setValue("scopes", active ? form.scopes.filter((item) => item !== scope) : [...form.scopes, scope], { shouldDirty: true, shouldValidate: Boolean(fieldErrors.scopes) });
                    keyOperation.clearError(); 
                  }} 
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/10 dark:bg-white/5"
                >
                  {active && <Check className="h-3 w-3" aria-hidden="true" />}
                  {t(`api.scopes.${scope.toLowerCase()}`)}
                </button>
              );
            })}
          </div>
          {fieldErrors.scopes && <p className="text-xs font-bold text-red-600">{fieldErrors.scopes}</p>}
        </div>
        <DialogFooter>
          <AppPrimaryButton 
            onClick={onSubmit} 
            disabled={keyOperation.isRunning || isSubmitting}
          >
            {t('api.generateBtn')}
          </AppPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

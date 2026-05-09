"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useConvexAuth, useQuery } from "convex/react";
import type { LucideIcon } from "lucide-react";
import { Building2, Code, Globe, KeyRound, Mail, Pencil, Phone, ShieldCheck, Users } from "lucide-react";
import { api } from "@convex/_generated/api";
import { AppDataTable, AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid, AppTabsList, type AppDataTableColumn } from "@/components/shared";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useOrganizationStore } from "@/domains/organization";
import { demoApiKeys, demoApps, demoOrganization, demoTeam } from "../data/demo-organization";
import type { ApiKey, TeamMember } from "../store/organization.types";
import { updateOrganizationProfileSchema, type UpdateOrganizationProfileValues } from "../validation/organization.schema";
import { useUpdateOrganizationProfileMutation } from "../api/use-update-profile";
import { FormErrorSummary, StatusPill, TextInput } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";

export function OrganizationScreen() {
  const t = useTranslations('Organization');
  const { isAuthenticated } = useConvexAuth();
  const selectedOrganizationId = useOrganizationStore((state) => state.selectedOrganizationId);
  const liveOrganization = useQuery(
    api.organizations.profile.read.getProfile,
    isAuthenticated ? { organizationId: selectedOrganizationId } : "skip",
  );
  const organization = liveOrganization ?? demoOrganization;
  const team = demoTeam;
  const apiKeys = demoApiKeys;
  const apps = demoApps;

  const teamColumns: AppDataTableColumn<TeamMember>[] = [
    { key: "name", header: t('team.memberCol'), render: (member) => <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 font-black dark:bg-white/5">{member.name.charAt(0)}</div><div><p className="text-xs font-black uppercase text-zinc-900 dark:text-white">{member.name}</p><p className="mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-400">{member.email}</p></div></div> },
    { key: "role", header: t('team.roleCol'), render: (member) => <StatusPill label={t(`roles.${member.role}`)} tone="neutral" /> },
    { key: "status", header: t('team.statusCol'), render: (member) => <StatusPill label={member.status} tone={member.status === "Active" ? "success" : "warning"} /> },
  ];

  const keyColumns: AppDataTableColumn<ApiKey>[] = [
    { key: "name", header: t('api.keyCol') },
    { key: "token", header: t('api.tokenCol') },
    { key: "scopes", header: t('api.scopesCol'), render: (key) => <div className="flex flex-wrap gap-2">{key.scopes.map((scope) => <StatusPill key={scope} label={t(`api.scopes.${scope.toLowerCase()}`)} tone="info" />)}</div> },
    { key: "created", header: t('api.createdCol') },
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
          <div className="mb-6 flex justify-end">
            <UpdateOrganizationProfileDialog organization={organization} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <AppSection title={t('sections.legal')}>
              <div className="space-y-5">
                {[
                  { label: t('labels.legalName'), value: organization.legalName ?? "Not set", icon: Building2 },
                  { label: t('labels.displayName'), value: organization.name, icon: Building2 },
                  { label: t('labels.type'), value: organization.type ?? "Not set", icon: ShieldCheck },
                  { label: t('labels.address'), value: organization.address ?? "Not set", icon: Globe },
                ].map((item) => <InfoRow key={item.label} label={item.label} value={item.value} icon={item.icon} />)}
              </div>
            </AppSection>
            <AppSection title={t('sections.contact')}>
              <div className="space-y-5">
                <InfoRow label={t('labels.email')} value={organization.email ?? "Not set"} icon={Mail} />
                <InfoRow label={t('labels.phone')} value={organization.phone ?? "Not set"} icon={Phone} />
                <InfoRow label={t('labels.website')} value={organization.website ?? "Not set"} icon={Globe} />
              </div>
            </AppSection>
          </div>
        </TabsContent>
        <TabsContent value="team" className="space-y-6">
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
          <AppDataTable columns={keyColumns} data={apiKeys} getRowKey={(key) => key.id} />
        </TabsContent>
      </Tabs>
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

function UpdateOrganizationProfileDialog({ organization }: { organization: UpdateOrganizationProfileValues & { organizationId: string } }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const updateProfile = useUpdateOrganizationProfileMutation(organization.organizationId);
  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<UpdateOrganizationProfileValues>({
    resolver: zodResolver(updateOrganizationProfileSchema),
    defaultValues: {
      name: organization.name,
      legalName: organization.legalName,
      type: organization.type,
      email: organization.email,
      phone: organization.phone,
      website: organization.website,
      address: organization.address,
    },
  });
  const form = useWatch({ control }) as UpdateOrganizationProfileValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message ?? ""])) as Record<keyof UpdateOrganizationProfileValues, string>;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      reset({
        name: organization.name,
        legalName: organization.legalName,
        type: organization.type,
        email: organization.email,
        phone: organization.phone,
        website: organization.website,
        address: organization.address,
      });
    }
  }

  function updateField(key: keyof UpdateOrganizationProfileValues, value: string) {
    const options = { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) };

    if (key === "name") setValue("name", value, options);
    if (key === "legalName") setValue("legalName", value, options);
    if (key === "type") setValue("type", value, options);
    if (key === "email") setValue("email", value, options);
    if (key === "phone") setValue("phone", value, options);
    if (key === "website") setValue("website", value, options);
    if (key === "address") setValue("address", value, options);
  }

  const onSubmit = handleSubmit((data) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        toast({ title: "Organization profile updated.", type: "success" });
        setOpen(false);
      },
      onError: (error) => {
        toast({ title: "Organization update failed.", description: error.message, type: "error" });
      },
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<AppPrimaryButton><Pencil className="me-2 h-3.5 w-3.5" />Edit profile</AppPrimaryButton>} />
      <DialogContent className="max-w-xl rounded-[32px] border-zinc-100 bg-white p-8 shadow-none dark:border-white/5 dark:bg-[#0A0A0A]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit organization</DialogTitle>
          <DialogDescription>Keep the business profile current for every workspace member.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormErrorSummary errors={fieldErrors} />
          </div>
          <TextInput name="name" label="Display name" value={form.name} onChange={(value) => updateField("name", value)} error={fieldErrors.name} />
          <TextInput name="legalName" label="Legal name" value={form.legalName} onChange={(value) => updateField("legalName", value)} error={fieldErrors.legalName} />
          <TextInput name="type" label="Type" value={form.type} onChange={(value) => updateField("type", value)} error={fieldErrors.type} />
          <TextInput name="email" label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} error={fieldErrors.email} />
          <TextInput name="phone" label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} error={fieldErrors.phone} />
          <TextInput name="website" label="Website" value={form.website} onChange={(value) => updateField("website", value)} error={fieldErrors.website} />
          <div className="md:col-span-2">
            <TextInput name="address" label="Address" value={form.address} onChange={(value) => updateField("address", value)} error={fieldErrors.address} />
          </div>
        </div>
        <DialogFooter>
          <AppPrimaryButton onClick={onSubmit} disabled={updateProfile.isPending || isSubmitting}>
            Save profile
          </AppPrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

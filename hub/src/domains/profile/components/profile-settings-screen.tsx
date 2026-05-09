"use client";

import { Bell, Globe, Mail, Phone, Save, ShieldCheck, User } from "lucide-react";
import { type Path, type PathValue, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid } from "@/components/shared";
import { useProfileStore } from "@/domains/profile";
import { profileSchema, type ProfileFormValues } from "../validation/profile.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { ChoiceGrid, FormErrorSummary, TextInput } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function ProfileSettingsScreen() {
  const t = useTranslations('Profile');
  const { profile, updateProfile, updateNotification } = useProfileStore();
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      language: profile.language,
      timezone: profile.timezone,
    },
  });
  const draft = useWatch({ control }) as ProfileFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ProfileFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Profile save failed." });
  const notificationOperation = useOperationState({ errorMessage: "Notification update failed." });

  function updateDraft<TKey extends Path<ProfileFormValues>>(key: TKey, value: PathValue<ProfileFormValues, TKey>) {
    setValue(key, value, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  }

  const saveProfile = handleSubmit((data) => {
    saveOperation.run(() => updateProfile(data), { successMessage: "Profile saved." });
  });

  return (
    <AppPageShell maxWidth="default">
      <AppPageHeader 
        eyebrow={t('eyebrow')} 
        title={t('title')} 
        subtitle={t('subtitle')}
        actions={
          <AppPrimaryButton 
            onClick={saveProfile} 
            disabled={saveOperation.isRunning || isSubmitting}
            className="shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="me-2 h-3.5 w-3.5" />
            {t('saveBtn')}
          </AppPrimaryButton>
        } 
      />
      <AppStatsGrid stats={[
        { label: t('stats.role'), value: profile.role, icon: ShieldCheck, iconClassName: "text-zinc-900 dark:text-white" },
        { label: t('stats.language'), value: profile.language === 'ar' ? 'العربية' : 'English', icon: Globe, iconClassName: "text-zinc-900 dark:text-white" },
        { label: t('stats.timezone'), value: profile.timezone, icon: Globe, iconClassName: "text-zinc-900 dark:text-white" },
        { label: t('stats.notifications'), value: Object.values(profile.notifications).filter(Boolean).length, icon: Bell, iconClassName: "text-emerald-500" },
      ]} />
      <div className="grid gap-6 lg:grid-cols-2">
        <AppSection title={t('sections.identity')}>
          <div className="space-y-5">
            <FormErrorSummary errors={fieldErrors} />
            <TextInput label={t('form.nameLabel')} name="name" autoComplete="name" value={draft.name} onChange={(name) => updateDraft("name", name)} error={fieldErrors.name} />
            <TextInput label={t('form.emailLabel')} name="email" type="email" autoComplete="email" value={draft.email} onChange={(email) => updateDraft("email", email)} error={fieldErrors.email} />
            <TextInput label={t('form.phoneLabel')} name="phone" type="tel" autoComplete="tel" value={draft.phone} onChange={(phone) => updateDraft("phone", phone)} error={fieldErrors.phone} />
            <TextInput label={t('form.roleLabel')} name="role" autoComplete="organization-title" value={draft.role} onChange={(role) => updateDraft("role", role)} error={fieldErrors.role} />
          </div>
        </AppSection>
        <AppSection title={t('sections.preferences')}>
          <div className="space-y-6">
            <ChoiceGrid id="profile-language" label={t('form.languageLabel')} value={draft.language} onChange={(language) => updateDraft("language", language as ProfileFormValues["language"])} columns="grid-cols-2" error={fieldErrors.language} options={[{ value: "en", label: "English" }, { value: "ar", label: "العربية" }]} />
            <TextInput label={t('form.timezoneLabel')} name="timezone" value={draft.timezone} onChange={(timezone) => updateDraft("timezone", timezone)} error={fieldErrors.timezone} />
            <div className="space-y-3">
              {Object.entries(profile.notifications).map(([key, enabled]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={enabled}
                  disabled={notificationOperation.isRunning}
                  onClick={() => notificationOperation.run(() => updateNotification(key as keyof typeof profile.notifications, !enabled), { successMessage: "Notification updated." })}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-[24px] border p-5 text-start transition-all duration-300 focus-visible:ring-2 focus-visible:ring-zinc-900/15 disabled:opacity-60",
                    enabled 
                      ? "border-emerald-500/20 bg-emerald-500/[0.02] dark:border-emerald-500/30 dark:bg-emerald-500/[0.05]" 
                      : "border-zinc-100 bg-white hover:border-zinc-200 dark:border-white/5 dark:bg-white/[0.02]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-500",
                      enabled ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]" : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-900 dark:bg-white/5"
                    )}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-900 dark:text-white">{t(`notifications.${key}`)}</span>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{enabled ? t('notifications.on') : t('notifications.off')}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all duration-500",
                    enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-zinc-200 dark:bg-white/10"
                  )} />
                </button>
              ))}
            </div>
          </div>
        </AppSection>
      </div>
      <AppSection title={t('sections.security')} tone="inverse" className="overflow-hidden relative">
        <div className="grid gap-4 md:grid-cols-3 relative z-10">
          <ContactTile icon={User} label={t('contact.owner')} value={profile.name} />
          <ContactTile icon={Mail} label={t('contact.email')} value={profile.email} />
          <ContactTile icon={Phone} label={t('contact.phone')} value={profile.phone} />
        </div>
        {/* Institutional decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      </AppSection>
    </AppPageShell>
  );
}

function ContactTile({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-6 transition-all duration-500 hover:bg-white/[0.06]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white transition-all duration-500 group-hover:scale-110 group-hover:bg-white/10">
          <Icon className="h-4 w-4" />
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-white/20 transition-all duration-500 group-hover:bg-white/40 group-hover:shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      </div>
      <div className="mt-8">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{label}</p>
        <p className="mt-1 text-sm font-black uppercase tracking-tight text-white">{value}</p>
      </div>
      {/* Dynamic decoration */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl transition-all duration-700 group-hover:bg-white/[0.05]" />
    </div>
  );
}

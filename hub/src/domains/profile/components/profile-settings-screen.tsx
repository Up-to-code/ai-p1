"use client";

import { Bell, Globe, Mail, Phone, Save, ShieldCheck, User } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid } from "@/components/shared";
import { useProfileStore } from "@/domains/profile";
import { profileSchema, type ProfileFormValues } from "../validation/profile.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { ChoiceGrid, FormErrorSummary, TextInput } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";

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

  function updateDraft<TKey extends keyof ProfileFormValues>(key: TKey, value: ProfileFormValues[TKey]) {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  }

  const saveProfile = handleSubmit((data) => {
    saveOperation.run(() => updateProfile(data), { successMessage: "Profile saved." });
  });

  return (
    <AppPageShell maxWidth="default">
      <AppPageHeader eyebrow={t('eyebrow')} title={t('title') + "."} actions={<AppPrimaryButton onClick={saveProfile} disabled={saveOperation.isRunning || isSubmitting}><Save className="me-2 h-3.5 w-3.5" />{t('saveBtn')}</AppPrimaryButton>} />
      <AppStatsGrid stats={[
        { label: t('stats.role'), value: profile.role, icon: ShieldCheck },
        { label: t('stats.language'), value: profile.language === 'ar' ? 'العربية' : 'English', icon: Globe },
        { label: t('stats.timezone'), value: profile.timezone, icon: Globe },
        { label: t('stats.notifications'), value: Object.values(profile.notifications).filter(Boolean).length, icon: Bell },
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
                  className="flex w-full items-center justify-between rounded-2xl border border-zinc-100 p-4 text-start transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900/15 disabled:opacity-60 dark:border-white/5"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">{t(`notifications.${key}`)}</span>
                  <span className={enabled ? "text-emerald-500" : "text-zinc-300"}>{enabled ? t('notifications.on') : t('notifications.off')}</span>
                </button>
              ))}
            </div>
          </div>
        </AppSection>
      </div>
      <AppSection title={t('sections.security')} tone="inverse">
        <div className="grid gap-4 md:grid-cols-3">
          <ContactTile icon={User} label={t('contact.owner')} value={profile.name} />
          <ContactTile icon={Mail} label={t('contact.email')} value={profile.email} />
          <ContactTile icon={Phone} label={t('contact.phone')} value={profile.phone} />
        </div>
      </AppSection>
    </AppPageShell>
  );
}

function ContactTile({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-5">
      <Icon className="h-4 w-4 opacity-50" />
      <p className="mt-5 text-[9px] font-black uppercase tracking-widest opacity-50">{label}</p>
      <p className="mt-1 text-sm font-black uppercase">{value}</p>
    </div>
  );
}

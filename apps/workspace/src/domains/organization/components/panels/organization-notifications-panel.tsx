"use client";

import { Bell, Building2, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NotificationCategory, NotificationPreference } from "@/domains/notifications/api/notifications";
import { EmptyState, LoadingCardGrid, Section } from "../shared";
import { NotificationPolicyRow } from "./notification-policy-row";

const notificationCategories: NotificationCategory[] = ["calendar", "task", "manual", "organization"];

export function OrganizationNotificationsPanel({
  preference,
  canManage,
  loading,
  saving,
  onSave,
}: {
  preference: NotificationPreference;
  canManage: boolean;
  loading: boolean;
  saving: boolean;
  onSave: (preference: NotificationPreference) => void;
}) {
  const t = useTranslations("Organization.notifications");
  const disabled = !canManage || loading || saving;

  function save(next: NotificationPreference) {
    if (!canManage) return;
    onSave(next);
  }

  return (
    <div className="space-y-6">
      <Section title={t("title")} description={t("description")}>
        <div className="space-y-5">
          {!canManage && <EmptyState title={t("noAccessTitle")} description={t("noAccessDescription")} />}
          {canManage && loading && <LoadingCardGrid label={t("loading")} />}
          {canManage && !loading && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-3">
                <NotificationPolicyRow
                  icon={Bell}
                  label={t("enabled")}
                  note={t("enabledHelp")}
                  enabled={preference.enabled}
                  disabled={disabled}
                  onToggle={() => save({ ...preference, enabled: !preference.enabled })}
                />
                {notificationCategories.map((category) => (
                  <NotificationPolicyRow
                    key={category}
                    icon={category === "calendar" ? CalendarDays : category === "task" ? CheckCircle2 : category === "organization" ? Building2 : Clock}
                    label={t(`categories.${category}`)}
                    note={t(`categoryHelp.${category}`)}
                    enabled={preference.categories[category]}
                    disabled={disabled || !preference.enabled}
                    onToggle={() => save({
                      ...preference,
                      categories: {
                        ...preference.categories,
                        [category]: !preference.categories[category],
                      },
                    })}
                  />
                ))}
              </div>


            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

"use client";

import { Bell, Clock, Smartphone } from "lucide-react";
import type { NotificationCategory, NotificationPreference } from "@/domains/notifications/api/notifications";
import { cn } from "@/lib/utils";
import { NotificationSwitchRow, Section } from "../shared/profile-settings-fields";

export function NotificationsTabPanel({
  notificationPreference,
  hasActiveDevice,
  isPending,
  onToggleEnabled,
  onToggleCategory,
  labels,
}: {
  notificationPreference: NotificationPreference;
  hasActiveDevice: boolean;
  isPending: boolean;
  onToggleEnabled: () => void;
  onToggleCategory: (category: NotificationCategory) => void;
  labels: {
    mobileNotificationsTitle: string;
    mobileNotificationsDesc: string;
    enabled: string;
    enabledHelp: string;
    categoryLabel: (category: NotificationCategory) => string;
    categoryHelp: (category: NotificationCategory) => string;
    mobileDeviceTitle: string;
    mobileDeviceDesc: string;
    deviceConnected: string;
    deviceMissing: string;
    deviceConnectedHelp: string;
    deviceMissingHelp: string;
    on: string;
    off: string;
    defaultRemindersTitle: string;
    defaultRemindersDesc: string;
    calendarRule: string;
    taskRule: string;
    atStart: string;
  };
}) {
  const categories = ["calendar", "task", "manual", "organization"] as NotificationCategory[];

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Section title={labels.mobileNotificationsTitle} description={labels.mobileNotificationsDesc}>
        <div className="divide-y divide-border border-y border-border dark:divide-border dark:border-border">
          <NotificationSwitchRow
            icon={Bell}
            label={labels.enabled}
            note={labels.enabledHelp}
            enabled={notificationPreference.enabled}
            pending={isPending}
            onToggle={onToggleEnabled}
          />
          {categories.map((category) => (
            <NotificationSwitchRow
              key={category}
              icon={category === "calendar" ? Clock : Bell}
              label={labels.categoryLabel(category)}
              note={labels.categoryHelp(category)}
              enabled={notificationPreference.categories[category]}
              pending={isPending}
              onToggle={() => onToggleCategory(category)}
            />
          ))}
        </div>
      </Section>

      <div className="space-y-8 border-t border-border pt-8 dark:border-border xl:border-t-0 xl:border-s xl:pt-0 xl:ps-8">
        <Section title={labels.mobileDeviceTitle} description={labels.mobileDeviceDesc}>
          <div className="border-y border-border py-5 dark:border-border">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted dark:bg-muted">
                  <Smartphone className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground dark:text-foreground">
                    {hasActiveDevice ? labels.deviceConnected : labels.deviceMissing}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                    {hasActiveDevice ? labels.deviceConnectedHelp : labels.deviceMissingHelp}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest",
                  hasActiveDevice
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",
                )}
              >
                {hasActiveDevice ? labels.on : labels.off}
              </span>
            </div>
          </div>
        </Section>

        <Section title={labels.defaultRemindersTitle} description={labels.defaultRemindersDesc}>
          <div className="flex flex-wrap gap-2 border-y border-border py-5 dark:border-border">
            {notificationPreference.reminderRules.map((rule) => (
              <span
                key={rule.id}
                className={cn(
                  "rounded-full border px-3 py-1 text-[10px] font-bold",
                  rule.enabled
                    ? "border-border text-secondary-foreground dark:border-border dark:text-muted-foreground"
                    : "border-border text-muted-foreground line-through dark:border-border dark:text-muted-foreground",
                )}
              >
                {rule.sourceType === "calendarEvent" ? labels.calendarRule : labels.taskRule} ·{" "}
                {rule.trigger === "at_start" ? labels.atStart : `${rule.offsetMinutes}m`}
              </span>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

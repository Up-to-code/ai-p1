"use client";

import { useTranslations } from "next-intl";
import { Database, HardDrive, RefreshCw, Shield, Trash2, Zap, Settings2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const appSettingsNav = [
  { name: "storage", label: "Storage", icon: HardDrive, href: "#storage" },
  { name: "data", label: "Data", icon: Database, href: "#data" },
  { name: "appearance", label: "Appearance", icon: Palette, href: "#appearance" },
  { name: "quickActions", label: "Quick Actions", icon: Zap, href: "#quick-actions" },
];

function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function SettingRow({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("AppSettings");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t("title", { defaultValue: "App Settings" })}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("description", { defaultValue: "Manage local storage, appearance, and advanced app settings" })}
            </p>
          </div>

          {/* Quick nav */}
          <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-none mt-4">
            {appSettingsNav.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {/* Storage Section */}
        <SettingsSection
          id="storage"
          icon={HardDrive}
          title={t("storage.title", { defaultValue: "Local Storage" })}
          description={t("storage.description", { defaultValue: "Manage local storage and offline data" })}
        >
          <div className="space-y-0">
            <SettingRow
              title={t("storage.usedSpace", { defaultValue: "Used Space" })}
              description={t("storage.usedSpaceDesc", { defaultValue: "24.5 MB of 50 MB used" })}
              action={
                <div className="text-sm font-semibold text-foreground">49%</div>
              }
            />
            <SettingRow
              title={t("storage.clearIndexedDB", { defaultValue: "Clear IndexedDB" })}
              description={t("storage.clearIndexedDBDesc", { defaultValue: "Remove all offline data and drafts" })}
              action={
                <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("storage.clear", { defaultValue: "Clear" })}
                </Button>
              }
            />
            <SettingRow
              title={t("storage.clearLocalStorage", { defaultValue: "Clear Local Storage" })}
              description={t("storage.clearLocalStorageDesc", { defaultValue: "Remove preferences and cached settings" })}
              action={
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  {t("storage.clear", { defaultValue: "Clear" })}
                </Button>
              }
            />
          </div>
        </SettingsSection>

        {/* Data Section */}
        <SettingsSection
          id="data"
          icon={Database}
          title={t("data.title", { defaultValue: "Data Management" })}
          description={t("data.description", { defaultValue: "Manage your app data and sync settings" })}
        >
          <div className="space-y-0">
            <SettingRow
              title={t("data.syncStatus", { defaultValue: "Sync Status" })}
              description={t("data.syncStatusDesc", { defaultValue: "Last synced 2 minutes ago" })}
              action={
                <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("data.syncNow", { defaultValue: "Sync Now" })}
                </Button>
              }
            />
            <SettingRow
              title={t("data.clearCache", { defaultValue: "Clear Cache" })}
              description={t("data.clearCacheDesc", { defaultValue: "Clear cached data to free up memory" })}
              action={
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  {t("data.clear", { defaultValue: "Clear" })}
                </Button>
              }
            />
            <SettingRow
              title={t("data.exportData", { defaultValue: "Export Data" })}
              description={t("data.exportDataDesc", { defaultValue: "Download all your app data" })}
              action={
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  {t("data.export", { defaultValue: "Export" })}
                </Button>
              }
            />
          </div>
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection
          id="appearance"
          icon={Palette}
          title={t("appearance.title", { defaultValue: "Appearance" })}
          description={t("appearance.description", { defaultValue: "Customize app appearance and theme settings" })}
        >
          <div className="space-y-0">
            <SettingRow
              title={t("appearance.theme", { defaultValue: "Theme" })}
              description={t("appearance.themeDesc", { defaultValue: "Choose your preferred theme" })}
              action={
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  {t("appearance.system", { defaultValue: "System" })}
                </Button>
              }
            />
            <SettingRow
              title={t("appearance.fontSize", { defaultValue: "Font Size" })}
              description={t("appearance.fontSizeDesc", { defaultValue: "Adjust text size" })}
              action={
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  {t("appearance.medium", { defaultValue: "Medium" })}
                </Button>
              }
            />
          </div>
        </SettingsSection>

        {/* Quick Actions Section */}
        <SettingsSection
          id="quick-actions"
          icon={Zap}
          title={t("quickActions.title", { defaultValue: "Quick Actions" })}
          description={t("quickActions.description", { defaultValue: "Common app management actions" })}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 rounded-xl text-left"
            >
              <Shield className="h-5 w-5 text-foreground" />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {t("quickActions.resetSecurity", { defaultValue: "Reset Security" })}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t("quickActions.resetSecurityDesc", { defaultValue: "Clear all security sessions" })}
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 rounded-xl text-left"
            >
              <RefreshCw className="h-5 w-5 text-foreground" />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {t("quickActions.refreshCache", { defaultValue: "Refresh Cache" })}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t("quickActions.refreshCacheDesc", { defaultValue: "Force refresh all cached data" })}
                </div>
              </div>
            </Button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

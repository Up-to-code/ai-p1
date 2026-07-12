import { redirect } from "next/navigation";
import { WorkspaceSettingsScreen, isSettingsSection } from "@/domains/settings";

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  if (!isSettingsSection(section)) redirect(`/${locale}/settings/mcp`);

  return <WorkspaceSettingsScreen section={section} />;
}

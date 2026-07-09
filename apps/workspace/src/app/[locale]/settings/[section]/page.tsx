import { notFound } from "next/navigation";
import { WorkspaceSettingsScreen, isSettingsSection } from "@/domains/settings";

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isSettingsSection(section)) notFound();

  return <WorkspaceSettingsScreen section={section} />;
}

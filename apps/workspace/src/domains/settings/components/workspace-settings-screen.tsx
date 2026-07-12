import { PersonalMcpScreen } from "@/domains/mcp";
import type { SettingsSectionId } from "../config/settings-navigation";

export function WorkspaceSettingsScreen({ section }: { section: SettingsSectionId }) {
  if (section !== "mcp") return null;
  return <PersonalMcpScreen />;
}

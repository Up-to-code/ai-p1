export const SETTINGS_SECTIONS = ["mcp"] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number];

export function isSettingsSection(value: string): value is SettingsSectionId {
  return SETTINGS_SECTIONS.includes(value as SettingsSectionId);
}

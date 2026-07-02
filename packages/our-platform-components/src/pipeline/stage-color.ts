const STAGE_BADGE_BG: Record<string, string> = {
  "#6b7280": "#f3f4f6",
  "#3b82f6": "#dbeafe",
  "#f59e0b": "#fef3c7",
  "#22c55e": "#dcfce7",
  "#ef4444": "#fee2e2",
  "#a855f7": "#f3e8ff",
  "#ec4899": "#fce7f3",
  "#06b6d4": "#cffafe",
  "#0ea5e9": "#e0f2fe",
};

export function badgeBgFor(color: string, dark: boolean): string {
  if (dark) {
    return `${color}26`;
  }
  return STAGE_BADGE_BG[color.toLowerCase()] ?? `${color}1a`;
}

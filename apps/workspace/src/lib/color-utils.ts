import { logger } from "@/lib/logger";

export const NOTION_COLORS = {
  gray: {
    bg: "bg-neutral-100 dark:bg-neutral-800/60",
    text: "text-neutral-800 dark:text-neutral-300",
    border: "border-neutral-200 dark:border-neutral-700/50",
    hover: "hover:bg-neutral-200 dark:hover:bg-neutral-700/80",
    dot: "bg-neutral-400 dark:bg-neutral-500",
    label: "Gray",
  },
  brown: {
    bg: "bg-amber-100/60 dark:bg-amber-950/30",
    text: "text-amber-800/90 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-900/30",
    hover: "hover:bg-amber-200/85 dark:hover:bg-amber-900/50",
    dot: "bg-amber-600 dark:bg-amber-500",
    label: "Brown",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-950/30",
    text: "text-orange-800 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-900/30",
    hover: "hover:bg-orange-200 dark:hover:bg-orange-900/50",
    dot: "bg-orange-500",
    label: "Orange",
  },
  yellow: {
    bg: "bg-yellow-100/80 dark:bg-yellow-950/30",
    text: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-900/30",
    hover: "hover:bg-yellow-200/90 dark:hover:bg-yellow-900/50",
    dot: "bg-yellow-500 dark:bg-yellow-450",
    label: "Yellow",
  },
  green: {
    bg: "bg-emerald-100 dark:bg-emerald-950/30",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-900/30",
    hover: "hover:bg-emerald-200 dark:hover:bg-emerald-900/50",
    dot: "bg-emerald-500 dark:bg-emerald-450",
    label: "Green",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-900/30",
    hover: "hover:bg-blue-200 dark:hover:bg-blue-900/50",
    dot: "bg-blue-500 dark:bg-blue-450",
    label: "Blue",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950/30",
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-900/30",
    hover: "hover:bg-purple-200 dark:hover:bg-purple-900/50",
    dot: "bg-purple-500 dark:bg-purple-450",
    label: "Purple",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-950/30",
    text: "text-pink-800 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-900/30",
    hover: "hover:bg-pink-200 dark:hover:bg-pink-900/50",
    dot: "bg-pink-500 dark:bg-pink-450",
    label: "Pink",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-950/30",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-200 dark:border-red-900/30",
    hover: "hover:bg-red-200 dark:hover:bg-red-900/50",
    dot: "bg-red-500 dark:bg-red-450",
    label: "Red",
  },
} as const;

export type NotionColorKey = keyof typeof NOTION_COLORS;

export const hashStringToColor = (str: string): NotionColorKey => {
  const colors: NotionColorKey[] = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const getStoredColor = (type: string, key: string, fallback: NotionColorKey): NotionColorKey => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(`qentrah_colors_${type}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[key] && NOTION_COLORS[parsed[key] as NotionColorKey]) {
        return parsed[key] as NotionColorKey;
      }
    }
  } catch (e) {
    logger.error("color.read_failed", { storageKey: `qentrah_colors_${type}`, error: e });
  }
  return fallback;
};

export const setStoredColor = (type: string, key: string, color: NotionColorKey) => {
  if (typeof window === "undefined") return;
  try {
    const storageKey = `qentrah_colors_${type}`;
    const stored = localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : {};
    parsed[key] = color;
    localStorage.setItem(storageKey, JSON.stringify(parsed));
  } catch (e) {
    logger.error("color.write_failed", { storageKey: `qentrah_colors_${type}`, error: e });
  }
};

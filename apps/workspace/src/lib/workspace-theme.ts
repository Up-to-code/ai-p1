import {
  AlertTriangle,
  Loader2,
  Send,
  XCircle,
  CheckCircle2,
  Search,
  Timer,
  type LucideIcon,
} from "lucide-react";
import type { StageDefinition } from "@qentrah/our-platform-components/pipeline";

export interface StatusTheme {
  key: string;
  label: string;
  shortLabel?: string;
  color: string;
  bg: string;
  bgDark: string;
  icon: LucideIcon;
  description?: string;
}

export const STATUS_THEME: Record<string, StatusTheme> = {
  pending: {
    key: "pending",
    label: "Pending",
    color: "#f59e0b",
    bg: "#fef3c7",
    bgDark: "#f59e0b26",
    icon: AlertTriangle,
    description: "Waiting to be started",
  },
  progress: {
    key: "progress",
    label: "Progress",
    color: "#3b82f6",
    bg: "#dbeafe",
    bgDark: "#3b82f626",
    icon: Loader2,
    description: "Currently being worked on",
  },
  submitted: {
    key: "submitted",
    label: "Submitted",
    color: "#a855f7",
    bg: "#f3e8ff",
    bgDark: "#a855f726",
    icon: Send,
    description: "Submitted for review",
  },
  failed: {
    key: "failed",
    label: "Failed",
    color: "#ef4444",
    bg: "#fee2e2",
    bgDark: "#ef444426",
    icon: XCircle,
    description: "Did not pass",
  },
  success: {
    key: "success",
    label: "Success",
    color: "#22c55e",
    bg: "#dcfce7",
    bgDark: "#22c55e26",
    icon: CheckCircle2,
    description: "Completed successfully",
  },
  inReview: {
    key: "inReview",
    label: "In Review",
    color: "#f59e0b",
    bg: "#fef3c7",
    bgDark: "#f59e0b26",
    icon: Search,
    description: "Under review",
  },
  expire: {
    key: "expire",
    label: "Expire",
    color: "#6b7280",
    bg: "#f3f4f6",
    bgDark: "#6b728026",
    icon: Timer,
    description: "Past due or expired",
  },
};

export const STATUS_THEME_LIST: StatusTheme[] = Object.values(STATUS_THEME);

export const STATUS_BY_COLOR: Record<string, StatusTheme> = Object.fromEntries(
  STATUS_THEME_LIST.map((s) => [s.color.toLowerCase(), s]),
);

export const STATUS_BADGE_BG: Record<string, string> = Object.fromEntries(
  STATUS_THEME_LIST.map((s) => [s.color.toLowerCase(), s.bg]),
);

export function getStatusByColor(color: string): StatusTheme | undefined {
  return STATUS_BY_COLOR[color.toLowerCase()];
}

export function getStatusByKey(key: string): StatusTheme | undefined {
  return STATUS_THEME[key];
}

export function statusBadgeBgFor(color: string, dark = false): string {
  const status = getStatusByColor(color);
  if (status) return dark ? status.bgDark : status.bg;
  return dark ? `${color}26` : `${color}1a`;
}

export const DEFAULT_BOARD_STAGES: StageDefinition[] = [
  { key: "todo", name: STATUS_THEME.expire.label, color: STATUS_THEME.expire.color },
  { key: "inProgress", name: STATUS_THEME.progress.label, color: STATUS_THEME.progress.color },
  { key: "waiting", name: STATUS_THEME.pending.label, color: STATUS_THEME.pending.color },
  { key: "done", name: STATUS_THEME.success.label, color: STATUS_THEME.success.color },
];

export const STAGE_COLOR_PALETTE: string[] = STATUS_THEME_LIST.map((s) => s.color);

export const STATUS_STORAGE_KEY = "workspace-task-stages";

/* ── Master key list (must match TaskStatus in domain-contracts) ───── */

export const ALL_VALID_STATUS_KEYS: string[] = [
  "todo", "inProgress", "waiting", "done", "canceled",
  ...STATUS_THEME_LIST.map((s) => s.key),
];

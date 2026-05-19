import {
  AlertOctagon,
  Ban,
  CloudOff,
  Construction,
  FileQuestion,
  Wrench,
} from "lucide-react-native";

export type ErrorStateKind = "scratch" | "crash" | "not-found" | "offline" | "maintenance";

export type ErrorStateDefinition = {
  kind: ErrorStateKind;
  route: `/(app)/errors/${ErrorStateKind}`;
  menuLabel: string;
  eyebrow: string;
  code: string;
  title: string;
  body: string;
  signal: string;
  technicalNote: string;
  Icon: any;
};

export const errorStates: ErrorStateDefinition[] = [
  {
    kind: "scratch",
    route: "/(app)/errors/scratch",
    menuLabel: "Scratch interrupted",
    eyebrow: "Draft workspace",
    code: "SCR",
    title: "This scratch space broke mid-thought.",
    body: "Your current exploration did not settle cleanly. Keep the session, then reopen the latest stable thread.",
    signal: "Draft notes are isolated from saved property decisions.",
    technicalNote: "Use this when a temporary canvas, draft, or experimental flow fails.",
    Icon: Wrench,
  },
  {
    kind: "crash",
    route: "/(app)/errors/crash",
    menuLabel: "App crash",
    eyebrow: "Runtime failure",
    code: "500",
    title: "The app hit an unexpected fault.",
    body: "The session paused before it could finish the request. Nothing has been intentionally changed.",
    signal: "We can restart the workspace and keep your saved research intact.",
    technicalNote: "Use this for uncaught exceptions, native crashes, and unrecoverable runtime faults.",
    Icon: AlertOctagon,
  },
  {
    kind: "not-found",
    route: "/(app)/errors/not-found",
    menuLabel: "Error 404",
    eyebrow: "Missing route",
    code: "404",
    title: "This page is not in the portfolio.",
    body: "The link may be old, mistyped, or pointing to a property view that is no longer available.",
    signal: "Search and saved properties are still available from home.",
    technicalNote: "Use this for unknown routes, deleted records, and stale deep links.",
    Icon: FileQuestion,
  },
  {
    kind: "offline",
    route: "/(app)/errors/offline",
    menuLabel: "Connection lost",
    eyebrow: "Network unavailable",
    code: "NET",
    title: "ZaneAI cannot reach the market feed.",
    body: "Your device appears offline or the backend is unreachable. Cached research remains visible.",
    signal: "Saved properties can stay on screen while sync waits in the background.",
    technicalNote: "Use this for network timeouts, Convex disconnects, and airplane-mode moments.",
    Icon: CloudOff,
  },
  {
    kind: "maintenance",
    route: "/(app)/errors/maintenance",
    menuLabel: "Maintenance",
    eyebrow: "Service window",
    code: "503",
    title: "The intelligence layer is being tuned.",
    body: "Live recommendations are temporarily paused while the workspace is updated.",
    signal: "Core navigation can remain available until the service returns.",
    technicalNote: "Use this for planned downtime, model routing pauses, and backend maintenance.",
    Icon: Construction,
  },
];

export const fallbackErrorState: ErrorStateDefinition = {
  kind: "not-found",
  route: "/(app)/errors/not-found",
  menuLabel: "Unavailable",
  eyebrow: "Unavailable",
  code: "ERR",
  title: "This screen is unavailable.",
  body: "The requested state is not configured yet.",
  signal: "Return home and continue from the last stable workspace.",
  technicalNote: "Fallback state for unknown error-state previews.",
  Icon: Ban,
};

export function getErrorState(kind: string | string[] | undefined) {
  const normalized = Array.isArray(kind) ? kind[0] : kind;
  return errorStates.find((state) => state.kind === normalized) ?? fallbackErrorState;
}

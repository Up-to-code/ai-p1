import type { PartnerAppStatus, PartnerAppSummary } from "@/server/partnerApps";

export const lifecycleStatuses: PartnerAppStatus[] = ["draft", "pending_review", "active", "rejected", "suspended"];

export function lifecycleCounts(apps: PartnerAppSummary[]) {
  return lifecycleStatuses.map((status) => ({
    status,
    count: apps.filter((app) => app.status === status).length,
  }));
}

export function statusCopy(status: PartnerAppStatus) {
  if (status === "draft") {
    return {
      label: "Draft",
      description: "Configuration is still editable.",
      empty: "No draft apps waiting for setup.",
    };
  }
  if (status === "pending_review") {
    return {
      label: "Pending review",
      description: "Submitted apps waiting on admin review.",
      empty: "No apps are waiting for review.",
    };
  }
  if (status === "active") {
    return {
      label: "Active",
      description: "Approved for workspace authorization.",
      empty: "No approved apps are live yet.",
    };
  }
  if (status === "rejected") {
    return {
      label: "Rejected",
      description: "Changes are required before resubmission.",
      empty: "No apps need review changes.",
    };
  }
  return {
    label: "Suspended",
    description: "Authorization is blocked until admin action.",
    empty: "No apps are suspended.",
  };
}

export function syncLabel(app: PartnerAppSummary) {
  if (app.workspaceSyncStatus === "synced") return "Runtime synced";
  if (app.workspaceSyncStatus === "failed") return "Runtime failed";
  if (app.workspaceSyncStatus === "pending") return "Runtime pending";
  return "Runtime not synced";
}

export function syncTone(app: PartnerAppSummary) {
  if (app.workspaceSyncStatus === "synced") return "text-emerald-700 dark:text-emerald-300";
  if (app.workspaceSyncStatus === "failed") return "text-rose-700 dark:text-rose-300";
  if (app.workspaceSyncStatus === "pending") return "text-amber-700 dark:text-amber-300";
  return "text-muted-foreground";
}

export function nextStepFor(app: PartnerAppSummary) {
  if (app.status === "draft") return "Finish redirect URIs and submit for review.";
  if (app.workspaceSyncStatus === "failed") return "Runtime sync failed. Admin approval will retry it.";
  if (app.status === "pending_review") return "Waiting for admin review.";
  if (app.status === "active") return "Ready for Workspace authorization.";
  if (app.status === "rejected") return "Apply review notes, then resubmit.";
  if (app.status === "suspended") return "Authorization is blocked.";
  return "Lifecycle state is updating.";
}

export function clientTypeLabel(app: PartnerAppSummary) {
  return app.clientType === "public" ? "Public PKCE" : "Confidential";
}

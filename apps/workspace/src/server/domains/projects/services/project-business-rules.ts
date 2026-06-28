export const projectBusinessRules = {
  canTransitionToStatus(currentStatus: string, targetStatus: string): boolean {
    const statusOrder = ["planned", "active", "paused", "completed", "archived"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const targetIndex = statusOrder.indexOf(targetStatus);
    if (targetStatus === "paused" || currentStatus === "paused") return true;
    return targetIndex >= currentIndex;
  },

  getDefaultHealth(status: string): "onTrack" | "atRisk" | "blocked" {
    if (status === "paused") return "atRisk";
    if (status === "completed") return "onTrack";
    return "onTrack";
  },

  canLinkToClient(clientId: string | undefined): boolean {
    return clientId !== undefined && clientId.length > 0;
  },
} as const;

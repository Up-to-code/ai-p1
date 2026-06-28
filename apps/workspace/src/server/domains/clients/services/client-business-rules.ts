export const clientBusinessRules = {
  canTransitionToStage(currentStage: string, targetStage: string): boolean {
    const stageOrder = ["new", "qualified", "review", "negotiation", "closed"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const targetIndex = stageOrder.indexOf(targetStage);
    return targetIndex >= currentIndex;
  },

  getDefaultVisibility(type: "person" | "organization"): "private" | "team" | "workspace" {
    return type === "organization" ? "team" : "private";
  },
} as const;

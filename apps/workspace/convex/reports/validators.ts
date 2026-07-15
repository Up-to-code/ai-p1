import { v } from "convex/values";

export const reportSourceValidator = v.union(
  v.literal("executive"), v.literal("sales"), v.literal("pipeline"), v.literal("delivery"),
  v.literal("resource_utilization"), v.literal("capacity"), v.literal("project_profitability"),
  v.literal("client_profitability"), v.literal("finance"), v.literal("tax"),
);
export const reportVisibilityValidator = v.union(v.literal("personal"), v.literal("shared"), v.literal("protected"));
export const reportScopeValidator = v.union(v.literal("organization"), v.literal("space"), v.literal("project"));
export const reportCadenceValidator = v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"));

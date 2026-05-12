export const apiEndpoints = {
  health: "/health",
} as const;

export type ApiEndpointKey = keyof typeof apiEndpoints;

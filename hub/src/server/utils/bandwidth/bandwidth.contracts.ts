export interface BandwidthSample {
  readonly requestId?: string;
  readonly inboundBytes?: number;
  readonly outboundBytes?: number;
}

export interface BandwidthBudget {
  readonly scope: "global" | "per-user" | "per-organization" | "per-team" | "per-route";
  readonly maxBytes: number;
}

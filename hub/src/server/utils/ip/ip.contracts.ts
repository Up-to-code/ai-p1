export type ClientIpSource = "unknown" | "direct" | "forwarded" | "real-ip" | "platform";

export interface ClientIpMetadata {
  readonly source: ClientIpSource;
  readonly value?: string;
  readonly trustedProxyEvaluated: boolean;
}

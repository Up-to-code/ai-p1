export interface CorsPolicyContract {
  readonly mode: "disabled" | "report-only" | "enforce";
  readonly credentialsAllowed: boolean;
}

export interface CorsPreflightPolicy {
  readonly maxAgeSeconds?: number;
  readonly allowedMethods: readonly string[];
}

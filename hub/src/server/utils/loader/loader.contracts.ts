export interface RequestBodyLimit {
  readonly maxBytes: number;
  readonly policyName: string;
}

export interface RequestLoaderPolicy {
  readonly mode: "metadata-only" | "streaming" | "buffered";
  readonly bodyLimit?: RequestBodyLimit;
}

export interface ErrorTrackingContext {
  readonly requestId?: string;
  readonly route?: string;
  readonly userScope?: "anonymous" | "authenticated";
}

export interface ErrorTrackingEvent {
  readonly code: string;
  readonly message: string;
  readonly context: ErrorTrackingContext;
}

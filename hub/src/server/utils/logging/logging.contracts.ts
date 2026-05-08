export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface RequestLogContext {
  readonly requestId?: string;
  readonly route?: string;
  readonly method?: string;
}

export interface RouteLogContext extends RequestLogContext {
  readonly routePattern?: string;
}

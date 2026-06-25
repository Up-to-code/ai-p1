"use client";

export class HttpTimeoutError extends Error {
  constructor(message = "Request timed out.") {
    super(message);
    this.name = "HttpTimeoutError";
  }
}

export class HttpRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpRequestError";
    this.status = status;
  }
}

export function isHttpTimeoutError(error: unknown) {
  return error instanceof HttpTimeoutError || (error instanceof Error && error.name === "HttpTimeoutError");
}

export function normalizeErrorMessage(error: unknown) {
  if (isHttpTimeoutError(error)) {
    return "The request took too long. Check the connection and try again.";
  }
  return error instanceof Error ? error.message : "Request failed.";
}

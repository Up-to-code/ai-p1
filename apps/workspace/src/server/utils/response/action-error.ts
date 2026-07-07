import type { Context } from "hono";
import { errorMessage, errorStatus, classifyError } from "./error-map";

export function actionErrorStatus(error: unknown) {
  return errorStatus(error);
}

export function actionErrorMessage(error: unknown, fallback: string) {
  return errorMessage(error, fallback);
}

export function actionErrorJson(c: Context, error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const status = errorStatus(error);
  console.error("[action-error]", {
    path: c.req.path,
    method: c.req.method,
    fallback,
    error: message,
    stack,
    status,
  });
  // In development, return the actual error message so the UI can show it
  const isDev = process.env.NODE_ENV !== "production";
  const classified = classifyError(error);
  const responseMessage =
    isDev && classified === "INTERNAL" ? `${fallback} (${message})` : errorMessage(error, fallback);
  return c.json(
    { error: responseMessage },
    status,
  );
}

import type { Context } from "hono";
import { classifyError, errorMessage, errorStatus } from "./error-map";

export function actionErrorStatus(error: unknown) {
  return errorStatus(error);
}

export function actionErrorMessage(error: unknown, fallback: string) {
  return errorMessage(error, fallback);
}

export function actionErrorJson(c: Context, error: unknown, fallback: string) {
  return c.json(
    { error: errorMessage(error, fallback) },
    errorStatus(error),
  );
}

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function actionErrorStatus(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/Unauthenticated/i.test(message)) return 401;
  if (/platform admin required/i.test(message)) return 403;
  if (/permission|not have access|forbidden/i.test(message)) return 403;
  if (/not found/i.test(message)) return 404;
  if (/rate.?limit/i.test(message)) return 429;
  if (/invalid|required|must be/i.test(message)) return 400;
  return 500;
}

export function actionErrorMessage(error: unknown, fallback: string) {
  const status = actionErrorStatus(error);
  if (status === 401) return "Sign in again to continue.";
  if (status === 403 && error instanceof Error && /platform admin required/i.test(error.message)) {
    return "Platform admin required.";
  }
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested workspace record was not found.";
  if (status === 429) return "Too many requests. Try again in a moment.";
  if (status === 400 && error instanceof Error) return error.message;
  return fallback;
}

export function actionErrorJson(c: Context, error: unknown, fallback: string) {
  return c.json(
    { error: actionErrorMessage(error, fallback) },
    actionErrorStatus(error) as ContentfulStatusCode,
  );
}

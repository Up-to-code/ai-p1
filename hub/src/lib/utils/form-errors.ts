import type { z } from "zod";

export type FormErrors<T extends object> = Partial<Record<keyof T, string>>;

export function normalizeErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

export function flattenZodErrors<T extends object>(error: z.ZodError): FormErrors<T> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors as FormErrors<T>;
}

export function getFirstErrorField<T extends object>(errors: FormErrors<T>) {
  return Object.keys(errors).find((key) => Boolean(errors[key as keyof T]));
}

export function focusFieldByName(name: string | undefined) {
  if (!name || typeof document === "undefined") return;

  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(`[name="${name}"], [data-field="${name}"]`)?.focus();
  });
}

export function focusFirstError<T extends object>(errors: FormErrors<T>) {
  focusFieldByName(getFirstErrorField(errors));
}

export function clearFieldError<T extends object>(errors: FormErrors<T>, key: keyof T): FormErrors<T> {
  if (!errors[key]) return errors;
  return { ...errors, [key]: undefined };
}

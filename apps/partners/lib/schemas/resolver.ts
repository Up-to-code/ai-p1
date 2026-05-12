import type { FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod/v4";

export function zodFormResolver<TSchema extends z.ZodType>(
  schema: TSchema,
): Resolver<z.input<TSchema> & FieldValues, unknown, z.output<TSchema> & FieldValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { values: result.data as z.output<TSchema> & FieldValues, errors: {} };
    }

    return {
      values: {},
      errors: result.error.issues.reduce<Record<string, { type: string; message: string }>>((errors, issue) => {
        const name = issue.path.join(".");
        if (name && !errors[name]) {
          errors[name] = { type: issue.code, message: issue.message };
        }
        return errors;
      }, {}),
    } as never;
  };
}

import { z } from "zod";
import {
  taskPatchObjectSchema,
  taskPatchSchema,
  type TaskPatch,
} from "@qentrah/domain-contracts";

export const taskUpdateToolInputSchema = taskPatchObjectSchema
  .extend({ taskId: z.string().min(1) })
  .strict()
  .refine((input) => Object.keys(input).some((key) => key !== "taskId"), {
    message: "At least one task field is required",
  });

export function parseTaskUpdatePatch(patch: unknown): TaskPatch {
  return taskPatchSchema.parse(patch);
}

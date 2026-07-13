import type { z } from "zod";
import {
  taskInputObjectSchema,
  taskPatchSchema,
  taskPrioritySchema,
  taskStatusSchema,
} from "@qentrah/domain-contracts";

export const clientTaskPayloadSchema = taskInputObjectSchema.extend({
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("normal"),
});
export const clientTaskUpdatePayloadSchema = taskPatchSchema;

export type ClientTaskPayload = z.infer<typeof clientTaskPayloadSchema>;

import type { z } from "zod";
import {
  clientInputSchema,
  clientPatchSchema,
  clientStatusSchema,
  clientTypeSchema,
} from "@qentrah/domain-contracts";

export const clientPayloadSchema = clientInputSchema.extend({
  type: clientTypeSchema.default("person"),
  status: clientStatusSchema.default("new"),
  source: clientInputSchema.shape.source.default("manual"),
});
export const clientUpdatePayloadSchema = clientPatchSchema;

export type ClientPayload = z.infer<typeof clientPayloadSchema>;

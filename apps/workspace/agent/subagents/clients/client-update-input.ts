import { z } from "zod";
import {
  clientPatchObjectSchema,
  clientPatchSchema,
  type ClientPatch,
} from "@qentrah/domain-contracts";

export const clientUpdateToolInputSchema = clientPatchObjectSchema
  .extend({ clientId: z.string().min(1) })
  .strict()
  .refine((input) => Object.keys(input).some((key) => key !== "clientId"), {
    message: "At least one client field is required",
  });

export function parseClientUpdatePatch(patch: unknown): ClientPatch {
  return clientPatchSchema.parse(patch);
}

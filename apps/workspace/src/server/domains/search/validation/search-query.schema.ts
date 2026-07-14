import { searchResourceTypeSchema } from "@qentrah/domain-contracts";
import { z } from "zod";

export const searchGatewayQuerySchema = z.object({
  search: z.string().trim().min(1).max(160),
  resourceTypes: z.string().optional().transform((value, context) => {
    if (!value) return undefined;
    const parsed = z.array(searchResourceTypeSchema).safeParse(value.split(",").filter(Boolean));
    if (!parsed.success) {
      context.addIssue({ code: "custom", message: "resourceTypes contains an unsupported resource type." });
      return z.NEVER;
    }
    return [...new Set(parsed.data)];
  }),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export type SearchGatewayQuery = z.infer<typeof searchGatewayQuerySchema>;

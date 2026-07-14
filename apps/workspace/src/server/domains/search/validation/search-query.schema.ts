import { searchResourceTypeSchema, searchScopeTypeSchema, searchSensitivitySchema } from "@qentrah/domain-contracts";
import { z } from "zod";

const csvStrings = z.string().optional().transform((value) => value
  ? [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 50)
  : undefined);

function csvEnum<T extends z.ZodType<string>>(schema: T, label: string) {
  return z.string().optional().transform((value, context) => {
    if (!value) return undefined;
    const parsed = z.array(schema).safeParse(value.split(",").map((item) => item.trim()).filter(Boolean));
    if (!parsed.success) {
      context.addIssue({ code: "custom", message: `${label} contains an unsupported value.` });
      return z.NEVER;
    }
    return [...new Set(parsed.data)];
  });
}

export const searchGatewayQuerySchema = z.object({
  search: z.string().trim().min(1).max(160),
  resourceTypes: csvEnum(searchResourceTypeSchema, "resourceTypes"),
  scopeTypes: csvEnum(searchScopeTypeSchema, "scopeTypes"),
  sensitivity: csvEnum(searchSensitivitySchema, "sensitivity"),
  locales: csvStrings,
  spaceIds: csvStrings,
  projectIds: csvStrings,
  ownerIds: csvStrings,
  assigneeIds: csvStrings,
  clientIds: csvStrings,
  statuses: csvStrings,
  tagIds: csvStrings,
  dateFrom: z.coerce.number().int().nonnegative().optional(),
  dateTo: z.coerce.number().int().nonnegative().optional(),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
  limit: z.coerce.number().int().min(1).max(20).default(10),
}).refine((value) => value.dateFrom === undefined || value.dateTo === undefined || value.dateFrom <= value.dateTo, {
  message: "dateFrom must be before dateTo.",
  path: ["dateFrom"],
});

type ParsedSearchGatewayQuery = z.output<typeof searchGatewayQuerySchema>;
export type SearchGatewayQuery = Pick<ParsedSearchGatewayQuery, "search" | "limit"> &
  Partial<Omit<ParsedSearchGatewayQuery, "search" | "limit">>;

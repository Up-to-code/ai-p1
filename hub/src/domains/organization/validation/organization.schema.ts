import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const teamMemberSchema = z.object({
  name: requiredText("Name"),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["Owner", "Admin", "Manager", "Editor", "Viewer"]),
});

export const apiKeySchema = z.object({
  name: requiredText("Key name"),
  scopes: z.array(z.enum(["Read", "Write", "Sync"])).min(1, "Select at least one scope."),
});

export type TeamMemberFormValues = z.input<typeof teamMemberSchema>;
export type ApiKeyFormValues = z.input<typeof apiKeySchema>;

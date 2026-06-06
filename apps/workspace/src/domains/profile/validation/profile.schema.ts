import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const profileSchema = z.object({
  name: requiredText("Name"),
  phone: z.string().trim().optional(),
  role: requiredText("Role"),
  language: z.enum(["en", "ar"]),
  timezone: requiredText("Timezone"),
});

export type ProfileFormValues = z.input<typeof profileSchema>;

import { z } from "zod";

export const requiredText = (label: string, min = 2) => z.string().trim().min(min, label + " is required.");
export const optionalText = z.string().trim().optional();

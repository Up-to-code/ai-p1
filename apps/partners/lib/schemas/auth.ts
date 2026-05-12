import { z } from "zod/v4";

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Your name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(12, "Password must be at least 12 characters."),
  confirmPassword: z.string(),
  organizationName: z.string().trim().min(2, "Programmer organization name must be at least 2 characters."),
  countryCode: z.string().trim().min(2).default("SA"),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

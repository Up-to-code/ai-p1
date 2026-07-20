import { z } from "zod";

export const mediaResourceTypeSchema = z.enum(["project", "client", "calendarEvent", "task"]);
export const mediaKindSchema = z.enum(["image", "video", "document"]);
export const mediaShareVisibilitySchema = z.enum(["private", "public", "team", "owner", "member"]);

export type MediaResourceType = z.infer<typeof mediaResourceTypeSchema>;
export type MediaKind = z.infer<typeof mediaKindSchema>;
export type MediaShareVisibility = z.infer<typeof mediaShareVisibilitySchema>;

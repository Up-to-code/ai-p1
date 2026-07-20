import { defineTool } from "eve/tools";
import { z } from "zod";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "../../../lib/convex";
import { requireWorkspaceActor } from "../../../lib/workspace-actor";
import { mediaResourceTypeSchema, mediaKindSchema } from "@qentrah/domain-contracts";

function extensionName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").filter(Boolean).at(-1);
    return name ? decodeURIComponent(name) : "External document";
  } catch {
    return "External document";
  }
}

function mediaKind(input: { kind?: z.infer<typeof mediaKindSchema>; mimeType?: string }) {
  if (input.kind) return input.kind;
  if (input.mimeType?.startsWith("image/")) return "image";
  if (input.mimeType?.startsWith("video/")) return "video";
  return "document";
}

export default defineTool({
  description: "Attach an external URL as media to a resource.",
  inputSchema: z.object({
    resourceType: mediaResourceTypeSchema,
    resourceId: z.string().min(1),
    url: z.string().url(),
    name: z.string().min(1).optional(),
    mimeType: z.string().optional(),
    size: z.number().optional(),
    kind: mediaKindSchema.optional(),
    isCover: z.boolean().optional(),
  }).passthrough(),
  async execute(args, ctx) {
    const { organizationId } = requireWorkspaceActor(ctx);
    return fetchAuthMutation(ctx, api.media.write.attachFromHono, {
      organizationId,
      input: {
        key: `external:${args.url}`,
        url: args.url,
        name: args.name ?? extensionName(args.url),
        mimeType: args.mimeType ?? "application/octet-stream",
        size: args.size ?? 0,
        kind: mediaKind(args),
        resourceType: args.resourceType,
        resourceId: args.resourceId,
        isCover: args.isCover,
      },
    });
  },
});

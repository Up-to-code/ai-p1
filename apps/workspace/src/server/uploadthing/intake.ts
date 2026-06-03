import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { resolveConvexAuthToken } from "@/server/auth/convex-workos/token";
import { assertCanUseOrganizationResource } from "@/server/utils/organization/access-checker";

export const organizationUploadInputSchema = z.object({
  organizationId: z.string().min(1),
});

type OrganizationUploadInput = z.infer<typeof organizationUploadInputSchema>;
type UploadFile = {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export const imageUploadPolicy = {
  image: {
    maxFileCount: 1,
    maxFileSize: "4MB",
    contentDisposition: "inline",
  },
} as const;

export const mediaUploadPolicy = {
  image: {
    maxFileCount: 10,
    maxFileSize: "8MB",
    contentDisposition: "inline",
  },
  video: {
    maxFileCount: 4,
    maxFileSize: "128MB",
    contentDisposition: "inline",
  },
  pdf: {
    maxFileCount: 10,
    maxFileSize: "32MB",
    contentDisposition: "inline",
  },
} as const;

export const agentMessageAttachmentUploadPolicy = {
  ...mediaUploadPolicy,
  text: {
    maxFileCount: 10,
    maxFileSize: "16MB",
    contentDisposition: "inline",
  },
  "application/msword": {
    maxFileCount: 10,
    maxFileSize: "16MB",
    contentDisposition: "inline",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    maxFileCount: 10,
    maxFileSize: "16MB",
    contentDisposition: "inline",
  },
} as const;

export async function requireSignedInUploadUser(req: Request) {
  const token = await resolveConvexAuthToken(new Headers(req.headers));

  if (!token) {
    throw new UploadThingError("You must be signed in to upload a profile picture.");
  }

  return {};
}

export async function requireOrganizationMediaUploadAccess(
  req: Request,
  input: OrganizationUploadInput,
  resource: "project" | "property" | "client",
) {
  await requireSignedInUploadUser(req);

  try {
    await assertCanUseOrganizationResource(input.organizationId, resource, "update");
  } catch (error) {
    const message = error instanceof Error ? error.message : "You are not allowed to upload media here.";
    throw new UploadThingError(message);
  }

  return {
    organizationId: input.organizationId,
    resource,
  };
}

export async function requireAgentMessageAttachmentUploadAccess(
  req: Request,
  input: OrganizationUploadInput,
) {
  await requireSignedInUploadUser(req);

  try {
    await assertCanUseOrganizationResource(input.organizationId, "organization", "read");
  } catch (error) {
    const message = error instanceof Error ? error.message : "You are not allowed to upload files to this agent thread.";
    throw new UploadThingError(message);
  }

  return {
    organizationId: input.organizationId,
    resource: "agentMessage",
  };
}

export function uploadedImage(file: UploadFile) {
  return {
    key: file.key,
    name: file.name,
    size: file.size,
    url: file.url,
  };
}

export function uploadedResourceMedia(
  file: UploadFile,
  metadata: { organizationId: string; resource: string },
) {
  return {
    key: file.key,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    url: file.url,
    organizationId: metadata.organizationId,
    resource: metadata.resource,
  };
}

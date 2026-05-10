import { getToken } from "@convex-dev/better-auth/utils";
import { createRouteHandler, createUploadthing, type FileRouter, UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { convexRuntimeConfig } from "@/packages/config";
import { assertCanUseOrganizationResource } from "@/server/utils/organization/access-checker";

const f = createUploadthing();
const organizationUploadInputSchema = z.object({
  organizationId: z.string().min(1),
});

async function requireSignedInUser(req: Request) {
  const token = await getToken(convexRuntimeConfig.siteUrl, new Headers(req.headers));

  if (!token.token) {
    throw new UploadThingError("You must be signed in to upload a profile picture.");
  }

  return {};
}

async function requireOrganizationMediaAccess(
  req: Request,
  input: z.infer<typeof organizationUploadInputSchema>,
  resource: "project" | "property",
) {
  await requireSignedInUser(req);

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

export const uploadRouter = {
  profilePicture: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
      contentDisposition: "inline",
    },
  })
    .middleware(({ req }) => requireSignedInUser(req))
    .onUploadComplete(({ file }) => ({
      key: file.key,
      name: file.name,
      size: file.size,
      url: file.ufsUrl ?? file.url,
    })),
  organizationLogo: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
      contentDisposition: "inline",
    },
  })
    .middleware(({ req }) => requireSignedInUser(req))
    .onUploadComplete(({ file }) => ({
      key: file.key,
      name: file.name,
      size: file.size,
      url: file.ufsUrl ?? file.url,
    })),
  projectMedia: f({
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
  })
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireOrganizationMediaAccess(req, input, "project"))
    .onUploadComplete(({ file, metadata }) => ({
      key: file.key,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      url: file.ufsUrl ?? file.url,
      organizationId: metadata.organizationId,
      resource: metadata.resource,
    })),
  propertyMedia: f({
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
  })
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireOrganizationMediaAccess(req, input, "property"))
    .onUploadComplete(({ file, metadata }) => ({
      key: file.key,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      url: file.ufsUrl ?? file.url,
      organizationId: metadata.organizationId,
      resource: metadata.resource,
    })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

export const uploadThingHandler = createRouteHandler({
  router: uploadRouter,
});

import { createRouteHandler, createUploadthing, type FileRouter } from "uploadthing/server";
import { hydrateUploadThingEnvFromToken } from "./config";
import {
  agentMessageAttachmentUploadPolicy,
  imageUploadPolicy,
  mediaUploadPolicy,
  organizationUploadInputSchema,
  requireAgentMessageAttachmentUploadAccess,
  requireOrganizationMediaUploadAccess,
  requireSignedInUploadUser,
  uploadedImage,
  uploadedResourceMedia,
} from "./intake";

hydrateUploadThingEnvFromToken();

const f = createUploadthing();

export const uploadRouter = {
  profilePicture: f(imageUploadPolicy)
    .middleware(({ req }) => requireSignedInUploadUser(req))
    .onUploadComplete(({ file }) => uploadedImage(file)),
  organizationLogo: f(imageUploadPolicy)
    .middleware(({ req }) => requireSignedInUploadUser(req))
    .onUploadComplete(({ file }) => uploadedImage(file)),
  projectMedia: f(mediaUploadPolicy)
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireOrganizationMediaUploadAccess(req, input, "project"))
    .onUploadComplete(({ file, metadata }) => uploadedResourceMedia(file, metadata)),
  propertyMedia: f(mediaUploadPolicy)
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireOrganizationMediaUploadAccess(req, input, "property"))
    .onUploadComplete(({ file, metadata }) => uploadedResourceMedia(file, metadata)),
  clientMedia: f(mediaUploadPolicy)
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireOrganizationMediaUploadAccess(req, input, "client"))
    .onUploadComplete(({ file, metadata }) => uploadedResourceMedia(file, metadata)),
  agentMessageAttachment: f(agentMessageAttachmentUploadPolicy)
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireAgentMessageAttachmentUploadAccess(req, input))
    .onUploadComplete(({ file, metadata }) => uploadedResourceMedia(file, metadata)),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

const uploadThingRoutes = createRouteHandler({
  router: uploadRouter,
});

export function uploadThingHandler(request: Request) {
  if (request.method === "GET" || request.method === "POST") {
    return uploadThingRoutes(request);
  }

  return new Response(null, {
    status: 405,
    headers: { allow: "GET, POST" },
  });
}

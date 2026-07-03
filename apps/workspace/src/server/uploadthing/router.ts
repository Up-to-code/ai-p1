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

const uploadRouter = {
  profilePicture: f(imageUploadPolicy)
    .middleware(({ req }) => requireSignedInUploadUser(req))
    .onUploadComplete(({ file }) => uploadedImage(file as any)),
  organizationLogo: f(imageUploadPolicy)
    .middleware(({ req }) => requireSignedInUploadUser(req))
    .onUploadComplete(({ file }) => uploadedImage(file as any)),
  projectMedia: f(mediaUploadPolicy)
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireOrganizationMediaUploadAccess(req, input as any, "project"))
    .onUploadComplete(({ file, metadata }) => uploadedResourceMedia(file as any, metadata)),
  assetMedia: f(mediaUploadPolicy)
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireOrganizationMediaUploadAccess(req, input as any, "asset"))
    .onUploadComplete(({ file, metadata }) => uploadedResourceMedia(file as any, metadata)),
  clientMedia: f(mediaUploadPolicy)
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireOrganizationMediaUploadAccess(req, input as any, "client"))
    .onUploadComplete(({ file, metadata }) => uploadedResourceMedia(file as any, metadata)),
  agentMessageAttachment: f(agentMessageAttachmentUploadPolicy)
    .input(organizationUploadInputSchema)
    .middleware(({ req, input }) => requireAgentMessageAttachmentUploadAccess(req, input as any))
    .onUploadComplete(({ file, metadata }) => uploadedResourceMedia(file as any, metadata)),
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

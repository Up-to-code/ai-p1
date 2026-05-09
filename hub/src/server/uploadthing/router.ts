import { getToken } from "@convex-dev/better-auth/utils";
import { createRouteHandler, createUploadthing, type FileRouter, UploadThingError } from "uploadthing/server";
import { convexRuntimeConfig } from "@/packages/config";

const f = createUploadthing();

async function requireSignedInUser(req: Request) {
  const token = await getToken(convexRuntimeConfig.siteUrl, new Headers(req.headers));

  if (!token.token) {
    throw new UploadThingError("You must be signed in to upload a profile picture.");
  }

  return {};
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
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

export const uploadThingHandler = createRouteHandler({
  router: uploadRouter,
});
